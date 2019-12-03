"use strict";

module.exports = (md, options) => {

    const createdRules = new Set();

    const patterns = [
        { name: "fence language", regexpString: "\\[\\]\\((.+?)\\)", type: "fence", field: "info" },
        { name: "attribute=value", regexpString: "\\[\\]\\((.+?)\\=(.+?)\\)", type: "paragraph_open", token: +1, field: "content" },
        { name: "class", regexpString: "\\[\\]\\(.(.+?)\\)", type: "paragraph_open", token: +1, field: "content" },
        { name: "article title", regexpString: "\\[\\]\\(title\\)", type: "paragraph_open", token: +1, nextTokenType: "inline", field: "content", class: "title"  },
    ];
    for (let pattern of patterns)
        pattern.regexp = new RegExp(pattern.regexpString);


    const processCoreLinkify = (ruleName, action) => {
        if (createdRules.has(ruleName)) return;
        md.core.ruler.before('linkify', ruleName, function (state, silent) {
            if (silent) return false;
            for (let index = 0; index < state.tokens.length - 1; ++index) {
                const token = state.tokens[index];
                for (let pattern of patterns) {
                    const currentToken = pattern.token ? state.tokens[parseInt(index) + pattern.token] : token;
                    const text = currentToken[pattern.field];
                    const match = pattern.regexp.exec(text);
                    if (!match) continue;
                    token._plugin_specific_tag = { text: text, match: [match[0], match[1], match[2]] };
                    console.log("problem here");
                } //loop patterns
            } //loop tokens
            return true;
        });    
        createdRules.add(ruleName);
    };

    md.renderer.rules.fence = (tokens, index, options, object, renderer) => {
        const content = tokens[index].content;
        const languageId = tokens[index]._plugin_specific_tag.match[1];
        return `<pre lang="${languageId}">${content}</pre>`;
    } //md.renderer.rules.fence

    md.renderer.rules.paragraph_open = (tokens, index, options, object, renderer) => {
        const token = tokens[index];
        if (token.special)
            return `<p class="${token.attrs[0][1]}"> ha-ha `;
        return `<p>`;
    } //md.renderer.paragraph_open

    processCoreLinkify("attribution", undefined);

}; //module.exports
