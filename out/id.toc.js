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
    idPrefix: "headings."
}; //defaultOptions
defaultOptions.bulletedListType = defaultOptions.defaultListElement;

module.exports = (md, options) => {

    const util = require("util");
    const autoNumbering = require("./autoNumbering");
    const autoNumberingParser = require("./autoNumbering.optionParser");

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

    populateWithDefault(options, defaultOptions);

    // no magic function names:
    const ruleName = "toc"; // works with null, but let's care about other plug-ins
    let firstTime = true;
    let usedIds = { headings: {}, toc: {}, excludeFromToc: {} };
    let idCounts = { headings: 0, toc: 0 };
    let idSet = [];

    md.core.ruler.before("normalize", "detectAutoNumbering", state => {
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
            populateWithDefault(privilegedOptions, options.autoNumbering);
            options.autoNumbering = privilegedOptions;
        } catch (ex) {
            // alternative:
            let privilegedOptions;
            try {
                privilegedOptions = autoNumberingParser(match[1]);
                if (privilegedOptions) {
                    populateWithDefault(privilegedOptions, options.autoNumbering);
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

    md.core.ruler.before("inline", "buildToc", state => {
        if (!options.enableHeadingId)   // inconsistent with having toc/no-toc tags, 
            return;                     // so leave them as is
        let tocRegexp = options.tocRegex;
        if (tocRegexp.constructor != RegExp)
            tocRegexp = new RegExp(options.tocRegex, "m");
        // extra global check saves time if there is no match:
        let doToc = false;
        if (tocRegexp) {
            const match = tocRegexp.exec(state.src);
            doToc = match != null;
        } //if
        let excludeFromTocRegex = options.excludeFromTocRegex;
        if (excludeFromTocRegex.constructor != RegExp)
            excludeFromTocRegex = new RegExp(options.excludeFromTocRegex, "m");
        //
        usedIds = { headings: {}, toc: {}, excludeFromToc: {} };
        idSet = [];
        buildIdSet(idSet, state.tokens, excludeFromTocRegex);
        addIdAttributes();
        if (!doToc) return;
        createToc(state);
        detectAndPushToc(tocRegexp);
        firstTime = false;
    }); //md.core.ruler.before

    const slugify = (s, used) => {
        let slug = options.idPrefix +
            s.replace(/ /g, '-')
                .replace(/[^A-Za-z0-9\-\.\_]/g, match => { return match.codePointAt().toString(16); }).toLowerCase();
        while (used[slug])
            slug += '.';
        used[slug] = slug;
        return slug;
    } // idHeadersSlugify    

    function headingLevel(token) { return token.tag && parseInt(token.tag.substr(1, 1)); }

    function buildIdSet(idSet, tokens, excludeFromTocRegex) {
        const autoNumberingMethods = autoNumbering(options, headingLevel);
        const autoSet = autoNumberingMethods.initializer(tokens);
        for (let index = 1; index < tokens.length; ++index) {
            const token = tokens[index];
            const headingTextToken = tokens[index - 1];
            if (token.type !== "heading_close" || headingTextToken.type !== "inline") continue;
            let excludeFromToc = false;
            if (excludeFromTocRegex) {
                const oldContent = headingTextToken.content;
                headingTextToken.content = headingTextToken.content.replace(excludeFromTocRegex, "");
                excludeFromToc = oldContent !== headingTextToken.content;
                if (excludeFromToc)
                    usedIds.excludeFromToc[index] = token;
            } //if
            idSet.push({
                id: slugify(headingTextToken.content, usedIds),
                prefix: autoNumberingMethods.iterator(excludeFromToc, autoSet, token)
            });
        } //loop
    } //buildIdSet

    function addIdAttributes() {
        if (!firstTime) return;
        //const headingOpenPrevious = md.renderer.rules.heading_open; //SA??? removed to disable VSCode classes and id attributes
        md.renderer.rules.heading_open = function (tokens, index, options, object, renderer) {
            tokens[index].attrs = tokens[index].attrs || [];
            let title = tokens[index + 1].children.reduce((accumulator, child) => {
                return accumulator + child.content;
            }, "");
            // some not-so-pathological cases create redundant md.renderer.rules.heading_open call, so:
            let prefix = '';
            if (idSet[idCounts.headings]) {
                const headingSlug = idSet[idCounts.headings].id;
                tokens[index].attrs.push(["id", headingSlug]);
                prefix = idSet[idCounts.headings].prefix;
                ++idCounts.headings;
            } //if
            // if (headingOpenPrevious) //SA??? removed to disable VSCode classes and id attributes
            //     return headingOpenPrevious.apply(this, arguments) + prefix;
            // else
            return renderer.renderToken.apply(renderer, arguments) + prefix;
            //SA!!! APPEND text to return to add prefix to heading content
        }; //md.renderer.rules.heading_open
    } //addIdAttributes

    function createToc(state) {
        md.renderer.rules[ruleName] = function (tokens, index) {
            return createTocTree(0, state.tokens)[1];
        }; //body
    } //createToc

    function detectAndPushToc(tocRegexp) {
        if (!firstTime) return;
        md.inline.ruler.before("text", ruleName, function toc(state, silent) {
            if (silent) return false;
            const match = tocRegexp.exec(state.src);
            if (!match) return false;
            if (match.length < 1) return false;
            state.push(ruleName, 0);
            state.src = "";
            return true;
        }); //md.inline.ruler.before
    } //detectAndPushToc

    function createTocTree(tokenIndex, tokens) {
        let headings = [],
            listItemContent = "",
            currentLevel,
            subHeadings,
            currentTokenIndex = tokenIndex;
        const size = tokens.length;
        idCounts = { headings: 0, toc: 0 };
        while (currentTokenIndex < size) {
            const token = tokens[currentTokenIndex];
            const heading = tokens[currentTokenIndex - 1];
            if (!heading) { currentTokenIndex++; continue; }
            const level = headingLevel(token);
            if (token.type !== "heading_close" || heading.type !== "inline") {
                currentTokenIndex++;
                continue;
            } //if
            if (usedIds.excludeFromToc[currentTokenIndex] == token || options.includeLevel.indexOf(level) == -1) {
                currentTokenIndex++;
                ++idCounts.toc; // one id is skipped //SA???
                continue;
            } //if
            if (currentLevel) {
                if (level > currentLevel) {
                    subHeadings = createTocTree(currentTokenIndex, tokens, usedIds, idCounts, idSet);
                    listItemContent += subHeadings[1];
                    currentTokenIndex = subHeadings[0];
                    continue;
                } //if
                if (level < currentLevel) {
                    listItemContent += "</li>";
                    headings.push(listItemContent);
                    return [currentTokenIndex, listElement(currentLevel, options, headings)];
                } //if
                if (level == currentLevel) {
                    listItemContent += "</li>";
                    headings.push(listItemContent);
                } //if
            } else
                currentLevel = level; // We init with the first found level
            const tocSlug = idSet[idCounts.toc].id; // SA??? bug here
            const prefix = idSet[idCounts.toc].prefix;
            ++idCounts.toc;
            listItemContent = util.format("<li>%s<a href=\"#%s\">", prefix, tocSlug);
            if (options.itemPrefixes)
                if (options.itemPrefixes[currentLevel - 1])
                    headingContent = options.itemPrefixes[currentLevel - 1] + headingContent;
            listItemContent += heading.content;
            listItemContent += "</a>";
            currentTokenIndex++;
        } //loop
        listItemContent += "</li>";
        headings.push(listItemContent);
        return [tokens.length, listElement(currentLevel, options, headings)];
    } //createTocTree

    function listElement(level, options, headings) {
        let listTag = options.defaultListElement;
        if (options.listElements)
            if (options.listElements[level - 1])
                listTag = options.listElements[level - 1];
        let elementAttributes = "";
        if (options.listElementAttributeSets)
            if (options.listElementAttributeSets[level - 1])
                for (let index in options.listElementAttributeSets[level - 1])
                    elementAttributes += util.format(" %s=\"%s\"", index, options.listElementAttributeSets[level - 1][index]);
        if (options.listElementAttributeSets)
            for (const index in options.defaultListElementAttributeSet)
                if (options.listElementAttributeSets.length < 1)
                    elementAttributes += " " + `${index}="${options.defaultListElementAttributeSet[index]}"`;
        return `<${listTag}${elementAttributes} class="${options.tocContainerClass}">${headings.join("")}</${listTag}>`;
    } //listElement

    function populateWithDefault(value, defaultValue) { // special edition: it does not populate Array
        if (!defaultValue) return;
        if (!value) return;
        if (defaultValue.constructor == Object && value.constructor == Object) {
            for (const index in defaultValue)
                if (!(index in value))
                    value[index] = defaultValue[index];
                else
                    populateWithDefault(value[index], defaultValue[index]);
        } else
            value = defaultValue;
    } //populateWithDefault

}; //module.exports
