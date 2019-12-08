"use strict";

const path = require("path");
const semantic = require("./semantic");
const moduleName = path.basename(module.id);

module.exports = (md, options) => {

    const utility = require("./utility");

    const abbreviationRegexp = new RegExp(/\{(.+?)\}/); // in **: *{Request for Comments}RFC*
    const mergedAttribute = "class";
    const patterns = [
        { name: "class", regexp: /\{\.(.+?)\}/g, attribute: mergedAttribute, attributeValue: 1 },
        { name: "document title", regexp: new RegExp(options.titleLocatorRegex), attribute: "class", attributeValue: "title", isDocumentTitlePattern: true },
        { name: "attribute=value", regexp: /\{([a-z]+?)\=(.+?)\}/g, attribute: 1, attributeValue: 2 },
    ];
    const blockPatterns = {
        "fence": { textToken: +0, textField: "info" },
        "paragraph_open": { textToken: +1, textField: "content" },
        "blockquote_open": { textToken: +2, textField: "content" },
    };

    const createdRules = new Set();
    let tokenDictionary = {};

    const detectAttributes = (ruleName) => {
        if (createdRules.has(ruleName)) return;
        md.core.ruler.push(ruleName, state => {
            tokenDictionary = {};
            let documentTitleToken = null;
            let documentTitleTokenType = null;
            semantic.documentTitle = null;
            for (let index = 0; index < state.tokens.length; ++index) {
                const token = state.tokens[index];
                const blockPattern = blockPatterns[token.type];
                if (!blockPattern) continue;
                const attributes = { };
                let attributeCount = 0;
                for (let pattern of patterns) {
                    const currentToken = blockPattern.textToken ? state.tokens[parseInt(index) + blockPattern.textToken] : token;
                    const text = currentToken[blockPattern.textField];
                    const matchStrings = text.match(pattern.regexp);
                    if (!matchStrings) continue;
                    for (let matchString of matchStrings) {
                        const match = pattern.regexp.exec(matchString);
                        if (!match) continue;
                        const attribute = pattern.attribute.constructor == String ? pattern.attribute : match[pattern.attribute];
                        let attributeValue = pattern.attributeValue.constructor == String ? pattern.attributeValue : match[pattern.attributeValue];
                        if (attribute == mergedAttribute) {
                            const currentAttribute = attributes[attribute];
                            if (currentAttribute)
                                attributeValue += ` ${currentAttribute}`;
                        } //merged classes
                        attributes[attribute] = attributeValue;
                        ++attributeCount;
                        utility.cleanInline(currentToken, pattern.regexp);
                        if (pattern.isDocumentTitlePattern) {
                            documentTitleToken = currentToken;
                            documentTitleTokenType = token.type;
                        } //if
                    } //loop
                } //loop patterns
                if (documentTitleToken)
                    semantic.documentTitle = documentTitleToken[blockPatterns[documentTitleTokenType].textField];
                if (attributeCount > 0)
                    tokenDictionary[index] = attributes;
            } //loop tokens
            return true;
        });
        createdRules.add(ruleName);
    }; //detectAttributes++

    const parseAttributePart = index => {
        let attributePart = "";
        if (index in tokenDictionary) {
            const attributes = tokenDictionary[index];
            for (let attribute in attributes)
                    attributePart += ` ${attribute}="${attributes[attribute]}"`;
        } //if
        return attributePart;
    } //parseAttributePart

    const previousRenderFence = null; //md.renderer.rules.fence; // remove VSCode-specific class and data
    md.renderer.rules.fence = (tokens, index, options, object, renderer) => {
        const attributePart = parseAttributePart(index);
        const content = tokens[index].content;
        if (attributePart)
            return `<pre${attributePart}>${content}</pre>`;
        else
            return utility.renderDefault(tokens, index, options, object, renderer, previousRenderFence, `<pre>${content}</pre>`);
    }; //md.renderer.rules.fence

    const previousRenderParagraphOpen = md.renderer.rules.paragraph_open;
    md.renderer.rules.paragraph_open = (tokens, index, options, object, renderer) => {
        const attributePart = parseAttributePart(index);
        if (attributePart)
            return `<p${attributePart}>`;
        else
            return utility.renderDefault(tokens, index, options, object, renderer, previousRenderParagraphOpen, `<p>`);
    }; //md.renderer.paragraph_open

    const previousRenderBlockquoteOpen = md.renderer.rules.paragraph_open;
    md.renderer.rules.blockquote_open = (tokens, index, options, object, renderer) => {
        const attributePart = parseAttributePart(index);
        if (attributePart)
            return `<blockquote${attributePart}>`;
        else
            return utility.renderDefault(tokens, index, options, object, renderer, previousRenderBlockquoteOpen, `<p>`);
    }; //md.renderer.blockquote_open

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
