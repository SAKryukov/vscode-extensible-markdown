# VS Code — Markdown to HTML

[![Latest Release](https://vsmarketplacebadge.apphb.com/version/sakryukov.convert-markdown-to-html.svg)](https://marketplace.visualstudio.com/items?itemName=sakryukov.convert-markdown-to-html)

This extension reads Markdown content from a currently active editor, converts it to HTML and saves it in a file.
The extension depends on the built-in extension "VS Code Markdown" (`id="Microsoft.vscode-markdown"`) and augments it.

## Usage

Open Markdown file (.md) in Visual Studio Code and activate the editor's context menu, use the command "Markdown: Convert to HTML", to convert this file.

All files found in a currently opened workspace can be converted at once with the command "Markdown: Convert to HTML all .md files in workspace". This command appears in context menu of any editor, and also in the Explorer context menu.

Alternatively, open the Command Palette ("Ctrl+Shift+P"/"Cmd+Shift+P" or F1) and search for the command "Markdown: Convert to HTML" or "Markdown: Convert to HTML all .md files in workspace".

The HTML file is saved to the same directory as original Markdown file.

## Settings

The extension introduces three options:   

- "markdown.extension.convertToHtml.reportSuccess" shows the message upon successful conversion, reports the names of the input and output files
- "markdown.extension.convertToHtml.showHtmlInBrowser" opens generated HTML file in the default browser
- "markdown.extension.convertToHtml.embedCss" used to embed CSS code found in CSS files in generated HTML

The option "markdown.extension.convertToHtml.showHtmlInBrowser" is inapplicable to the command "Markdown: Convert to HTML all .md files in workspace": if a set of files is converted, none of those files is shown in a HTML browser.

This is the fragment of the file "settings.json" file ([user or workspace settings](https://code.visualstudio.com/docs/getstarted/settings)):

```json
{
    "markdown.extension.convertToHtml.reportSuccess": true, // default
    "markdown.extension.convertToHtml.showHtmlInBrowser": false, // default
    "markdown.extension.convertToHtml.embedCss": false, // default
    "markdown.styles": [
        // same styles used for preview are used in converted HTML files:
        "styles.css", 
        "moreStyles.css"
    ],

    // ...
	
    "cSpell.enabled": true
}
```

The extension also uses "markdown.styles" option related to the extension "VS Code Markdown".
If one of more CSS files is defined, they are used in the generated HTML files as *external* or *embedded* style sheets, depending on the option "markdown.extension.convertToHtml.embedCss". The user is responsible for supplying the CSS files themselves.
