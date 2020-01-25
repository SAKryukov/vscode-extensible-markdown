"use strict";

const utility = require("./utility");

module.exports.getHtmlTemplateSet = (path, fs, encoding) => {
    return {
        html: fs.readFileSync(path.join(__dirname, "/template-html.txt"), encoding),
        style: fs.readFileSync(path.join(__dirname + "/template-style.txt"), encoding),
        embeddedStyle: fs.readFileSync(path.join(__dirname + "/template-embedded-style.txt"), encoding),
        notFoundCss: fs.readFileSync(path.join(__dirname + "/template-not-found-css.txt"), encoding)
    }
}; //getHtmlTemplateSet

module.exports.getSettings = importContext => { // see package.json, "configuration":
    const configuration = importContext.vscode.workspace.getConfiguration();
    const thisExtensionSection = configuration.markdown.extensibleMarkdown;
    const settings = {
        headingIdPrefix: thisExtensionSection.headingIdPrefix,
        tocRegex: thisExtensionSection.TOC.regex,
        tocIncludeLevels: thisExtensionSection.TOC.includeLevels,
        tocContainerClass: thisExtensionSection.TOC.containerClass,
        excludeFromTocRegex: thisExtensionSection.TOC.excludeHeaderRegex,
        tocItemIndentInEm: thisExtensionSection.TOC.itemIndentInEm,
        autoNumberingRegex: thisExtensionSection.TOC.autoNumberingRegex,
        autoNumberingBrokenHierarchy: thisExtensionSection.TOC.autoNumbering.brokenHierarchy,
        includeLocatorRegex: thisExtensionSection.includeLocatorRegex,
        includeLocatorInvalidRegexMessageFormat: thisExtensionSection.includeLocatorInvalidRegexMessageFormat,
        includeLocatorFileReadFailureMessageFormat: thisExtensionSection.includeLocatorFileReadFailureMessageFormat,
        // conversion to HTML:
        showHtmlInBrowser: thisExtensionSection.convertToHtml.showHtmlInBrowser,
        embedCss: thisExtensionSection.convertToHtml.embedCss,
        outputPath: thisExtensionSection.convertToHtml.outputPath,
        // new!!!
        css: configuration.markdown.styles, // from embedded markdown extension
        thisExtensionSettings: configuration.markdown.extensibleMarkdown,
        attribution: {
            titleLocatorRegex: utility.createOptionalRegExp(configuration.markdown.extensibleMarkdown.titleLocatorRegex, false),
            abbreviationRegex: utility.createOptionalRegExp(configuration.markdown.extensibleMarkdown.abbreviationRegex, false),
            abbreviationDecoratorRegex: utility.createOptionalRegExp(configuration.markdown.extensibleMarkdown.abbreviationDecoratorRegex, false),
            attributeRegex: utility.createOptionalRegExp(configuration.markdown.extensibleMarkdown.attributeRegex, true),
            cssClassRegex: utility.createOptionalRegExp(configuration.markdown.extensibleMarkdown.cssClassRegex, true),
            titleClassName: configuration.markdown.extensibleMarkdown.titleClassName,
        }
    }; //settings
    if (settings.additionalPlugins) {
        settings.pluginSyntaxDecorators = [];
        for (let plugin in settings.additionalPlugins.plugins) {
            const pluginInstance = settings.additionalPlugins.plugins[plugin];
            if (!pluginInstance) continue;
            if (!pluginInstance.syntacticDecorators) continue;
            for (let decorator in pluginInstance.syntacticDecorators) {
                const decoratorInstance = pluginInstance.syntacticDecorators[decorator];
                if (!decoratorInstance) continue;
                if (!decoratorInstance.enable) continue;
                if (!decoratorInstance.regexString) continue;
                if (!decoratorInstance.style) continue;
                const decoratorData = {
                    regexString: decoratorInstance.regexString,
                    tooltipFormat: decoratorInstance.tooltipFormat,
                    decorationType: importContext.vscode.window.createTextEditorDecorationType(
                        decoratorInstance.style)
                };
                settings.pluginSyntaxDecorators.push(decoratorData);
            } //loop decorators
        } //loop
    } //if settings.additionalPlugins
    settings.pluginSyntaxDecorators = [];
    if (settings.attribution.titleLocatorRegex)
        settings.pluginSyntaxDecorators.push({
            regexString: settings.attribution.titleLocatorRegex.source,
            tooltipFormat: `Current paragraph is considered as a title used as an HTML \"title\" attribute; it also has CSS class \"${settings.titleClassName}; its style can be defined in CSS`,
            decorationType: importContext.vscode.window.createTextEditorDecorationType(
                thisExtensionSection.titleLocatorDecoratorStyle)
        });
    settings.pluginSyntaxDecorators.push({
        regexString: settings.includeLocatorRegex,
        tooltipFormat: "include file \"%s\"",
        decorationType: importContext.vscode.window.createTextEditorDecorationType(
            thisExtensionSection.includeLocatorDecoratorStyle)
    });
    settings.pluginSyntaxDecorators.push({
        regexString: settings.excludeFromTocRegex,
        tooltipFormat: "Exclude current header from Table of Contents",
        decorationType: importContext.vscode.window.createTextEditorDecorationType(
            thisExtensionSection.TOC.excludeHeader.DecoratorStyle)
    });
    if (settings.attribution.abbreviationDecoratorRegex)
        settings.pluginSyntaxDecorators.push({
            regexString: settings.attribution.abbreviationDecoratorRegex.source,
            tooltipFormat: "Explanation \"%s\" followed by corresponding abbreviation or acronym",
            decorationType: importContext.vscode.window.createTextEditorDecorationType(
                thisExtensionSection.abbreviationDecoratorStyle)
        });
    if (settings.attribution.attributeRegex)
        settings.pluginSyntaxDecorators.push({
            regexString: settings.attribution.attributeRegex.source,
            tooltipFormat: "HTML attribute %s=\"...\"",
            decorationType: importContext.vscode.window.createTextEditorDecorationType(
                thisExtensionSection.attributeDecoratorStyle)
        });
    if (settings.attribution.cssClassRegex)
        settings.pluginSyntaxDecorators.push({
            regexString: settings.attribution.cssClassRegex.source,
            tooltipFormat: "CSS class \"%s\"",
            decorationType: importContext.vscode.window.createTextEditorDecorationType(
                thisExtensionSection.cssClassDecoratorStyle)
        });
    //
    settings.pluginSyntaxDecorators.push({
        regexString: settings.tocRegex,
        tooltipFormat: "Table of Contents",
        decorationType: importContext.vscode.window.createTextEditorDecorationType(
            thisExtensionSection.TOC.decoratorStyle)
    });
    settings.pluginSyntaxDecorators.push({
        relativeToWholeText: true, // special case: regex is not 
        regexString: settings.autoNumberingRegex,
        tooltipFormat: "Auto-Numbering Settings",
        decorationType: importContext.vscode.window.createTextEditorDecorationType(
            thisExtensionSection.TOC.autoNumberingDecoratorStyle)
    });
    return settings;
}; //getSettings

module.exports.documentTitle = "";

module.exports.getVSCodeRange = (vscode, document, start, match) => {
    return new vscode.Range(
        document.positionAt(start),
        document.positionAt(start + match.length));
} //getVSCodeRange

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

module.exports.replaceIncludes = (importContext, input, hostFileName, settings) => {
    const readFile = fileName => {
        try {
            return importContext.fs.readFileSync(fileName, importContext.encoding);
        } catch (ex) {
            return importContext.util.format(settings.includeLocatorFileReadFailureMessageFormat, fileName);
        } //exception
    }; //readFile
    const invalidRegexMessage = importContext.util.format(settings.includeLocatorInvalidRegexMessageFormat, settings.includeLocatorRegex);
    let result = input;
    const replaceOne = regex => {
        const match = regex.exec(result);
        if (!match) return false;
        if (match.length != 2) { result = invalidRegexMessage; return false; }
        const includefileName = importContext.path.join(
            importContext.path.dirname(hostFileName),
            match[1]);
        result = result.replace(match[0], readFile(includefileName));
        return true;
    }; //replaceOne
    try {
        const regex = new RegExp(settings.includeLocatorRegex);
        do { } while (replaceOne(regex));
        return result;
    } catch (ex) {
        return input;
    } //exception
}; //replaceIncludes
