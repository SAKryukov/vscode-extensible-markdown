"use strict";
exports.activate = function (context) {

    const encoding = "utf8";
    const Utf8BOM = "\ufeff";
    const defaultSmartQuotes = '""' + "''";

    const vscode = require('vscode');
    const util = require('util');
    const fs = require('fs');
    const path = require('path');

    const htmlTemplateSet = (function () {
        return {
            html: fs.readFileSync(path.join(__dirname, "/template-html.txt"), encoding),
            style: fs.readFileSync(path.join(__dirname + "/template-style.txt"), encoding),
            embeddedStyle: fs.readFileSync(path.join(__dirname + "/template-embedded-style.txt"), encoding),
            notFoundCss: fs.readFileSync(path.join(__dirname + "/template-not-found-css.txt"), encoding)
        }
    })();

    let markdownIt;

    const getSettings = function () { // see package.json, "configuration":
        const thisExtensionSection =
            vscode.workspace.getConfiguration("markdown.extension.convertToHtml");
        const thisMarkdownItOptionSection =
            vscode.workspace.getConfiguration("markdown.extension.convertToHtml.options");
        const sharedSection = vscode.workspace.getConfiguration("markdown");
        return {
            reportSuccess: thisExtensionSection["reportSuccess"],
            showHtmlInBrowser: thisExtensionSection["showHtmlInBrowser"],
            embedCss: thisExtensionSection["embedCss"],
            titleLocatorRegex: thisExtensionSection["titleLocatorRegex"],
            css: sharedSection["styles"],
            // options:
            headingId: thisMarkdownItOptionSection["headingId"],
            allowHTML: thisMarkdownItOptionSection["allowHTML"],
            linkify: thisMarkdownItOptionSection["linkify"],
            br: thisMarkdownItOptionSection["br"],
            typographer: thisMarkdownItOptionSection["typographer"],
            smartQuotes: thisMarkdownItOptionSection["smartQuotes"],
            additionalPlugins: thisMarkdownItOptionSection["additionalPlugins"]
        }
    }; //getSettings

    const titleFinder = function(text, settings) {
        if (!settings.titleLocatorRegex) return null;
        try {
            const regexp = new RegExp(settings.titleLocatorRegex);
            const found = text.match(regexp);
            if (!found) return null;
            if (found.length < 2) return null; // match itself + group inside
            return found[1];     
        } catch(ex) {
            return null;
        } //exception
    }; //titleFinder

    const convertText = function (text, fileName, title, css, embedCss) {
        let result = markdownIt.render(text);
        let style = "";
        for (let index = 0; index < css.length; ++index) {
            if (embedCss) {
                const absolute = path.join(vscode.workspace.rootPath, css[index]);
                let cssCode = util.format(htmlTemplateSet.notFoundCss, absolute);
                if (fs.existsSync(absolute))
                    cssCode = fs.readFileSync(absolute, encoding);
                style += util.format(htmlTemplateSet.embeddedStyle, cssCode);
            } else {
                const relative = path.relative(
                    path.dirname(fileName),
                    path.join(vscode.workspace.rootPath, css[index]))
                    .replace(/\\/g, '/');
                style += util.format(htmlTemplateSet.style, relative);
            } //if5
            if (index < css.length - 1) style += "\n";
        } //loop
        result = util.format(htmlTemplateSet.html,
            title ?
                title : util.format("Converted from: %s", path.basename(fileName)),
            style,
            result);
        const output = path.join(
            path.dirname(fileName),
            path.basename(fileName,
                path.extname(fileName))) + ".html";
        result = Utf8BOM + result;
        fs.writeFileSync(output, result);
        return output;
    }; //convertText

    const successAction = function (input, output, settings) {
        if (settings.reportSuccess) {
            vscode.window.showInformationMessage(
                util.format('Directory: "%s"', path.dirname(output)))
            vscode.window.showInformationMessage(
                util.format('Markdown file "%s" is converted to: "%s"',
                    path.basename(input),
                    path.basename(output)));
        } //if
        if (settings.showHtmlInBrowser)
            require('child_process').exec(output);
    }; //successAction

    const command = function (action) {
        try {
            const settings = getSettings();
            const optionSet = (function () {
                let result = { xhtmlOut: true }; // it closes all tags, like in <br />, non-default, but it's a crime not to close tags
                result.html = settings.allowHTML;
                result.typographer = settings.typographer;
                result.linkify = settings.linkify;
                result.breaks = settings.br;
                result.typographer = settings.typographer;
                if (settings.typographer) {
                    if (!settings.smartQuotes)
                        result.quotes = defaultSmartQuotes;
                    else if (!settings.smartQuotes.length)
                        result.quotes = defaultSmartQuotes;
                    else if (settings.smartQuotes.length < defaultSmartQuotes.length)
                        result.quotes = defaultSmartQuotes;
                    else
                        result.quotes = settings.smartQuotes;
                } //if settings.typographer
                return result;
            })(); //optionSet
            const additionalPlugins = (function () {
                let result = [];
                if (!settings.additionalPlugins) return result;
                if (!settings.additionalPlugins.plugins) return result;
                if (!settings.additionalPlugins.plugins.length) return result;
                if (settings.additionalPlugins.plugins.length < 1) return result;
                let effectiveParentPath = settings.additionalPlugins.absolutePath;
                if (!effectiveParentPath) {
                    let relativePath = settings.additionalPlugins.relativePath;
                    if (!relativePath) return result;
                    relativePath = relativePath.toString();
                    effectiveParentPath = path.join(vscode.workspace.rootPath, relativePath);
                } //if 
                if (!effectiveParentPath) return result;
                if (!fs.existsSync(effectiveParentPath.toString())) return result;
                for (let pluginDataProperty in settings.additionalPlugins.plugins) {
                    const pluginData = settings.additionalPlugins.plugins[pluginDataProperty];
                    if (!pluginData.name) continue;
                    const effectivePath =
                        path.join(effectiveParentPath.toString(), pluginData.name.toString());
                    if (!fs.existsSync(effectivePath)) continue;
                    if (!pluginData.enable) continue;
                    result.push({name: effectivePath, options: pluginData.options});
                } // loop settings.additionalPlugins.plugins
                return result;
            }()); //additionalPlugins
            markdownIt = (function () { // modify, depending in settings
                const extension = vscode.extensions.getExtension("Microsoft.vscode-markdown");
                if (!extension) return;
                const extensionPath = path.join(extension.extensionPath, "node_modules", "/");
                const named = require(extensionPath + "markdown-it-named-headers");
                let md = require(extensionPath + "markdown-it")().set(optionSet);
                if (settings.headingId) md = md.use(named);
                for (let pluginData in additionalPlugins) {
                    let plugin;
                    try {
                        plugin = require(additionalPlugins[pluginData].name);
                    } catch (requireException) {
                        continue;
                    } //exception
                    md = md.use(plugin, additionalPlugins[pluginData].options);
                } // using additionalPlugins
                return md;
            })();
            if (!vscode.workspace.rootPath) {
                vscode.window.showWarningMessage("No workspace. Use File -> Open Folder...");
                return;
            } //if
            action(settings);
        } catch (ex) {
            console.log(ex);
            vscode.window.showErrorMessage(ex.toString() + " Markdown conversion failed.");
        } //exception
    }; //command

    const convertOne = function (settings) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("Open Markdown file (.md)");
            return;
        } //if no editor
        if (editor.document.languageId != "markdown") return;
        const text = editor.document.getText(); 
        const outputFileName =
            convertText(
                text,
                editor.document.fileName,
                titleFinder(text, settings),
                settings.css,
                settings.embedCss);
        successAction(editor.document.fileName, outputFileName, settings);
    } //convertOne

    const convertSet = function (settings) {
        vscode.workspace.findFiles("**/*.md").then(function (files) {
            let count = 0;
            let lastInput = "";
            let lastOutput = "";
            for (let index = 0; index < files.length; ++index) {
                const fileName = files[index].fsPath;
                const text = fs.readFileSync(fileName, encoding);
                lastInput = fileName;
                lastOutput = convertText(
                    text,
                    fileName,
                    titleFinder(text, settings),
                    settings.css,
                    settings.embedCss);
                ++count;
            } //loop
            if (settings.reportSuccess)
                if (count == 0)
                    vscode.window.showWarningMessage("No .md files found in the workspace");
                else if (count == 1)
                    successAction(lastInput, lastOutput, settings);
                else
                    vscode.window.showInformationMessage(count + " files converted to HTML");
        });
    } //convertSet

    context.subscriptions.push(
        vscode.commands.registerCommand('extension.Markdown.ConvertToHtml', function () {
            command(convertOne);
        }));
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.Markdown.ConvertToHtml.All', function () {
            command(convertSet);
        }));

}; //exports.activate

exports.deactivate = function deactivate() { };
