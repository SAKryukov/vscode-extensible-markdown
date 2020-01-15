"use strict";

exports.activate = context => {

    const encoding = "utf8";
    const Utf8BOM = "\ufeff";
    const stringEmpty = "";
    const commonDirectorySeparator = "/";
    const defaultSmartQuotes = '""' + "''";
    const markdownId = "markdown";
    const extensionManifiestFileName = "package.json";

    const vscode = require("vscode");
    const util = require("util");
    const fs = require("fs");
    const path = require("path");
    const childProcess = require("child_process");
    const semantic = require("./semantic");
    const idToc = require("./id.toc");
    const attribution = require("./attribution"); 
    const replacements = require("./replacements");
    const importContext = { vscode: vscode, util: util, fs: fs, path: path, markdownId: markdownId };

    const lazy = { lastOutputChannel: null, markdownIt: undefined, settings: undefined, decorationTypeSet: [] };

    const htmlTemplateSet = semantic.getHtmlTemplateSet(path, fs, encoding);
    
    const transcodeText = (text, fileName, css, embedCss, rootPath) => {
        text = semantic.replaceIncludes(importContext, text, fileName, lazy.settings);
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
            semantic.documentTitle ? semantic.documentTitle : `Converted from: ${path.basename(fileName)}`,
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
        if (!settings.reportSuccess) {
            if (settings.showHtmlInBrowser)
                for (let index = 0; index < count; ++index)
                    childProcess.exec(outputs[index]);
            return;
        } //if
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
            if (settings.showHtmlInBrowser)
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
                settings.embedCss,
                settings.outputPath,
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
                    settings.embedCss,
                    settings.outputPath,
                    rootPath));
            } //loop
            if (settings.reportSuccess)
                if (inputs.length < 1)
                    vscode.window.showWarningMessage("No .md files found in the workspace");
                else
                    successAction(inputs, outputs, settings);
        });
    } //convertSet

    const TextDocumentContentProvider = (function () {
        function TextDocumentContentProvider() {
            this.changeSourceHandler = new vscode.EventEmitter();
        } //TextDocumentContentProvider
        TextDocumentContentProvider.prototype.provideTextDocumentContent = function (uri) {
            if (this.currentSourceTextEditor)
                return command(previewOne);
        }; //TextDocumentContentProvider.prototype.provideTextDocumentContent
        Object.defineProperty(TextDocumentContentProvider.prototype, "onDidChange", {
            get: function () { return this.changeSourceHandler.event; }, enumerable: true, configurable: true
        });
        TextDocumentContentProvider.prototype.update = function (uri) {
            this.changeSourceHandler.fire(uri);
        }; //TextDocumentContentProvider.prototype.update
        return TextDocumentContentProvider;
    }()); //TextDocumentContentProvider
    const provider = new TextDocumentContentProvider();

    const updateDecorators = () => {
        if (!vscode.window.activeTextEditor) return;
        const document = vscode.window.activeTextEditor.document;
        if (document.languageId != markdownId) return;
        if (!lazy.settings)
            lazy.settings = semantic.getSettings(importContext);
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
                semantic.thenableRegex(plugin.regexString, text, !plugin.relativeToWholeText).then(
                    function (start, length, groups) {
                        let title = plugin.tooltipFormat;
                        if (groups[1] && title.includes("%s"))
                            title = util.format(title, groups[1].toString());
                        decoratorSet.push({
                            range: semantic.getVSCodeRange(vscode, document, start, groups[0]),
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
        updateDecorators();
    }, null, context.subscriptions);
    vscode.workspace.onDidChangeTextDocument(e => {
        if (e.document.languageId == markdownId)
            updateDecorators();
    }); //vscode.workspace.onDidChangeTextDocument
    vscode.workspace.onDidChangeConfiguration(e => {
        if (lazy.markdownIt)
            setupMarkdown(lazy.markdownIt);
        updateDecorators();
    }); //vscode.workspace.onDidChangeConfiguration

    context.subscriptions.push(
        vscode.commands.registerCommand("extensible.markdown.convertToHtml", () => {
            command(convertOne);
        }));
    context.subscriptions.push(
        vscode.commands.registerCommand("extensible.markdown.convertToHtml.all", () => {
            command(convertSet);
        }));

    const setupMarkdown = (baseImplementation) => {
        lazy.markdownIt = baseImplementation;
        if (!lazy.settings)
            lazy.settings = semantic.getSettings(importContext);
        const optionSet = (() => {
            // result.xhtmlOut: it closes all tags, like in <br />, non-default, but it would be a crime not to close tags:
            let result = { xhtmlOut: true, highlight: null, langPrefix: null };
            result.html = lazy.settings.allowHTML;
            result.typographer = lazy.settings.typographer;
            if (lazy.settings.typographer) {
                if (!lazy.settings.smartQuotes)
                    result.quotes = defaultSmartQuotes;
                else if (!lazy.settings.smartQuotes.length)
                    result.quotes = defaultSmartQuotes;
                else if (lazy.settings.smartQuotes.length < defaultSmartQuotes.length)
                    result.quotes = defaultSmartQuotes;
                else
                    result.quotes = lazy.settings.smartQuotes;
            } //if settings.typographer
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
        const setupUsage = ((md) => {
            if (!md) return;
            md.set(optionSet);
            const idTopOptions = {
                excludeFromTocRegex: lazy.settings.excludeFromTocRegex,
                tocItemIndentInEm: lazy.settings.tocItemIndentInEm,
                enableHeadingId: lazy.settings.headingId, // false => no id in headings => no TOC 
                headingIdPrefix: lazy.settings.headingIdPrefix,
                tocRegex: lazy.settings.tocRegex,
                includeLevel: lazy.settings.tocIncludeLevels,
                tocContainerClass: lazy.settings.tocContainerClass,
                autoNumberingRegex: lazy.settings.autoNumberingRegex,
            };
            md.use(idToc, idTopOptions);
            md.use(attribution, {
                titleLocatorRegex: lazy.settings.titleLocatorRegex,
                abbreviationRegex: lazy.settings.abbreviationRegex,
                attributeRegex: lazy.settings.attributeRegex,
                cssClassRegex: lazy.settings.cssClassRegex,
            });
            md.use(replacements, { });
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
    
    const getManifest = () => {
        const pathName = path.join(context.extensionPath, extensionManifiestFileName);
        const content = fs.readFileSync(pathName).toString();
        return JSON.parse(content);
    } //pathName

    return {
        extendMarkdownIt: baseImplementation => {
            try {
                return setupMarkdown(baseImplementation);
            } catch (ex) {
                vscode.window.showErrorMessage(`${getManifest().displayName}: activation failed`);
            } //exception
        }
    };

}; //exports.activate

exports.deactivate = () => { };
