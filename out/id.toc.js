"use strict";

const defaultOptions = {
    enableHeadingId: true,
    includeLevel: [1, 2, 3, 4, 5, 6],
    containerClass: "toc",
    tocRegex: "^\\[\\]\\(toc\\)",
    listType: "ul",
    format: undefined
}; //defaultOptions
const bulletedListType = defaultOptions.listType; //SA
const noBulletStyle = " style=\"list-style-type: none;\""; //SA

module.exports = function (md, userOptions) {

    if (!userOptions.enableHeadingId) return;

    let options = defaultOptions;
    if (userOptions)
        for (let index in userOptions)
            options[index] = userOptions[index];

    const slugify = function (s, used) {
        let slug = options.idPrefix + options.stringModule(s).slugify().toString();
        while (used[slug])
            slug += '.';
        used[slug] = slug;
        return slug;
    } // idHeadersSlugify

    let usedIDs = { headings: {} , toc: {} };

    // Heading id: ///////////////////////////////////////////

    let originalHeadingOpen = md.renderer.rules.heading_open;

    for (let someRule in md.renderer.rules)
        console.log(someRule.toString());

    md.renderer.rules.heading_open = function (tokens, idx, something, somethingelse, self) {
        tokens[idx].attrs = tokens[idx].attrs || [];
        let title = tokens[idx + 1].children.reduce(function (acc, t) {
            return acc + t.content;
        }, '');
        let slug = slugify(title, usedIDs.headings);
        tokens[idx].attrs.push(['id', slug]);
        if (originalHeadingOpen)
            return originalHeadingOpen.apply(this, arguments);
        else
            return self.renderToken.apply(self, arguments);
    }; //md.renderer.rules.heading_open

    md.renderer.rules.toc_open = function (tokens, index) {
        console.out("toc open");
    };

    // TOC: //////////////////////////////////////////////////

    let tocRegexp;
    if (typeof "" == typeof options.tocRegex)
         tocRegexp = new RegExp(options.tocRegex, "m");
    else // SA??? assume its constructor is RegExp; if not, exception will throw later
        tocRegexp = options.tocRegex;
    let gstate;

    function toc(state, silent) {
        let token;
        let match;
        //
        // Reject if the token does not start with [
        if (state.src.charCodeAt(state.pos) !== 0x5B /* [ */)
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
        token.markup = "[[toc]]";
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
        return '<div class="' + options.containerClass + '">';
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
            if (token.type !== "heading_close" || options.includeLevel.indexOf(level) == -1 || heading.type !== "inline") {
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
                    let effectiveStyle = "";
                    if (options.listType === bulletedListType) // SA
                        effectiveStyle = noBulletStyle;
                    return [currentPos, "<" + options.listType + effectiveStyle + ">" + headings.join("") + "</" + options.listType + ">"];
                } //if
                if (level == currentLevel) {
                    // Finishing the sub headings
                    buffer += "</li>";
                    headings.push(buffer);
                } //if
            } else
                currentLevel = level; // We init with the first found level
            buffer = "<li><a href=\"#" + slugify(heading.content, usedIDs.toc) + "\">";
            buffer += typeof options.format === "function" ? options.format(heading.content) : heading.content;
            buffer += "</a>";
            currentPos++;
        } //loop
        buffer += "</li>";
        headings.push(buffer);
        let effectiveStyle = ""; // SA
        if (options.listType === bulletedListType) // SA
            effectiveStyle = noBulletStyle;
        return [currentPos, "<" + options.listType + effectiveStyle + ">" + headings.join("") + "</" + options.listType + ">"];
    } //renderChildrenTokens

    // Catch all the tokens for iteration later
    md.core.ruler.push("grab_state", function (state) {
        usedIDs.headings = {};
        gstate = state;
    });

    // Insert TOC
    md.inline.ruler.after("emphasis", "toc", toc);

} //module.exports
