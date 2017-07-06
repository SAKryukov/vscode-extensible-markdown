exports.activate = function (context) {

    const encoding = "utf8";
    const Utf8BOM = "\ufeff";

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

    const markdownIt = (function () {
        const extension = vscode.extensions.getExtension("Microsoft.vscode-markdown");
        if (!extension) return;
        extensionPath = path.join(extension.extensionPath, "node_modules", "/");
        const named = require(extensionPath + "markdown-it-named-headers");
        const md = require(extensionPath + "markdown-it")()
            .set({ html: true, breaks: true, typographer: true })
            .use(named);
        return md;
    })();

    const getSettings = function () { // see package.json, "configuration":
        const thisExtensionSection =
            vscode.workspace.getConfiguration("markdown.extension.convertToHtml");
        const sharedSection = vscode.workspace.getConfiguration("markdown");
        return {
            reportSuccess: thisExtensionSection["reportSuccess"],
            showHtmlInBrowser: thisExtensionSection["showHtmlInBrowser"],
            embedCss: thisExtensionSection["embedCss"],
            css: sharedSection["styles"]
        }
    }; //getSettings

    const convertText = function (text, fileName, css, embedCss) {
        let result = markdownIt.render(text);
        let style = "";
        for (index = 0; index < css.length; ++index) {
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
            util.format("Converted from: %s", path.basename(fileName)),
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
            if (!vscode.workspace.rootPath) {
                vscode.window.showWarningMessage("No workspace. Use File -> Open Folder...");
                return;
            } //if
            action(getSettings());
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
        const outputFileName =
            convertText(
                editor.document.getText(),
                editor.document.fileName,
                settings.css,
                settings.embedCss);
        successAction(editor.document.fileName, outputFileName, settings);
    } //convertOne

    const convertSet = function (settings) {
        vscode.workspace.findFiles("**/*.md").then(function (files) {
            let count = 0;
            let lastInput = "";
            let lastOutput = "";
            for (var index = 0; index < files.length; ++index) {
                const fileName = files[index].fsPath;
                const text = fs.readFileSync(fileName, encoding);
                lastInput = fileName;
                lastOutput = convertText(text, fileName, settings.css, settings.embedCss);
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
