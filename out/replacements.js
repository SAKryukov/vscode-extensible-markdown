"use strict";

module.exports = (md, options) => {

    const utility = require("./utility");

    const abbreviationRegexp = new RegExp(/\{(.+?)\}/); // in **: *{Request for Comments}RFC*
    const patterns = [
        { name: "fence language", regexpString: "\\{(.+?)\\}", type: "fence", field: "info", attribute: "lang", attributeValue: 1 },
        { name: "class", regexpString: "\\{\\.(.+?)\\}", type: "paragraph_open", token: +1, field: "content", attribute: "class", attributeValue: 1 },
        { name: "title", regexpString: "\\{\\^(.+?)\\}", type: "paragraph_open", token: +1, field: "content", attribute: "title", attributeValue: 1 },
        { name: "attribute=value", regexpString: "\\{(.+?)\\=(.+?)\\}", type: "paragraph_open", token: +1, field: "content", attribute: 1, attributeValue: 2 },
        { name: "article title", regexpString: "\\{title\\}", type: "paragraph_open", token: +1, nextTokenType: "inline", field: "content", attribute: "class", attributeValue: "title" },
    ];
    for (let pattern of patterns)
        pattern.regexp = new RegExp(pattern.regexpString);
    const tokenDictionary = {};

    md.core.ruler.after("replacements", "extra_replacements", state => {
        const regexp = new RegExp(/\-\+/, "g");
        for (let index = state.tokens.length - 1; index >= 0; --index) {
            const token = state.tokens[index];
            if (token.type != "inline") continue;
            let insideAutolink = 0;
            for (let childIndex = token.children.length - 1; childIndex >= 0; --childIndex) {
                const childToken = token.children[childIndex];
                if (childToken.info = "auto") {
                    if (childToken.type == "link_open")
                        insideAutolink -= 1;
                    else if (childToken.type == "link_close")
                        insideAutolink += 1;
                    else if (childToken.type == "text") {
                        if (!insideAutolink && regexp.exec(childToken.content))
                                childToken.content = childToken.content.replace(regexp, "!!!");
                    } //if
                } //if
            } //loop
        } //loop tokens
        return true;
    });

}; //module.exports
