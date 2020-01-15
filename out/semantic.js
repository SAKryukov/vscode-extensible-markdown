"use strict";

module.exports.getHtmlTemplateSet = (path, fs, encoding) => {
    return {
        html: fs.readFileSync(path.join(__dirname, "/template-html.txt"), encoding),
        style: fs.readFileSync(path.join(__dirname + "/template-style.txt"), encoding),
        embeddedStyle: fs.readFileSync(path.join(__dirname + "/template-embedded-style.txt"), encoding),
        notFoundCss: fs.readFileSync(path.join(__dirname + "/template-not-found-css.txt"), encoding)
    }
}; //getHtmlTemplateSet

module.exports.getSettings = importContext => { // see package.json, "configuration":
    const thisExtensionSection =
        importContext.vscode.workspace.getConfiguration("markdown.extensibleMarkdown");
    const thisConvertToHtmlSection =
        importContext.vscode.workspace.getConfiguration("markdown.extensibleMarkdown.convertToHtml");
    const thisMarkdownItOptionSection =
        importContext.vscode.workspace.getConfiguration("markdown.extensibleMarkdown.options");
    const sharedSection = importContext.vscode.workspace.getConfiguration(importContext.markdownId);
    const settings = {
        reportSuccess: thisConvertToHtmlSection["reportSuccess"],
        showHtmlInBrowser: thisConvertToHtmlSection["showHtmlInBrowser"],
        embedCss: thisConvertToHtmlSection["embedCss"],
        outputPath: thisConvertToHtmlSection["outputPath"],
        titleLocatorRegex: thisExtensionSection["titleLocatorRegex"],
        abbreviationRegex: thisExtensionSection["abbreviationRegex"],
        attributeRegex: thisExtensionSection["attributeRegex"],
        cssClassRegex: thisExtensionSection["cssClassRegex"],
        headingId: thisExtensionSection["headingId"],
        headingIdPrefix: thisExtensionSection["headingIdPrefix"],
        tocRegex: thisExtensionSection["tocRegex"],
        tocIncludeLevels: thisExtensionSection["tocIncludeLevels"],
        tocContainerClass: thisExtensionSection["tocContainerClass"],
        includeLocatorRegex: thisExtensionSection["includeLocatorRegex"],
        includeLocatorInvalidRegexMessageFormat: thisExtensionSection["includeLocatorInvalidRegexMessageFormat"],
        includeLocatorFileReadFailureMessageFormat: thisExtensionSection["includeLocatorFileReadFailureMessageFormat"],
        css: sharedSection["styles"],
        excludeFromTocRegex: thisExtensionSection["excludeFromTocRegex"],
        tocItemIndentInEm: thisExtensionSection["tocItemIndentInEm"],
        autoNumberingRegex: thisExtensionSection["autoNumberingRegex"],
        // options:
        allowHTML: thisMarkdownItOptionSection["allowHTML"],
        typographer: thisMarkdownItOptionSection["typographer"],
        typographerExtensions: thisMarkdownItOptionSection["typographerExtensions"],
        smartQuotes: thisMarkdownItOptionSection["smartQuotes"],
        additionalPlugins: thisMarkdownItOptionSection["additionalPlugins"],
    } //settings
    settings.titleDecorationType =
        importContext.vscode.window.createTextEditorDecorationType(
            thisExtensionSection["titleLocatorDecoratorStyle"]);
    if (!settings.additionalPlugins) return settings;
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
    settings.pluginSyntaxDecorators.push({
        regexString: settings.includeLocatorRegex,
        tooltipFormat: "include %s",
        decorationType: importContext.vscode.window.createTextEditorDecorationType(
            thisExtensionSection["includeLocatorDecoratorStyle"]) 
    });
    settings.pluginSyntaxDecorators.push({
        regexString: settings.excludeFromTocRegex,
        tooltipFormat: "Exclude from Table of Contents",
        decorationType: importContext.vscode.window.createTextEditorDecorationType(
            thisExtensionSection["excludeFromTocLocatorDecoratorStyle"]) 
    });
    settings.pluginSyntaxDecorators.push({
        regexString: settings.abbreviationRegex,
        tooltipFormat: "Abbreviation explanation followed by abbreviation",
        decorationType: importContext.vscode.window.createTextEditorDecorationType(
            thisExtensionSection["abbreviationDecoratorStyle"]) 
    });
    settings.pluginSyntaxDecorators.push({
        regexString: settings.attributeRegex,
        tooltipFormat: "HTML attribute = attribute value",
        decorationType: importContext.vscode.window.createTextEditorDecorationType(
            thisExtensionSection["attributeDecoratorStyle"]) 
    });
    settings.pluginSyntaxDecorators.push({
        regexString: settings.cssClassRegex,
        tooltipFormat: "CSS class",
        decorationType: importContext.vscode.window.createTextEditorDecorationType(
            thisExtensionSection["cssClassDecoratorStyle"]) 
    });
    //
    settings.pluginSyntaxDecorators.push({
        regexString: settings.tocRegex,
        tooltipFormat: "Table of Contents",
        decorationType: importContext.vscode.window.createTextEditorDecorationType(
            thisExtensionSection["tocDecoratorStyle"]) 
    });
    settings.pluginSyntaxDecorators.push({
        relativeToWholeText: true, // special case: regex is not 
        regexString: settings.autoNumberingRegex,
        tooltipFormat: "Auto-Numbering Settings",
        decorationType: importContext.vscode.window.createTextEditorDecorationType(
            thisExtensionSection["autoNumberingDecoratorStyle"]) 
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
