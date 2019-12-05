"use strict";

const path = require("path");
const moduleName = path.basename(module.id);

module.exports = (md, options) => {

    const utility = require("./utility");

    const createdRules = new Set();

    const abbreviationRegexp = new RegExp(/\{(.+?)\}/); // in **: *{Request for Comments}RFC*
    const patterns = [
        { name: "fence language", regexpString: "\\{(.+?)\\}", type: "fence", field: "info", attribute: "lang", attributeValue: 1 },
        { name: "class", regexpString: "\\{\\.(.+?)\\}", type: "paragraph_open", token: +1, field: "content", attribute: "class", attributeValue: 1 },
        { name: "attribute=value", regexpString: "\\{(.+?)\\=(.+?)\\}", type: "paragraph_open", token: +1, field: "content", attribute: 1, attributeValue: 2 },
        { name: "article title", regexpString: "\\{title\\}", type: "paragraph_open", token: +1, nextTokenType: "inline", field: "content", attribute: "class", attributeValue: "title" },
    ];
    for (let pattern of patterns)
        pattern.regexp = new RegExp(pattern.regexpString);
    let tokenDictionary = {};

    const detectAttributes = (ruleName) => {
        if (createdRules.has(ruleName)) return;
        md.core.ruler.push(ruleName, state => {
            tokenDictionary = {};
            const value = [];
            for (let index = 0; index < state.tokens.length - 1; ++index) {
                const token = state.tokens[index];
                if (token.type != "paragraph_open") continue;
                for (let pattern of patterns) {
                    const currentToken = pattern.token ? state.tokens[parseInt(index) + pattern.token] : token;
                    const text = currentToken[pattern.field];
                    const match = pattern.regexp.exec(text);
                    if (!match) continue;
                    value.push({ text: text, pattern: pattern, match: match });
                    currentToken.hidden = true;
                    utility.cleanInline(currentToken, pattern.regexp);
                } //loop patterns
                tokenDictionary[index] = value;
            } //loop tokens
            return true;
        });
        createdRules.add(ruleName);
    }; //detectAttributes

    const parseAttributePart = index => {
        let attributePart = "";
        if (index in tokenDictionary) {
            const data = tokenDictionary[index];
            for (let element of data) {
                const attribute = element.pattern.attribute.constructor == String ? element.pattern.attribute : element.match[element.pattern.attribute];
                const attributeValue = element.pattern.attributeValue.constructor == String ? element.pattern.attributeValue : element.match[element.pattern.attributeValue];
                attributePart += ` ${attribute}="${attributeValue}"`;
            }
        } //if
        return attributePart;
    } //parseAttributePart

    const previousRenderFence = md.renderer.rules.fence; // remove VSCode-specific class and data
    md.renderer.rules.fence = (tokens, index, options, object, renderer) => {
        const attributePart = parseAttributePart(index);
        const content = tokens[index].content;
        if (attributePart)
            return `<pre${attributePart}>${content}</pre>`;
        else
            return utility.renderDefault(tokens, index, options, object, renderer, previousRenderFence, `<pre>${content}</pre>`);
    }; //md.renderer.rules.fence

    // const previousRenderParagraphOpen = md.renderer.rules.paragraph_open;
    // md.renderer.rules.paragraph_open = (tokens, index, options, object, renderer) => {
    //     const attributePart = parseAttributePart(index);
    //     if (attributePart)
    //         return `<p${attributePart}>`;
    //     else
    //         return utility.renderDefault(tokens, index, options, object, renderer, previousRenderParagraphOpen, `<p>`);
    // }; //md.renderer.paragraph_open

    const previousRenderEmOpen = md.renderer.rules.em_open;
    md.renderer.rules.em_open = (tokens, index, options, object, renderer) => {
        const text = tokens[index + 1].content;
        const match = abbreviationRegexp.exec(text);
        tokens[index + 1].content = text.replace(abbreviationRegexp, "");
        if (match && match[1]) {
            tokens[index + 2].tag = "abbr";
            return `<abbr title="${match[1]}">`;
        } else
            return utility.renderDefault(tokens, index, options, object, renderer, previousRenderEmOpen, `<em>`);
    }; //md.renderer.rules.em_open

    detectAttributes(moduleName);

}; //module.exports
