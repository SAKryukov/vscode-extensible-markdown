"use strict";

const defaultOptions = {
    enableHeadingId: true,
    autoNumberingRegex: "^\\@\\(numbering\\s*?(\\{[\\s\\S]*?)\\}\\s*?\\)",
    autoNumbering: {
        "enable": false,
        "pattern": [],
        "defaultSuffix": ". ",
        "defaultPrefix": "",
        "defaultStart": 1,
        "defaultSeparator": "."
    },
    includeLevel: [1, 2, 3, 4, 5, 6],
    tocContainerClass: "toc",
    tocRegex: "^\\@toc$",
    excludeFromTocRegex: "\\{notoc\\}",
    tocItemIndentInEm: 2,
    headingIdPrefix: "heading."
}; //defaultOptions

module.exports = (md, options) => {

    const util = require("util");
    const utility = require("./utility");
    const autoNumberingParser = require("./autoNumbering.optionParser");

    let renderedHtml, usedIds, headingSet, tocLocations;
    const cleanUp = () => {
        renderedHtml = null;
        usedIds = { headings: {}, toc: {}, excludeFromToc: {} };
        headingSet = {};
        tocLocations = [];
    };
    
    if (options) {
        const isObject = obj => { return obj && obj.constructor == Object; };
        function clone(source) {
            let target = {};
            for (let index in source)
                if (source.hasOwnProperty(index))
                    if (isObject(source[index]))
                        target[index] = clone(source[index]);
                    else
                        target[index] = source[index];
            return target;
        } //clone
        options = clone(options);    
    } else
        options = {};

    utility.populateWithDefault(options, defaultOptions);

    const tocRegex = new RegExp(options.tocRegex);
    const excludeFromTocRegex = new RegExp(options.excludeFromTocRegex);

    md.core.ruler.before("block", "detectAutoNumbering", state => {
        let regexp;
        try {
            regexp = new RegExp(options.autoNumberingRegex);
        } catch (ex) {
            state.src = util.format(
                "<h1>Invalid auto-numbering Regular Expression: %s<br/><br/>%s</h1>",
                ex.toString(),
                options.autoNumberingRegex);
            return;
        } //exception
        let failedJsonParse = false;
        let match;
        try {
            match = regexp.exec(state.src);
            if (!match) return;
            if (!match.length) return;
            if (match.length < 2) return;
            let privilegedOptions = JSON.parse(match[1]);
            utility.populateWithDefault(privilegedOptions, options.autoNumbering);
            options.autoNumbering = privilegedOptions;
        } catch (ex) {
            // alternative:
            let privilegedOptions;
            try {
                privilegedOptions = autoNumberingParser(match[1]);
                if (privilegedOptions) {
                    utility.populateWithDefault(privilegedOptions, options.autoNumbering);
                    options.autoNumbering = privilegedOptions;
                    return;
                } // else let exception go
            } catch (newFormatException) {
                // continue with JSON
            }
            // end alternative
            failedJsonParse = true;
            const errorString = ex.toString();
            const errorTerms = errorString.split(' ');
            let errorPosition;
            for (const term of errorTerms) {
                errorPosition = parseInt(term);
                if (errorPosition) break;
            } //loop
            let matchText = match[1] && match[1].length > 0 ? match[1] : '';
            if (errorPosition && matchText) {
                matchText = [
                    matchText.slice(0, errorPosition),
                    "<b style=\"background-color:red; color:yellow;\"> &blacktriangleright;</b>",
                    matchText.slice(errorPosition)].join('');
            } //if
            state.src = util.format(
                "<h1>Invalid auto-numbering JSON structure:</h1><h1>%s:</h1><big><pre>%s</pre></big>",
                errorString,
                matchText);
        } finally {
            if (match && !failedJsonParse)
                state.src = state.src.slice(match[0].length, state.src.length);
        } //exception
    }); //md.core.ruler.before

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const autoNumberGenerator = {
        init: function (){
            this.broken = false;
            this.stack = [];
            this.current = { level: undefined, index: 0, parentPrefix: "", prefix: undefined };
            this.levelOptionDictionary = {};
        },
        newCurrent: function(level) {
            return { level: level, index: 0, parentPrefix: this.current.prefix, prefix: undefined, standAlong: false };
        },
        brokenContent: function(content) { return `???. ${content}`; },
        getEffectiveLevelOptions: function(level) {
            if (level in this.levelOptionDictionary)
                return this.levelOptionDictionary[level];
            const effectiveOptions = {
                suffix: options.autoNumbering.defaultSuffix,
                prefix: options.autoNumbering.defaultPrefix,
                start: options.autoNumbering.defaultStart,
                separator: options.autoNumbering.defaultSeparator,
                standAlong: false
            };
            if (!options.autoNumbering.pattern[level]) return effectiveOptions;
            if (options.autoNumbering.pattern[level].suffix != undefined) effectiveOptions.suffix = options.autoNumbering.pattern[level].suffix;
            if (options.autoNumbering.pattern[level].prefix != undefined) effectiveOptions.prefix = options.autoNumbering.pattern[level].prefix;
            if (options.autoNumbering.pattern[level].start != undefined) effectiveOptions.start = options.autoNumbering.pattern[level].start;
            if (options.autoNumbering.pattern[level].separator != undefined) effectiveOptions.separator = options.autoNumbering.pattern[level].separator;
            if (options.autoNumbering.pattern[level].standAlong != undefined) effectiveOptions.standAlong = options.autoNumbering.pattern[level].standAlong;
            return effectiveOptions;
        },
        formPrefix: function(effectiveLevelOptions) {
            this.current.prefix = `${(this.current.index + 1).toString()}`; 
            if (this.current.parentPrefix && (!effectiveLevelOptions.standAlong))
            this.current.prefix = `${this.current.parentPrefix}${effectiveLevelOptions.separator}${this.current.prefix}`;
        },
        numberedContent: function(content, effectiveLevelOptions) {
            return `${effectiveLevelOptions.prefix}${this.current.prefix}${effectiveLevelOptions.suffix}${content}`;
        },
        generate: function (tocLevel, content) {
            if (!options.autoNumbering.enable) return content;
            if (this.broken) return this.brokenContent(content);
            if (this.current.level == undefined) {
                this.current.level = tocLevel;
            } else if (tocLevel == this.current.level) {
                ++this.current.index;
            } else if (tocLevel == this.current.level + 1) {
                this.stack.push(this.current);
                this.current = this.newCurrent(tocLevel);
            } else if (tocLevel < this.current.level) {
                const popCount = this.current.level - tocLevel;
                if (popCount > this.stack.length) {
                    this.broken = true;
                    return this.brokenContent(content);
                } //if
                let last = undefined;
                for (let index = 0; index < popCount; ++index)
                    last = this.stack.pop();
                this.current = last;
                ++this.current.index;
            } else {
                this.broken == true;
                return this.brokenContent(content);
            } //if
            const effectiveLevelOptions = this.getEffectiveLevelOptions(tocLevel);
            this.formPrefix(effectiveLevelOptions);
            return this.numberedContent(content, effectiveLevelOptions);
        },
    }; //autoNumberGenerator

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const buildToc = () => {
        if (renderedHtml) return renderedHtml;
        (() => {
            let zeroIndent = Number.MAX_VALUE;
            for (let index in headingSet) {
                const level = headingSet[index].level;
                if (level < zeroIndent) zeroIndent = level;
            } //loop zeroIndent
            for (let index in headingSet)
                headingSet[index].level -= zeroIndent;        
        })();
        renderedHtml = `\n`;
        for (let index in headingSet) {
            let element = headingSet[index];
            renderedHtml += `<a style="margin-left: ${element.level * options.tocItemIndentInEm}em;" href="#${element.id}">${element.content}</a><br/>\n`;
        } //loop
        return renderedHtml;
    }; //buildToc

    md.core.ruler.after("block", "buildToc", state => {
        cleanUp();
        autoNumberGenerator.init();
        for (let index = 0; index < state.tokens.length; ++index) {
            const token = state.tokens[index];
            const isParagraph = token.type == "paragraph_open";
            const isHeading = token.type == "heading_open";
            if (!isParagraph && !isHeading) continue;
            const contentToken = state.tokens[index + 1];
            if (isParagraph)
                if (tocRegex.exec(contentToken.content)) {
                    tocLocations.push(index);
                    utility.cleanInline(contentToken, tocRegex);
                }
            if (!isHeading) continue;
            if (excludeFromTocRegex.exec(contentToken.content)) {
                utility.cleanInline(contentToken, excludeFromTocRegex);
                continue;
            } 
            const id = utility.slugify(contentToken.content, usedIds, options.headingIdPrefix);
            const level = utility.htmlHeadingLevel(token.tag);
            const content = autoNumberGenerator.generate(level, contentToken.content);
            headingSet[index] = { index: index, id: id, content: content, level: level, tag: token.tag };
        } // loop state.tokens
    }); //md.core.ruler.after

    const previousRenderHeadingOpen = md.renderer.rules.heading_open;
    md.renderer.rules.heading_open = (tokens, index, initialOptions, object, renderer) => {
        const heading = headingSet[index];
        if (!heading)
            return utility.renderDefault(tokens, index, options, object, renderer, previousRenderHeadingOpen, `<${tokens[index].tag}>`);
        return `<${headingSet[index].tag} id="${headingSet[index].id}">`;
    }; //md.renderer.rules.heading_open

    const previousRenderParagraphOpen = md.renderer.rules.paragraph_open;
    md.renderer.rules.paragraph_open = (tokens, index, initialOptions, object, renderer) => {
        for (let tocLocation of tocLocations)
            if (index == tocLocation)
                return `<p class="${options.tocContainerClass}">${buildToc()}`;
        return utility.renderDefault(tokens, index, options, object, renderer, previousRenderParagraphOpen, `<p>`);
    }; //md.renderer.rules.paragraph_open

}; //module.exports
