module.exports.getSettings = function (vscode, markdownId) { // see package.json, "configuration":
    const thisExtensionSection =
        vscode.workspace.getConfiguration("markdown.extension.convertToHtml");
    const thisMarkdownItOptionSection =
        vscode.workspace.getConfiguration("markdown.extension.convertToHtml.options");
    const sharedSection = vscode.workspace.getConfiguration(markdownId);
    const settings = {
        reportSuccess: thisExtensionSection["reportSuccess"],
        showHtmlInBrowser: thisExtensionSection["showHtmlInBrowser"],
        embedCss: thisExtensionSection["embedCss"],
        titleLocatorRegex: thisExtensionSection["titleLocatorRegex"],
        outputPath: thisExtensionSection["outputPath"],
        css: sharedSection["styles"],
        // options:
        headingId: thisMarkdownItOptionSection["headingId"],
        allowHTML: thisMarkdownItOptionSection["allowHTML"],
        linkify: thisMarkdownItOptionSection["linkify"],
        br: thisMarkdownItOptionSection["br"],
        typographer: thisMarkdownItOptionSection["typographer"],
        smartQuotes: thisMarkdownItOptionSection["smartQuotes"],
        additionalPlugins: thisMarkdownItOptionSection["additionalPlugins"],
    } //settings
    settings.titleDecorationType =
        vscode.window.createTextEditorDecorationType(
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
                decorationType: vscode.window.createTextEditorDecorationType(
                    decoratorInstance.style)
            };
            settings.pluginSyntaxDecorators.push(decoratorData);
        } //loop decorators
    } //loop
    return settings;
}; //getSettings

module.exports.titleFinder = function (text, settings) {
    if (!settings.titleLocatorRegex) return null;
    try {
        const regexp = new RegExp(settings.titleLocatorRegex, "m");
        const found = regexp.exec(text);
        if (!found) return null;
        if (found.length < 2) return null; // match itself + group inside
        return { start: found.index, all: found[0], title: found[1] };
    } catch (ex) {
        return null;
    } //exception
}; //titleFinder

// usage:
// thenableRegex("1(.*?)2)", input, 0).then(function(start, len, groups) {
//     //...
// })
module.exports.thenableRegex = function(regexPattern, input, options) {
    if (!options) options = "gm";
    const regexp = new RegExp(regexPattern, options);
    let match = regexp.exec(input);
    const then = function (callback) {
        while (match != null) {
            let groups = [];
            for (let index = 0; index < match.length; ++index)
                groups.push(match[index]);
            callback(match.index, match.length, groups);
            match = regexp.exec(input);
        } //loop
    } // then
    return { then: then };
}; //thenableRegex
