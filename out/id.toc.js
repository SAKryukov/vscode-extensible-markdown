"use strict";

const defaultOptions = {
    enableHeadingId: true,
    autoNumbering: {
        "pattern": [],
        "defaultSuffix": ". ",
        "defaultPrefix": "",
        "defaultStart": 1,
        "defaultSeparator": "."
    },
    autoNumberingRegex: "\\[\\]\\(\\=numbering([\\s\\S]*?)\\=\\)",
    includeLevel: [2, 4, 5, 6],
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

module.exports = function (md, userOptions) {

    const util = require("util");

    const options = defaultOptions;
    if (userOptions)
        for (let index in userOptions)
            options[index] = userOptions[index];

    // no magic function names:
    const tocFunctionNames = { open: "tocOpen", close: "tocClose", body: "tocBody" };
    const ruleName = "toc"; // works with null, but let's care about other plug-ins
    let firstTime = true;
    let usedIds = { headings: {}, toc: {}, excludeFromToc: {} };
    let idCounts = { headings: 0, toc: 0 };
    let idSet = [];

    // entry point:
    md.core.ruler.before("inline", "buildToc", function (state) {
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
        idCounts = { headings: 0, toc: 0 };
        idSet = [];
        buildIdSet(idSet, state.tokens, excludeFromTocRegex);
        addIdAttributes();
        if (!doToc) return;
        createToc(state);
        detectAndPushToc(tocRegexp);
        firstTime = false;
    }); //md.core.ruler.before

    const slugify = function (s, used) {
        let slug = options.idPrefix +
            s.replace(' ', '-')
                .replace(/[^A-Za-z0-9\-\.\_]/g, function (match) {
                    return match.codePointAt().toString(16);
                }).toLowerCase();
        while (used[slug])
            slug += '.';
        used[slug] = slug;
        return slug;
    } // idHeadersSlugify    

    function headingLevel(token) { return token.tag && parseInt(token.tag.substr(1, 1)); }

    function nextNumber(number) { // number is a letter of a number as string or numeric
        let tryNumeric = parseInt(number);
        if (isNaN(tryNumeric)) {
            let codePoint = number.codePointAt();
            return String.fromCodePoint(++codePoint);
        } else
            return (++tryNumeric).toString();
    } //nextNumber    

    function autoNumbering() {
        function getOption(optionSet, level, property, defaultValue) {
            if (!defaultValue) defaultValue = '';
            if (!optionSet) return defaultValue;
            const pattern = optionSet.pattern;
            if (!pattern) return defaultValue;
            const arrayElement = pattern[level - 1];
            if (!arrayElement) return defaultValue;
            const propertyValue = arrayElement[property];
            if (!propertyValue) return defaultValue;
            return propertyValue;
        } //getOption
        function getDocumentLevelOptions(tokens) {
            if (tokens.length < 3) return;
            if (!options.autoNumberingRegex) return;
            if (tokens[0].type != "paragraph_open" || tokens[1].type != "inline" || tokens[2].type != "paragraph_close")
                return;
            let regexp;
            try {
                regexp = new RegExp(options.autoNumberingRegex);
            } catch (ex) {
                tokens[1].content = util.format(
                    "<h1>Invalid auto-numbering Regular Expression: %s<br/><br/>%s</h1>",
                    ex.toString(),
                    options.autoNumberingRegex);
                return;
            } //exception
            let failedJsonParse = false;
            try {
                const match = regexp.exec(tokens[1].content);
                if (!match) return;
                if (!match.length) return;
                if (match.length < 2) return;
                return JSON.parse(match[1]);
            } catch (ex) {
                failedJsonParse = true;
                let val = util.format("Invalid auto-numbering JSON structure: %s", ex.toString());
                tokens[1].content = util.format("<h1>Invalid auto-numbering JSON structure: %s:</h1>", ex.toString())
                    + tokens[1].content;
            } finally {
                if (!failedJsonParse)
                    tokens.splice(0, 3);
            } //exception
        } //getDocumentLevelOptions
        const initializeAutoNumbering = function (tokens) {
            let effectiveOptions = getDocumentLevelOptions(tokens);
            if (!effectiveOptions) effectiveOptions = options.autoNumbering;
            if (!effectiveOptions) return null;
            const theSet = {
                level: -1,
                levels: [],
                effectiveOptions: effectiveOptions,
                getSeparator: function (level) {
                    return getOption(effectiveOptions, level, "separator", effectiveOptions.defaultSeparator);
                },
                getStart: function (level) {
                    return getOption(effectiveOptions, level, "start", effectiveOptions.defaultStart)
                },
                getPrefix: function (level) {
                    return getOption(effectiveOptions, level, "prefix", effectiveOptions.defaultPrefix);
                },
                getSuffix: function (level) {
                    return getOption(effectiveOptions, level, "suffix", effectiveOptions.defaultSuffix);
                },
                getStandAlong: function (level) {
                    return getOption(effectiveOptions, level, "standAlong", effectiveOptions.defaultPrefix);
                }
            }; //theSet
            theSet.getAccumulator = function (level) {
                if (!theSet.levels[theSet.level]) return '';
                if (!theSet.levels[theSet.level].accumulator)
                    return theSet.levels[theSet.level].number;
                return theSet.levels[theSet.level].accumulator
                    + theSet.getSeparator(theSet.level)
                    + theSet.levels[theSet.level].number
            }; //theSet.getAccumulator
            theSet.getNumberingText = function (level) {
                const standAlong = theSet.getStandAlong(level);
                return (!standAlong) && theSet.levels[level].accumulator.length > 0 ?
                    theSet.levels[level].accumulator
                    + theSet.getSeparator(level)
                    + theSet.levels[level].number.toString()
                    : theSet.levels[level].number.toString();
            }; //theSet.getNumberingText
            return theSet;
        }; //initializeAutoNumbering
        const iterateAutoNumbering = function (excludeFromToc, autoSet, token) {
            if (!autoSet) return '';
            if (excludeFromToc) return '';
            const level = headingLevel(token);
            if (!autoSet.levels[level])
                autoSet.levels[level] = { number: autoSet.getStart(level) };
            if (level > autoSet.level) {
                autoSet.levels[level].number = autoSet.getStart(level);
                autoSet.levels[level].accumulator = autoSet.getAccumulator(level);
            } else
                autoSet.levels[level].number = nextNumber(autoSet.levels[level].number);
            const result = autoSet.getNumberingText(level);
            const prefix = autoSet.getPrefix(level);
            const suffix = autoSet.getSuffix(level);
            autoSet.level = level;
            return prefix + result + suffix;
        }; //iterateAutoNumbering
        return { initializer: initializeAutoNumbering, iterator: iterateAutoNumbering };
    } //autoNumbering

    function buildIdSet(idSet, tokens, excludeFromTocRegex) {
        const autoNumberingMethods = autoNumbering();
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
        const headingOpenPrevious = md.renderer.rules.heading_open;
        md.renderer.rules.heading_open = function (tokens, index, userOptions, object, renderer) {
            tokens[index].attrs = tokens[index].attrs || [];
            let title = tokens[index + 1].children.reduce(function (accumulator, child) {
                return accumulator + child.content;
            }, "");
            const headingSlug = idSet[idCounts.headings].id;
            tokens[index].attrs.push(["id", headingSlug]);
            const prefix = idSet[idCounts.headings].prefix;
            ++idCounts.headings;
            if (headingOpenPrevious)
                return headingOpenPrevious.apply(this, arguments) + prefix;
            else
                return renderer.renderToken.apply(renderer, arguments) + prefix;
            //SA!!! APPEND text to return to add prefix to heading content
        }; //md.renderer.rules.heading_open
    } //addIdAttributes

    function createToc(state) {
        if (!firstTime) return;
        md.renderer.rules[tocFunctionNames.open] = function (tokens, index) {
            return util.format("<div class=\"%s\">", options.tocContainerClass);
        }; // open
        md.renderer.rules[tocFunctionNames.body] = function (tokens, index) {
            return createTocTree(0, state.tokens)[1];
        }; //body
        md.renderer.rules[tocFunctionNames.close] = function (tokens, index) {
            return "</div>";
        }; //close
    } //createToc

    function detectAndPushToc(tocRegexp) {
        if (!firstTime) return;
        md.inline.ruler.before("text", ruleName, function toc(state, silent) {
            if (silent) return false;
            const match = tocRegexp.exec(state.src);
            if (!match) return false;
            if (match.length < 1) return false;
            state.push(tocFunctionNames.open, ruleName, 1);
            state.push(tocFunctionNames.body, ruleName, 0);
            state.push(tocFunctionNames.close, ruleName, -1);
            state.src = "";
            return true;
        });
    } //detectAndPushToc

    function createTocTree(tokenIndex, tokens) {
        let headings = [],
            listItemContent = "",
            currentLevel,
            subHeadings,
            currentTokenIndex = tokenIndex;
        const size = tokens.length;
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
                ++idCounts.toc; // one id is skipped
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
            const tocSlug = idSet[idCounts.toc].id;
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
            if (options.listElementAttributeSets.length < 1)
                for (let index in options.defaultListElementAttributeSet)
                    elementAttributes += util.format(" %s=\"%s\"",
                        index,
                        options.defaultListElementAttributeSet[index]);
        return util.format("<%s%s>%s</%s>", listTag, elementAttributes, headings.join(""), listTag);
    } //listElement

}; //module.exports
