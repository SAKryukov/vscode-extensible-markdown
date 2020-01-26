"use strict";

module.exports.slugify = (s, used, prefix) => {
    let slug = prefix +
        s.replace(/ /g, '-')
            .replace(/[^A-Za-z0-9\-\.\_]/g, match => { return match.codePointAt().toString(16); }).toLowerCase();
    while (used[slug])
        slug += '.';
    used[slug] = slug;
    return slug;
} //module.exports.slugify

module.exports.populateWithDefault = (value, defaultValue) => { // special edition: it does not populate Array
    if (!defaultValue) return;
    if (!value) return;
    if (defaultValue.constructor == Object && value.constructor == Object) {
        for (const index in defaultValue)
            if (!(index in value))
                value[index] = defaultValue[index];
            else
                module.exports.populateWithDefault(value[index], defaultValue[index]);
    } else
        value = defaultValue;
} //module.exports.populateWithDefault

module.exports.renderDefault = (tokens, index, options, object, renderer, previousHandler, defaultHtml) => {
    if (previousHandler)
        return(previousHandler(tokens, index, options, object, renderer))
    else
        return defaultHtml;
}; //module.exports.renderDefault

module.exports.cleanInline = (token, regexp) => {
    if (token.children)
        for (let childToken of token.children)
            module.exports.cleanInline(childToken, regexp);
    token.content = token.content.replace(regexp, "");
} //module.exports.cleanInline

module.exports.htmlHeadingLevel = tag => { return parseInt(tag.substr(1)) - 1; };

module.exports.createOptionalRegExp = (patternString, isGlobal) => {
    if (!patternString) return null;
    if (patternString.trim().length < 1) return null;
    const option = isGlobal ? "g" : undefined;
    return new RegExp(patternString, option);
}; //createOptionalRegExp

// usage:
// thenableRegex("1(.*?)2)", input, 0).then(function(start, len, groups) {
//     //...
// })
module.exports.thenableRegex = (regexPattern, input, isMultiline) => {
    let options = isMultiline ? "gm" : "g";
    try {
        const regexp = new RegExp(regexPattern, options);
        let match = regexp.exec(input);
        const then = callback => {
            while (match != null) {
                let groups = [];
                for (let index = 0; index < match.length; ++index)
                    groups.push(match[index]);
                callback(match.index, match[0].length, groups);
                match = regexp.exec(input);
            } //loop
        } // then
        return { then: then };
    } catch (ex) {
        return { then: () => { } };
    };
}; //thenableRegex
