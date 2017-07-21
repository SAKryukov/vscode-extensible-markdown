"use strict";

const defaultOptions = {
    enableHeadingId: true,
    includeLevel: [1, 2, 3, 4, 5, 6],
    tocContainerClass: "toc",
    tocRegex: "^\\[\\]\\(toc\\)",
    excludeFromTocRegex: "\\[\\]\\(notoc\\)",
    defaultListElement: "ul",
    listElements: ["ul", "ul", "ul", "ul", "ul", "ul"],
    defaultListElementAttributeSet: { style: "list-style-type: none;" },
    listElementAttributeSets: [],
    itemPrefixes: [], // array of strings: prefix depending on level
    idPrefix: "headings.",
    format: undefined
}; //defaultOptions
defaultOptions.bulletedListType = defaultOptions.defaultListElement;

module.exports = function (md, userOptions) {

    const string = require("./node_modules/string");
    const util = require("util");

    const options = defaultOptions;
    if (userOptions)
        for (let index in userOptions)
            options[index] = userOptions[index];

    const slugify = function (s, used) {
        let slug = options.idPrefix + string(s).slugify().toString();
        while (used[slug])
            slug += '.';
        used[slug] = slug;
        return slug;
    } // idHeadersSlugify

    // function nextNumber(number) { // number is a letter of a number as string or numeric
    //     let tryNumeric = parseInt(number);
    //     if (isNaN(tryNumeric)) {
    //         let codePoint = number.codePointAt();
    //         return String.fromCodePoint(++codePoint);
    //     } else
    //         return (++tryNumeric).toString();
    // } //nextNumber

    let tocRegexp = options.tocRegex;
    if (tocRegexp.constructor != RegExp)
        tocRegexp = new RegExp(options.tocRegex, "m");
    let excludeFromTocRegex = options.excludeFromTocRegex;
    if (excludeFromTocRegex.constructor != RegExp)
        excludeFromTocRegex = new RegExp(options.excludeFromTocRegex, "m");

    const usedIDs = { headings: {}, toc: {} };

    // Heading id: ///////////////////////////////////////////

    let originalHeadingOpen = md.renderer.rules.heading_open;

    md.renderer.rules.heading_open = function (tokens, idx, something, somethingelse, self) {
        tokens[idx].attrs = tokens[idx].attrs || [];
        let title = tokens[idx + 1].children.reduce(function (acc, t) {
            return acc + t.content;
        }, "");
        let slug = slugify(title, usedIDs.headings);
        tokens[idx].attrs.push(["id", slug]);
        if (originalHeadingOpen)
            return originalHeadingOpen.apply(this, arguments);
        else
            return self.renderToken.apply(self, arguments);
        //SA!!! APPENT text to return to add prefix to heading content
    }; //md.renderer.rules.heading_open

    // TOC: //////////////////////////////////////////////////

    let gstate;

    function toc(state, silent) {
        let token;
        let match;
        //
        // Reject if the token does not start with [
        if (state.src.charCodeAt(state.pos) !== 0x5B) // [
            return false;
        // Don't run any pairs in validation mode
        if (silent)
            return false;
        //
        // Detect TOC markdown
        match = tocRegexp.exec(state.src);
        match = !match ? [] : match.filter(function (m) { return m; });
        if (match.length < 1)
            return false;
        //
        // Build content
        token = state.push("toc_open", "toc", 1);
        token = state.push("toc_body", "", 0);
        token = state.push("toc_close", "toc", -1);
        //
        // Update pos so the parser can continue
        let newline = state.src.indexOf("\n");
        if (newline !== -1)
            state.pos = state.pos + newline;
        else
            state.pos = state.pos + state.posMax + 1;
        return true;
    } //toc

    md.renderer.rules.toc_open = function (tokens, index) {
        usedIDs.toc = {};
        return util.format("<div class=\"%s\">", options.tocContainerClass);
    }; //md.renderer.rules.toc_open

    md.renderer.rules.toc_close = function (tokens, index) {
        return "</div>";
        usedIDs.toc = {};
    }; //md.renderer.rules.toc_close

    md.renderer.rules.toc_body = function (tokens, index) {
        return renderChildrenTokens(0, gstate.tokens)[1];
    }; //md.renderer.rules.toc_body

    function renderChildrenTokens(pos, tokens) {
        let headings = [],
            buffer = '',
            currentLevel,
            subHeadings,
            size = tokens.length,
            currentPos = pos;
        while (currentPos < size) {
            let token = tokens[currentPos];
            let heading = tokens[currentPos - 1];
            let level = token.tag && parseInt(token.tag.substr(1, 1));
            if (token.type !== "heading_close"
                || options.includeLevel.indexOf(level) == -1 || heading.type !== "inline"
                || excludeFromTocRegex.exec(heading.content)) {
                currentPos++;
                continue; // Skip if not matching criteria
            } //if
            if (currentLevel) {
                if (level > currentLevel) {
                    subHeadings = renderChildrenTokens(currentPos, tokens);
                    buffer += subHeadings[1];
                    currentPos = subHeadings[0];
                    continue;
                } //if
                if (level < currentLevel) {
                    // Finishing the sub headings
                    buffer += "</li>";
                    headings.push(buffer);
                    return listElement(currentLevel, currentPos, options, headings);
                } //if
                if (level == currentLevel) {
                    // Finishing the sub headings
                    buffer += "</li>";
                    headings.push(buffer);
                } //if
            } else
                currentLevel = level; // We init with the first found level
            //SA!!! currentLevel is the level of the TOC item, number of '#' in '#', '##', '###'...
            // APPEND text after "<li><a href=\"#%s\">" to make PREFIX to title 
            buffer = util.format("<li><a href=\"#%s\">", slugify(heading.content, usedIDs.toc));
            let headingContent = heading.content;
            if (options.itemPrefixes)
                if (options.itemPrefixes[currentLevel - 1])
                    headingContent = options.itemPrefixes[currentLevel - 1] + headingContent;
            // SA??? add prefixes
            buffer += typeof options.format === "function" ? options.format(headingContent) : headingContent;
            buffer += "</a>";
            currentPos++;
        } //loop
        buffer += "</li>";
        headings.push(buffer);
        return listElement(currentLevel, currentPos, options, headings);
    } //renderChildrenTokens

    function listElement(level, currentPos, options, headings) {
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
                    elementAttributes += util.format(" %s=\"%s\"", index, options.defaultListElementAttributeSet[index]);
        return [currentPos,
            util.format("<%s%s>%s</%s>",
                listTag, elementAttributes, headings.join(""), listTag)];
    } //listElement

    // Catch all the tokens for iteration later
    md.core.ruler.push("", function (state) {
        usedIDs.headings = [];
        gstate = state;
    });

    // Insert TOC
    md.inline.ruler.after("text", "toc", toc);

}; //module.exports
