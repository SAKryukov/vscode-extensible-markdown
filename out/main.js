"use strict";

exports.activate = function (context) {

    const encoding = "utf8";
    const Utf8BOM = "\ufeff";
    const defaultSmartQuotes = '""' + "''";
    const markdownId = "markdown";

    const vscode = require('vscode');
    const util = require('util');
    const fs = require('fs');
    const path = require('path');
    const importContext = { vscode: vscode, util: util, fs: fs, path: path, markdownId: markdownId };
    const semantic = require('./semantic');
    const idToc = require("./id.toc.js");

    const lazy = { lastOutputChannel: null, markdownIt: undefined, settings: undefined, decorationTypeSet: [] };

    const htmlTemplateSet = semantic.getHtmlTemplateSet(path, fs, encoding);
    const transcodeText = function (text, fileName, title, css, embedCss, rootPath) {
        text = semantic.replaceIncludes(importContext, text, fileName, lazy.settings);
        const result = lazy.markdownIt.render(text);
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
                    .replace(/\\/g, '/');
                style += util.format(htmlTemplateSet.style, relative);
            } //if
            if (index < css.length - 1) style += "\n";
        } //loop
        return util.format(htmlTemplateSet.html,
            title ?
                title : util.format("Converted from: %s", path.basename(fileName)),
            style,
            result);
    }; //transcodeText

    const convertText = function (text, fileName, title, css, embedCss, outputPath, rootPath) {
        let result = transcodeText(text, fileName, title, css, embedCss, rootPath);
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

    const successAction = function (inputs, outputs, settings) {
        const childProcess = require('child_process');
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
            lazy.lastOutputChannel.appendLine('');
            if (settings.showHtmlInBrowser)
                childProcess.exec(outputs[index]);
        } //loop
        if (count > 1)
            lazy.lastOutputChannel.appendLine(`${count} Markdown files files converted to HTML`);
        lazy.lastOutputChannel.show(true);
    }; //successAction

    const command = function (action) {
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

    const convertOne = function (settings) {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("Open Markdown file (.md)");
            return;
        } //if no editor
        if (editor.document.languageId != markdownId) return;
        const text = editor.document.getText();
        const rootPath = vscode.workspace.getWorkspaceFolder(editor.document.uri).uri.fsPath;
        const titleObject = semantic.titleFinder(text, settings);
        const title = titleObject ?
            titleObject.title : null;
        const outputFileName =
            convertText(
                text,
                editor.document.fileName,
                title,
                settings.css,
                settings.embedCss,
                settings.outputPath,
                rootPath);
        successAction([editor.document.fileName], [outputFileName], settings);
    } //convertOne

    const convertSet = function (settings) {
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
                    semantic.titleFinder(text, settings),
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

    const updateDecorators = function () {
        if (!vscode.window.activeTextEditor) return;
        const document = vscode.window.activeTextEditor.document;
        if (document.languageId != markdownId) return;
        if (!lazy.settings)
            lazy.settings = semantic.getSettings(importContext);
        const text = vscode.window.activeTextEditor.document.getText();
        const matches = semantic.titleFinder(text, lazy.settings);
        let decoratorSet = [];
        if (matches) {
            if (matches.all) {
                const title = matches.title ? matches.title.toString() : '';
                decoratorSet = [{
                    range: semantic.getVSCodeRange(vscode, document, matches.start, matches.all),
                    hoverMessage: util.format("Title: \"%s\"", title)
                }];
            } //if matches.all
        } //if matches
        vscode.window.activeTextEditor.setDecorations(
            lazy.settings.titleDecorationType,
            decoratorSet);
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
    } //updateDecorators
    updateDecorators();

    vscode.workspace.onDidOpenTextDocument(function (textDocument) {
        if (textDocument.languageId == markdownId)
            updateDecorators();
    });
    vscode.window.onDidChangeActiveTextEditor(function (editor) {
        updateDecorators();
    }, null, context.subscriptions);
    vscode.workspace.onDidChangeTextDocument(function (e) {
        if (e.document === vscode.window.activeTextEditor.document)
            provider.update(previewUri);
        if (e.document.languageId == "css")
            lazy.settings = undefined;
        else if (e.document.languageId == markdownId)
            updateDecorators();
    }); //vscode.workspace.onDidChangeTextDocument
    vscode.workspace.onDidChangeConfiguration(function (e) {
        lazy.settings = undefined;
        lazy.markdownIt = undefined;
        updateDecorators();
    }); //vscode.workspace.onDidChangeConfiguration

    context.subscriptions.push(
        vscode.commands.registerCommand('extensible.markdown.convertToHtml', function () {
            command(convertOne);
        }));
    context.subscriptions.push(
        vscode.commands.registerCommand('extensible.markdown.convertToHtml.all', function () {
            command(convertSet);
        }));

    const setupMarkdown = (baseImplementation) => {
        if (lazy.markdownIt)
            return baseImplementation;
        if (!lazy.settings)
            lazy.settings = semantic.getSettings(importContext);
        const optionSet = (function () {
            let result = { xhtmlOut: true }; // it closes all tags, like in <br />, non-default, but it's a crime not to close tags
            result.html = lazy.settings.allowHTML;
            result.typographer = lazy.settings.typographer;
            result.linkify = lazy.settings.linkify;
            result.breaks = lazy.settings.br;
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
        const additionalPlugins = (function () {
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
        }()); //additionalPlugins
        lazy.markdownIt = (function () { // modify, depending in settings
            let md = baseImplementation;
            if (!md) return;
            md.set(optionSet);
            //SA??? to restore
            md.use(idToc, {
                excludeFromTocRegex: lazy.settings.excludeFromTocRegex,
                defaultListElement: lazy.settings.tocListType,
                listElements: lazy.settings.listElements,
                defaultListElementAttributeSet: lazy.settings.defaultListElementAttributeSet,
                listElementAttributeSets: lazy.settings.listElementAttributeSets,
                //itemPrefixes: ... don't do it for now, maybe we can implement auto-numbering later
                enableHeadingId: lazy.settings.headingId, // false => no id in headings => no TOC 
                idPrefix: lazy.settings.headingIdPrefix,
                //stringModule: require(path.join(extensionPath, "string")), //SA??? extension path is not defined
                tocRegex: lazy.settings.tocRegex,
                includeLevel: lazy.settings.tocIncludeLevels,
                tocContainerClass: lazy.settings.tocContainerClass,
                tocListType: lazy.settings.tocListType,
                //autoNumbering: lazy.settings.autoNumbering, //SA??? causes exception
                autoNumberingRegex: lazy.settings.autoNumberingRegex,
            });
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
        return baseImplementation;
    }; //setupMarkdown
        
    return {
        extendMarkdownIt: baseImplementation => {
            try {
                return setupMarkdown(baseImplementation);
            } catch (ex) {
                vscode.window.showErrorMessage("Extensible Markdown Converter activation failed"); //SA???
            }
        }
    };

}; //exports.activate

exports.deactivate = function deactivate() { };
