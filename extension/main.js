"use strict";

exports.activate = context => {

    const encoding = "utf8";
    const Utf8BOM = "\ufeff";
    const stringEmpty = "";
    const commonDirectorySeparator = "/";
    const defaultSmartQuotes = '""' + "''";
    const markdownId = "markdown";
    const extensionManifiestFileName = "package.json";
    const typographerExtensionsRule = "extended_replacements";

    const vscode = require("vscode");
    const util = require("util");
    const fs = require("fs");
    const path = require("path");
    const childProcess = require("child_process");
    const utility = require("./utility");
    const setup = require("./setup");
    const includes = require("./includes"); 
    const idToc = require("./id.toc");
    const attribution = require("./attribution"); 
    const replacements = require("./replacements");

    const importContext = { vscode: vscode, util: util, fs: fs, path: path, markdownId: markdownId };
    const lazy = { lastOutputChannel: null, markdownIt: undefined, settings: undefined, decorationTypeSet: [] };

    const htmlTemplateSet = setup.getHtmlTemplateSet(path, fs, encoding);
    
    const transcodeText = (text, fileName, css, embedCss, rootPath) => {
        let result = lazy.markdownIt.render(text);
        let style = "";
        for (let index = 0; index < css.length; ++index) {
            if (embedCss) {
                const absolute = path.join(rootPath, css[index]);
                let cssCode = util.format(htmlTemplateSet.notFoundCss, absolute);
                if (fs.existsSync(absolute))
                    cssCode = fs.readFileSync(absolute, encoding);
                style += util.format(htmlTemplateSet.embeddedStyle, cssCode);
            } else {
                const relativePath = path.relative(path.dirname(fileName), rootPath);
                const relative =  path.join(relativePath, css[index])
                    .replace(/\\/g, commonDirectorySeparator);
                style += util.format(htmlTemplateSet.style, relative);
            } //if
            if (index < css.length - 1) style += "\n";
        } //loop
        return util.format(htmlTemplateSet.html,
            setup.documentTitle ? setup.documentTitle : `Converted from: ${path.basename(fileName)}`,
            style,
            result);
    }; //transcodeText

    const convertText = (text, fileName, css, embedCss, outputPath, rootPath) => {
        let result = transcodeText(text, fileName, css, embedCss, rootPath);
        const effectiveOutputPath = outputPath ?
            path.join(rootPath, outputPath) : path.dirname(fileName);
        if (!fs.existsSync(effectiveOutputPath))
            vscode.window.showErrorMessage(util.format("Path not found: %s", effectiveOutputPath));
        const output = path.join(
            effectiveOutputPath,
            path.basename(fileName,
                path.extname(fileName))) + ".html";
        result = Utf8BOM + result;
        fs.writeFileSync(output, result);
        return output;
    }; //convertText

    const successAction = (inputs, outputs, settings) => {
        const count = inputs.length;
        if (lazy.lastOutputChannel)
            lazy.lastOutputChannel.clear();
        else
            lazy.lastOutputChannel = vscode.window.createOutputChannel("Converted to HTML");
        for (let index = 0; index < count; ++index) {
            lazy.lastOutputChannel.appendLine("Markdown file");
            lazy.lastOutputChannel.appendLine(`${inputs[index]}`);
            lazy.lastOutputChannel.appendLine("is converted to");
            lazy.lastOutputChannel.appendLine(`${outputs[index]}`);
            lazy.lastOutputChannel.appendLine(stringEmpty);
            if (settings.thisExtensionSettings.convertToHtml.showHtmlInBrowser)
                childProcess.exec(outputs[index]);
        } //loop
        if (count > 1)
            lazy.lastOutputChannel.appendLine(`${count} Markdown files files converted to HTML`);
        lazy.lastOutputChannel.show(true);
    }; //successAction

    const command = action => {
        try {
            if (!vscode.workspace.workspaceFolders) {
                vscode.window.showWarningMessage("No workspace. Use File -> Open Folder...");
                return;
            } //if
            return action(lazy.settings);
        } catch (ex) {
            console.log(ex);
            vscode.window.showErrorMessage(ex.toString() + " Markdown conversion failed.");
        } //exception
    }; //command

    const convertOne = settings => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("Open Markdown file (.md)");
            return;
        } //if no editor
        if (editor.document.languageId != markdownId) return;
        const text = editor.document.getText();
        const rootPath = vscode.workspace.getWorkspaceFolder(editor.document.uri).uri.fsPath;
        const outputFileName =
            convertText(
                text,
                editor.document.fileName,
                settings.css,
                settings.thisExtensionSettings.convertToHtml.embedCss,
                settings.thisExtensionSettings.convertToHtml.outputPath,
                rootPath);
        successAction([editor.document.fileName], [outputFileName], settings);
    } //convertOne

    const convertSet = settings => {
        vscode.workspace.findFiles("**/*.md").then(function (files) {
            if (!files || files.length < 1)
                return  vscode.window.showWarningMessage("No Markdown files found");
            const inputs = [];
            const outputs = [];
            for (let index = 0; index < files.length; ++index) {
                const fileName = files[index].fsPath;
                const text = fs.readFileSync(fileName, encoding);
                inputs.push(fileName);
                const rootPath = vscode.workspace.getWorkspaceFolder(files[index]).uri.fsPath;
                outputs.push(convertText(
                    text,
                    fileName,
                    settings.css,
                    settings.thisExtensionSettings.convertToHtml.embedCss,
                    settings.thisExtensionSettings.convertToHtml.outputPath,
                    rootPath));
            } //loop
            if (inputs.length < 1)
                vscode.window.showWarningMessage("No .md files found in the workspace");
            else
                successAction(inputs, outputs, settings);
        });
    } //convertSet

    const updateDecorators = () => {
        if (!vscode.window.activeTextEditor) return;
        const document = vscode.window.activeTextEditor.document;
        if (document.languageId != markdownId) return;
        if (!lazy.settings)
            lazy.settings = setup.getSettings(importContext);
        const text = vscode.window.activeTextEditor.document.getText();
        // clean:
        for (let index in lazy.decorationTypeSet)
            vscode.window.activeTextEditor.setDecorations(lazy.decorationTypeSet[index], []);
        lazy.decorationTypeSet = [];
        // populate:
        if (lazy.settings.pluginSyntaxDecorators) {
            for (let index in lazy.settings.pluginSyntaxDecorators) {
                const plugin = lazy.settings.pluginSyntaxDecorators[index];
                if (!plugin) continue;
                let decoratorSet = [];
                const document = vscode.window.activeTextEditor.document;
                const text = document.getText();
                utility.thenableRegex(plugin.regexString, text, !plugin.relativeToWholeText).then(
                    function (start, length, groups) {
                        let title = plugin.tooltipFormat;
                        if (groups[1] && title.includes("%s"))
                            title = util.format(title, groups[1].toString());
                        decoratorSet.push({
                            range: setup.getVSCodeRange(vscode, document, start, groups[0]),
                            hoverMessage: title
                        });
                    }); //looped occurrences and groups
                vscode.window.activeTextEditor.setDecorations(
                    plugin.decorationType, decoratorSet);
                lazy.decorationTypeSet.push(plugin.decorationType);
            } //loop plugins
        } //loop additional plug-ins
    }; //updateDecorators
    updateDecorators();

    vscode.workspace.onDidOpenTextDocument(textDocument => {
        if (textDocument.languageId == markdownId)
            updateDecorators();
    });
    vscode.window.onDidChangeActiveTextEditor(e=> {
        if (e.document && e.document.languageId == markdownId)
            updateDecorators();
    }, null, context.subscriptions);
    vscode.workspace.onDidChangeTextDocument(e => {
        if (e.document && e.document.languageId == markdownId)
            updateDecorators();
    }); //vscode.workspace.onDidChangeTextDocument
    vscode.workspace.onDidChangeConfiguration(e => {
        if (lazy.markdownIt)
            setupMarkdown(lazy.markdownIt, true);
        updateDecorators(); // it checks up active text editor and its document anyway
    }); //vscode.workspace.onDidChangeConfiguration

    const setupMarkdown = (baseImplementation, updateSettings) => {
        if (updateSettings)
            lazy.markdownIt = new baseImplementation.constructor();
        else
            lazy.markdownIt = baseImplementation;
        if (!lazy.settings || updateSettings)
            lazy.settings = setup.getSettings(importContext);
        const optionSet = (() => {
            // result.xhtmlOut: it closes all tags, like in <br />, non-default, but it would be a crime not to close tags:
            let result = { xhtmlOut: true, highlight: null, langPrefix: null };
            result.html = lazy.settings.thisExtensionSettings.options.allowHTML;
            result.typographer = lazy.settings.thisExtensionSettings.options.typographer;
            if (lazy.settings.thisExtensionSettings.options.typographer) {
                if (!lazy.settings.thisExtensionSettings.options.smartQuotes)
                    result.quotes = defaultSmartQuotes;
                else if (!lazy.settings.thisExtensionSettings.options.smartQuotes.length)
                    result.quotes = defaultSmartQuotes;
                else if (lazy.settings.thisExtensionSettings.options.smartQuotes.length < defaultSmartQuotes.length)
                    result.quotes = defaultSmartQuotes;
                else
                    result.quotes = lazy.settings.thisExtensionSettings.options.smartQuotes;
            } //if typographer
            return result;
        })(); //optionSet
        const additionalPlugins = (() => {
            let result = [];
            if (!lazy.settings.additionalPlugins) return result;
            if (!lazy.settings.additionalPlugins.plugins) return result;
            if (!lazy.settings.additionalPlugins.plugins.length) return result;
            if (lazy.settings.additionalPlugins.plugins.length < 1) return result;
            let effectiveParentPath = lazy.settings.additionalPlugins.absolutePath;
            if (!effectiveParentPath) {
                let relativePath = lazy.settings.additionalPlugins.relativePath;
                if (!relativePath) return result;
                relativePath = relativePath.toString();
                const rootPath = vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor.document.uri).uri.fsPath;
                effectiveParentPath = path.join(rootPath, relativePath);
            } //if 
            if (!effectiveParentPath) return result;
            if (!fs.existsSync(effectiveParentPath.toString())) return result;
            for (let pluginDataProperty in lazy.settings.additionalPlugins.plugins) {
                const pluginData = lazy.settings.additionalPlugins.plugins[pluginDataProperty];
                if (!pluginData.name) continue;
                const effectivePath =
                    path.join(effectiveParentPath.toString(), pluginData.name.toString());
                if (!fs.existsSync(effectivePath)) continue;
                if (!pluginData.enable) continue;
                result.push({ name: effectivePath, options: pluginData.options });
            } // loop settings.additionalPlugins.plugins
            return result;
        })(); //additionalPlugins
        const setupUsage = (md => {
            if (!md) return;
            md.set(optionSet);
            md.use(includes, lazy.settings.thisExtensionSettings.includes);
            md.use(idToc, lazy.settings);
            md.use(attribution, lazy.settings.attribution);
            md.use(replacements, { });
            if (!lazy.settings.thisExtensionSettings.options.typographerExtensions)
                md.disable(typographerExtensionsRule);
            for (let pluginData in additionalPlugins) {
                let plugin;
                try {
                    plugin = require(additionalPlugins[pluginData].name);
                } catch (requireException) {
                    continue;
                } //exception
                md = md.use(plugin, additionalPlugins[pluginData].options);
            } // using additionalPlugins
        })(lazy.markdownIt);
        return baseImplementation;
    }; //setupMarkdown
    
    context.subscriptions.push(
        vscode.commands.registerCommand("extensible.markdown.convertToHtml", () => {
            command(convertOne);
        }));
    context.subscriptions.push(
        vscode.commands.registerCommand("extensible.markdown.convertToHtml.all", () => {
            command(convertSet);
        }));

    return {
        extendMarkdownIt: baseImplementation => {
            try {
                return setupMarkdown(baseImplementation);
            } catch (ex) {
                const getManifest = () => {
                    const pathName = path.join(context.extensionPath, extensionManifiestFileName);
                    const content = fs.readFileSync(pathName).toString();
                    return JSON.parse(content);
                } //getManifest            
                vscode.window.showErrorMessage(`${getManifest().displayName}: activation failed`);
            } //exception
        }
    };

}; //exports.activate

exports.deactivate = () => { };
