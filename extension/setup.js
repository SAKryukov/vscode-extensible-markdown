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
        css: configuration.markdown.styles, // from embedded markdown extension
        thisExtensionSettings: configuration.markdown.extensibleMarkdown,
        attribution: {
            titleLocatorRegex: utility.createOptionalRegExp(
                configuration.markdown.extensibleMarkdown.titleLocatorRegex, false),
            abbreviationRegex: utility.createOptionalRegExp(
                configuration.markdown.extensibleMarkdown.abbreviationRegex, false),
            abbreviationDecoratorRegex: utility.createOptionalRegExp(
                configuration.markdown.extensibleMarkdown.abbreviationDecoratorRegex, false),
            attributeRegex: utility.createOptionalRegExp(
                configuration.markdown.extensibleMarkdown.attributeRegex, true),
            cssClassRegex: utility.createOptionalRegExp(
                configuration.markdown.extensibleMarkdown.cssClassRegex, true),
            titleClassName: configuration.markdown.extensibleMarkdown.titleClassName,
        }
    }; //settings
    settings.pluginSyntaxDecorators = [];
    if (settings.thisExtensionSettings.options.additionalPlugins) {
        settings.pluginSyntaxDecorators = [];
        for (let plugin in settings.thisExtensionSettings.options.additionalPlugins.plugins) {
            const pluginInstance = settings.thisExtensionSettings.options.additionalPlugins.plugins[plugin];
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
    if (settings.attribution.titleLocatorRegex)
        settings.pluginSyntaxDecorators.push({
            regexString: settings.attribution.titleLocatorRegex.source,
            tooltipFormat: `Current paragraph is considered as a title used as an HTML \"title\" attribute; it also has CSS class \"${settings.titleClassName}; its style can be defined in CSS`,
            decorationType: importContext.vscode.window.createTextEditorDecorationType(
                thisExtensionSection.titleLocatorDecoratorStyle)
        });
    settings.pluginSyntaxDecorators.push({
        regexString: settings.thisExtensionSettings.includes.locatorRegex,
        tooltipFormat: "include file \"%s\"",
        decorationType: importContext.vscode.window.createTextEditorDecorationType(
            thisExtensionSection.includes.locatorDecoratorStyle)
    });
    settings.pluginSyntaxDecorators.push({
        regexString: settings.thisExtensionSettings.TOC.excludeHeaderRegex,
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
        regexString: settings.thisExtensionSettings.TOC.regex,
        tooltipFormat: "Table of Contents",
        decorationType: importContext.vscode.window.createTextEditorDecorationType(
            thisExtensionSection.TOC.decoratorStyle)
    });
    settings.pluginSyntaxDecorators.push({
        relativeToWholeText: true, // special case: regex is not 
        regexString: settings.thisExtensionSettings.TOC.autoNumberingRegex,
        tooltipFormat: "Auto-Numbering Settings",
        decorationType: importContext.vscode.window.createTextEditorDecorationType(
            thisExtensionSection.TOC.autoNumberingDecoratorStyle)
    });
    return settings;
}; //getSettings

module.exports.documentTitle = utility.definitionSet.stringEmpty;

module.exports.getVSCodeRange = (vscode, document, start, match) => {
    return new vscode.Range(
        document.positionAt(start),
        document.positionAt(start + match.length));
} //getVSCodeRange
