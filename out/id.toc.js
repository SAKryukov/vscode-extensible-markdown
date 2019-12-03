"use strict";

const defaultOptions = {
    enableHeadingId: true,
    autoNumberingRegex: "^\\[\\]\\(\\=numbering([\\s\\S]*?)\\=\\)",
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
    tocRegex: "^\\[\\]\\(toc\\)",
    excludeFromTocRegex: "\\[\\]\\(notoc\\)",
    defaultListElement: "ul",
    listElements: ["ul", "ul", "ul", "ul", "ul", "ul"],
    defaultListElementAttributeSet: { style: "list-style-type: none;" },
    listElementAttributeSets: [],
    headingIdPrefix: "heading."
}; //defaultOptions
defaultOptions.bulletedListType = defaultOptions.defaultListElement;

module.exports = (md, options) => {

    const util = require("util");
    const utility = require("./utility");
    const autoNumbering = require("./autoNumbering");
    const autoNumberingParser = require("./autoNumbering.optionParser");

    let renderedHtml = null;
    let usedIds = { headings: {}, toc: {}, excludeFromToc: {} };
    let headingSet = {};
    let tocLocations = [];
    const cleanUp = () => {
        renderedHtml = null;
        usedIds = { headings: {}, toc: {}, excludeFromToc: {} };
        headingSet = {};
        tocLocations = [];
    };
    cleanUp();
    
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
        renderedHtml = "\n";
        for (let index in headingSet) {
            let element = headingSet[index];
            renderedHtml += `<p style="margin:0; margin-left: ${(element.level + 1) * 2}em;"><a href="#${element.id}">${element.content}</a></p>\n`;
        } //loop
        return renderedHtml;
    }; //buildToc

    md.core.ruler.after("block", "buildToc", state => {
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
            headingSet[index] = { index: index, id: id, content: contentToken.content, level: utility.htmlHeadingLevel(token.tag), tag: token.tag };
        } // loop state.tokens
    }); //md.core.ruler.after

    md.core.ruler.before("normalize", "cleanUp", state => { cleanUp(); });

    const previousRenderHeadingOpen = md.renderer.rules.heading_open;
    md.renderer.rules.heading_open = (tokens, index, options, object, renderer) => {
        const heading = headingSet[index];
        if (!heading)
            return utility.renderDefault(tokens, index, options, object, renderer, previousRenderHeadingOpen, `<${tokens[index].tag}>`);
        return `<${headingSet[index].tag} id="${headingSet[index].id}">`;
    }; //md.renderer.rules.heading_open

    const previousRenderParagraphOpen = md.renderer.rules.paragraph_open;
    md.renderer.rules.paragraph_open = (tokens, index, options, object, renderer) => {
        for (let tocLocation of tocLocations)
            if (index == tocLocation)
                return `<p>${buildToc()}`;
        return utility.renderDefault(tokens, index, options, object, renderer, previousRenderParagraphOpen, `<p>`);
    }; //md.renderer.rules.paragraph_open

}; //module.exports
