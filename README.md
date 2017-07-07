# VS Code — Markdown to HTML

[![Latest Release](https://vsmarketplacebadge.apphb.com/version/sakryukov.convert-markdown-to-html.svg)](https://marketplace.visualstudio.com/items?itemName=sakryukov.convert-markdown-to-html)

This extension reads Markdown content from a currently active editor, converts it to HTML and saves it in a file.
The extension depends on the built-in extension "VS Code Markdown" (`id="Microsoft.vscode-markdown"`) and augments it.

**Since v. 2.0.0, due to the mechanism of user-installed ["markdown-it"](https://www.npmjs.com/package/markdown-it) plug-ins and customization design, this extension can be used as an alternative and replacement for all other optional Markdown extensions.**

## Usage

Open Markdown file (.md) in Visual Studio Code and activate the editor's context menu, use the command "Markdown: Convert to HTML", to convert this file.

All files found in a currently opened workspace can be converted at once with the command "Markdown: Convert to HTML all .md files in workspace". This command appears in context menu of any editor, and also in the Explorer context menu.

Alternatively, open the Command Palette ("Ctrl+Shift+P"/"Cmd+Shift+P" or F1) and search for the command "Markdown: Convert to HTML" or "Markdown: Convert to HTML all .md files in workspace".

The HTML file is saved to the same directory as original Markdown file.

## Settings

The user can set up the extension of three levels: 1) general behavior of the commands, 2) detail of Markdown parsing and HTML production rules, 3) plug-ins options. The user can install additional plug-ins. If a plug-in has its own options, they are transparently passed from user or workspace "settings.json" to the plug-in.

For detailed specifications, see the [documentation](https://sakryukov.github.io/vscode-markdown-to-html).