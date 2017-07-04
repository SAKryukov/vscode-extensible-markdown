exports.activate = function (context) {

    const Utf8BOM = "\ufeff";

    var vscode = require('vscode');
    const util = require('util');
    const fs = require('fs');
    const path = require('path');

    const getMarkdownPlugin = function () {
        const extension = vscode.extensions.getExtension("Microsoft.vscode-markdown");
        if (!extension) return;
        extensionPath = path.join(extension.extensionPath, "node_modules", "/");
        const named = require(extensionPath + "markdown-it-named-headers");
        const md = require(extensionPath + "markdown-it")()
            .set({ html: true, breaks: true, typographer: true })
            .use(named);
        return md;
    }; //getMarkdownPlugin

    const md = getMarkdownPlugin();

    const getCss = function (vscode) {
        var str = vscode.workspace.getConfiguration("markdown");
        return str["styles"];
    }; //getCss

    const getReportActions = function (vscode) { // see package.json, "configuration":
        const cfg = vscode.workspace.getConfiguration("markdown.extension.convertToHtml");
        return {
            reportSuccess: cfg["reportSuccess"],
            showHtmlInBrowser: cfg["showHtmlInBrowser"],
            showHtmlInVSCode: cfg["showHtmlInVSCode"]
        }
    }; //getReportActions

    const convertText = function (text, fileName) {
        var prefix = '<html>\n\t<head>\n\t\t<title>%s</title>\n\t\t<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />\n\t\t<link type="text/css" rel="stylesheet" href="%s" />\n\t</head>\n<body>\n\n';
        const suffix = '\n</body></html>';
        prefix = util.format(prefix,    
            util.format("Converted from: %s", path.basename(fileName)),
            getCss(vscode));
        const output = path.join(
            path.dirname(fileName),
            path.basename(fileName,
                path.extname(fileName))) + ".html";
        var result = md.render(text);
        result = Utf8BOM + prefix + result + suffix;
        fs.writeFileSync(output, result);
        return output;
    }; //convertText

    const successAction = function(input, output) {
        const actions = getReportActions(vscode);
        if (actions.reportSuccess) {
            vscode.window.showInformationMessage(
                util.format('Directory: "%s"', path.dirname(output)))
            vscode.window.showInformationMessage(
                util.format('Markdown file "%s" is converted to: "%s"',
                    path.basename(input),
                    path.basename(output)));
        } //if
        if (actions.showHtmlInBrowser)
            require('child_process').exec(output);
    } //successAction

    var disposableSingleCommand = vscode.commands.registerCommand('extension.Markdown.ConvertToHtml', function () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("Open Markdown file (.md)");
            return;
        } //if no editor
        if (editor.document.languageId != "markdown") return;
        const outputFileName = convertText(editor.document.getText(), editor.document.fileName);
        successAction(editor.document.fileName, outputFileName);
    }); //disposableSingleCommand

    var disposableMultipleCommand = vscode.commands.registerCommand('extension.Markdown.ConvertToHtml.All', function () {
        if (!vscode.workspace.rootPath) {
            vscode.window.showWarningMessage("No workspace. Use File -> Open Folder...");
            return;
        } //if
        vscode.workspace.findFiles("**/*.md").then(function (files) {
            let count = 0;
            for (var index = 0; index < files.length; ++index) {
                const fileName = files[index].fsPath;   
                const text = fs.readFileSync(fileName, "utf8"); 
                convertText(text, fileName);
                ++count;
            } //loop
            if (count == 0)
                vscode.window.showWarningMessage("No .md files found in the workspace");
            else if (count == 1)
                vscode.window.showInformationMessage("One file converted to HTML");
            else
                vscode.window.showInformationMessage(count + " files converted to HTML");
        });
    }); //disposableMultipleCommand

    context.subscriptions.push(disposableSingleCommand);
    context.subscriptions.push(disposableMultipleCommand);

}; //exports.activate

exports.deactivate = function deactivate() { };