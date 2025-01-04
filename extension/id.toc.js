"use strict";

module.exports = (md, options) => {

    const utility = require("./utility");
    const autoNumberingParser = require("./autoNumbering.optionParser");
    const autoNumbering = require("./autoNumbering");

    const defaultOptions = {
        autoNumbering: {
            enable: false,
            pattern: [],
            defaultSuffix: ". ",
            defaultPrefix: "",
            defaultStart: 1,
            defaultSeparator: "."
        },
    }; //defaultOptions
        
    let renderedHtml, usedIds, headingSet, tocLocations;
    const cleanUp = () => {
        renderedHtml = null;
        usedIds = { headings: {}, toc: {}, excludeFromToc: {} };
        headingSet = {};
        tocLocations = [];
    };
    
    const tocIncludeLevelSet = new Set(options.thisExtensionSettings.TOC.includeLevels);
    const tocRegex = new RegExp(options.thisExtensionSettings.TOC.regex);
    const excludeFromTocRegex = new RegExp(options.thisExtensionSettings.TOC.excludeHeaderRegex);
    const enumerationRuleSetRegexp = new RegExp(options.thisExtensionSettings.TOC.autoNumberingRegex);

    md.core.ruler.before("block", "detectAutoNumbering", state => {
        options.autoNumbering = defaultOptions.autoNumbering;
        const match = enumerationRuleSetRegexp.exec(state.src);
        if (!match) return;
        try {
            const privilegedOptions = autoNumberingParser(match[1]);
            if (privilegedOptions) {
                utility.populateWithDefault(privilegedOptions, defaultOptions.autoNumbering);
                options.autoNumbering = privilegedOptions;
            } // if
        } finally {
            if (match)
                state.src = state.src.slice(match[0].length, state.src.length);
        } //exception
    }); //md.core.ruler.before

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const autoNumberGenerator = {
        init: function() {
            this.broken = false;
            this.stack = [];
            this.current = { level: undefined, indexIterator: undefined, parentPrefix: "", prefix: undefined };
            this.levelOptionDictionary = {};
        },
        newCurrent: function(level) {
            const effectiveLevelOptions = this.getEffectiveLevelOptions(level);
            return { level: level, indexIterator: new autoNumbering.Iterator(effectiveLevelOptions.start), parentPrefix: this.current.prefix, prefix: undefined, standalone: false };
        },
        brokenContent: function() { return `${options.thisExtensionSettings.TOC.autoNumbering.brokenHierarchy}`; },
        getEffectiveLevelOptions: function(level) {
            if (level in this.levelOptionDictionary)
                return this.levelOptionDictionary[level];
            const effectiveOptions = autoNumbering.getEffectiveLevelOptions(options, level);
            this.levelOptionDictionary[level] = effectiveOptions;
            return effectiveOptions;
        },
        formPrefix: function(effectiveLevelOptions) {
            this.current.prefix = this.current.indexIterator.toString();
            this.current.indexIterator.next();
            if (this.current.parentPrefix && (!effectiveLevelOptions.standalone))
            this.current.prefix = `${this.current.parentPrefix}${effectiveLevelOptions.separator}${this.current.prefix}`;
        },
        numberedContent: function(effectiveLevelOptions) {
            return `${effectiveLevelOptions.prefix}${this.current.prefix}${effectiveLevelOptions.suffix}`;
        },
        generate: function (tocLevel) {
            if (!options.autoNumbering.enable) return "";
            if (!tocIncludeLevelSet.has(tocLevel + 1)) return "";
            if (this.broken) return this.brokenContent();
            const effectiveLevelOptions = this.getEffectiveLevelOptions(tocLevel);
            if (this.current.level == undefined) {
                this.current.level = tocLevel;
                this.current.indexIterator = new autoNumbering.Iterator(effectiveLevelOptions.start);
            } else if (tocLevel == this.current.level) {
                ++this.current.index;
            } else if (tocLevel == this.current.level + 1) {
                this.stack.push(this.current);
                this.current = this.newCurrent(tocLevel);
            } else if (tocLevel < this.current.level) {
                const popCount = this.current.level - tocLevel;
                if (popCount > this.stack.length) {
                    this.broken = true;
                    return this.brokenContent();
                } //if
                let last = undefined;
                for (let index = 0; index < popCount; ++index)
                    last = this.stack.pop();
                this.current = last;
                ++this.current.index;
            } else {
                this.broken == true;
                return this.brokenContent();
            } //if
            this.formPrefix(effectiveLevelOptions);
            return this.numberedContent(effectiveLevelOptions);
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
            for (let index in headingSet) {
                headingSet[index].tocLevel = headingSet[index].level;
                headingSet[index].level -= zeroIndent;
            }      
        })();
        renderedHtml = `\n`;
        for (let index in headingSet) {
            let element = headingSet[index];
            if (!tocIncludeLevelSet.has(element.tocLevel + 1)) continue;
            renderedHtml += `<a style="margin-left: ${element.level * options.thisExtensionSettings.TOC.itemIndentInEm}em;" href="#${element.id}">${element.content}</a><br/>\n`;
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
            const id = utility.slugify(contentToken.content, usedIds, options.thisExtensionSettings.headingIdPrefix);
            const level = utility.htmlHeadingLevel(token.tag);
            const prefix = autoNumberGenerator.generate(level);
            headingSet[index] = { index: index, id: id, content: prefix + contentToken.content, prefix: prefix, level: level, tag: token.tag };
        } // loop state.tokens
    }); //md.core.ruler.after

    const previousRenderHeadingOpen = md.renderer.rules.heading_open;
    md.renderer.rules.heading_open = (tokens, index, ruleOptions, object, renderer) => {
        const heading = headingSet[index];
        if (!heading)
            return utility.renderDefault(tokens, index, ruleOptions, object, renderer, previousRenderHeadingOpen, `<${tokens[index].tag}>`);
        return `<${headingSet[index].tag} id="${headingSet[index].id}">${headingSet[index].prefix}`;
    }; //md.renderer.rules.heading_open

    // to remove data-... from links
    const previousLinkOpen = md.renderer.rules.link_open;
    md.renderer.rules.link_open = (tokens, index, ruleOptions, object, renderer) => {
        let attributes = [];
        if (tokens[index].type == "link_open") {
            for (let attribute of tokens[index].attrs) {
                if (!attribute[0].startsWith("data-"))
                    attributes.push(`${attribute[0]}="${attribute[1]}"`);
            } //loop
        } //if
        let open = "<a>";
        if (attributes.length > 0)
            open = `<a ${attributes.join(' ')}>`;
        return utility.renderDefault(tokens, index, ruleOptions, object, renderer, previousLinkOpen, open);
    }; //md.renderer.rules.heading_open

    const previousRenderParagraphOpen = md.renderer.rules.paragraph_open;
    md.renderer.rules.paragraph_open = (tokens, index, ruleOptions, object, renderer) => {
        for (let tocLocation of tocLocations)
            if (index == tocLocation)
                return `<p class="${options.thisExtensionSettings.TOC.containerClass}">${buildToc()}`;
        return utility.renderDefault(tokens, index, ruleOptions, object, renderer, previousRenderParagraphOpen, `<p>`);
    }; //md.renderer.rules.paragraph_open

}; //module.exports
