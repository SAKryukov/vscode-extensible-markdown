"use strict";

module.exports = (md, options) => {

    const createdRules = new Set();

    const patterns = [
        { name: "fence language", regexpString: "\\[\\]\\((.+?)\\)", type: "fence", field: "info", attribute: "lang", attributeValue: 1 },
        { name: "attribute=value", regexpString: "\\[\\]\\((.+?)\\=(.+?)\\)", type: "paragraph_open", token: +1, field: "content", attribute: 1, attributeValue: 2 },
        { name: "class", regexpString: "\\[\\]\\(\\.(.+?)\\)", type: "paragraph_open", token: +1, field: "content", attribute: "class", attributeValue: 1 },
        { name: "article title", regexpString: "\\[\\]\\(title\\)", type: "paragraph_open", token: +1, nextTokenType: "inline", field: "content", attribute: "class", attributeValue: "title" },
    ];
    for (let pattern of patterns)
        pattern.regexp = new RegExp(pattern.regexpString);
    const tokenDictionary = {};

    const detectAttributes = (ruleName) => {
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
                    tokenDictionary[index] = { text: text, pattern: pattern, match: match };
                } //loop patterns
            } //loop tokens
            return true;
        });    
        createdRules.add(ruleName);
    }; //detectAttributes

    md.renderer.rules.fence = (tokens, index, options, object, renderer) => {
        const content = tokens[index].content;
        if (index in tokenDictionary) {
            const data = tokenDictionary[index];
            const languageId = data.match[data.pattern.attributeValue];
            return `<pre lang="${languageId}">${content}</pre>`;
        } else
            return `<pre>${content}</pre>`;
    } //md.renderer.rules.fence

    md.renderer.rules.paragraph_open = (tokens, index, options, object, renderer) => {
        if (index in tokenDictionary) {
            const data = tokenDictionary[index];
            const attribute = data.pattern.attribute.constructor == String ? data.pattern.attribute : data.match[data.pattern.attribute];
            const attributeValue = data.pattern.attributeValue.constructor == String ? data.pattern.attributeValue : data.match[data.pattern.attributeValue];
            return `<p ${attribute}="${attributeValue}">`;    
        } else
            return `<p>`;
    } //md.renderer.paragraph_open

    detectAttributes("attribution");

}; //module.exports
