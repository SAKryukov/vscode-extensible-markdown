"use strict";

const defaultKeyword = "default";
const enableKeyword = "enable";
const trueKeyword = "true";
const standaloneKeyword = "standalone";
const properties = [
    "Suffix",
    "Prefix",
    "Start",
    "Separator"
];

const defaultKeywords = ((defaultKeyword, properties) => {
    const result = [];
    for (const property of properties)
        result.push(defaultKeyword + property);
    return result;
})(defaultKeyword, properties);

const headingKeywords = (properties => {
    const result = [];
    for (const property of properties)
        result.push(property.toLowerCase());
    result.push(standaloneKeyword);    
    return result;
})(properties);

const headingRegexp = (headingKeywords => {
    const keywordSet = headingKeywords.join("|");
    const expression = `^\\s*?h([1-6])\\.(${keywordSet})\\s*?[\\:\\=]\\s*?(.*?)\\,?\\s*?$`;
    return new RegExp(expression);
})(headingKeywords);

const topLevelRegexp = ((defaultKeywords, enableKeyword) => {
    const keywordSet = [defaultKeywords.join("|"), enableKeyword].join("|");
    const expression = `^\\s*?(${keywordSet})\\s*?[\\:\\=]\\s*?(.*?)\\,?\\s*?$`;
    return new RegExp(expression);
})(defaultKeywords, enableKeyword);

const splitRegex = (() => {
    return new RegExp("[\n\r]");
})();

function parsePropertyValue(text) {
    text = text.trim();
    if (text.toLowerCase() == trueKeyword)
        return true;
    const length = text.length;
    if (length < 1) return;
    const number = parseInt(text);
    if (!isNaN(number)) return number;
    if (length < 3) return;
    const bra = text[0];
    const slice = text.slice(1, length - 1);
    const ket = text[text.length - 1];
    if (bra == "[" && ket == "]")
        try {
            return JSON.parse(bra + slice + ket);
        } catch (ex) {
            return;
        } //exception
    else if (bra == "\"" && ket == "\"")
        return slice;
} //parsePropertyValue

function parse(text) {
    const result = {
        pattern: []
    };
    const lines = text.split(splitRegex);
    result.parsedPropertyCount = 0;
    result.parsedHeadingPropertyCount = 0;
    for (const line of lines) {
        if (line.length < 1) continue;
        const headingMatch = headingRegexp.exec(line);
        if (headingMatch) {
            if (headingMatch.length != 4) continue;
            const level = parseInt(headingMatch[1]);
            const propertyName = headingMatch[2];
            const propertyValue = headingMatch[3];
            if (!result.pattern[level - 1])
                result.pattern[level - 1] = {};
            const parsedPropertyValue = parsePropertyValue(propertyValue);
            if (parsedPropertyValue)
                ++result.parsedHeadingPropertyCount;
            result.pattern[level - 1][propertyName] = parsedPropertyValue;
        } else {
            const topLevelMatch = topLevelRegexp.exec(line);
            if (!topLevelMatch) continue;
            if (topLevelMatch.length != 3) continue;
            const propertyName = topLevelMatch[1];
            const propertyValue = topLevelMatch[2];
            const parsedPropertyValue = parsePropertyValue(propertyValue);
            if (parsedPropertyValue)
                ++result.parsedPropertyCount;
            result[propertyName] = parsedPropertyValue;
        } //if
    } //loop
    return result;
} //parse

module.exports = optionText => {
    let result = parse(optionText);
    return result;
}; //module.exports
