# Extensible Markdown Converter

[![Latest Release](https://vsmarketplacebadge.apphb.com/version/sakryukov.convert-markdown-to-html.svg)](https://marketplace.visualstudio.com/items?itemName=sakryukov.convert-markdown-to-html)

This package is the Visual Studio Code *extension* supporting [Markdown](https://en.wikipedia.org/wiki/Markdown). The extension depends on the built-in extension "VS Code Markdown" and adds important function: it reads Markdown content from a currently active editor and converts to an HTML file.

Since v. 2.0.0, the user can extend Markdown features by installing any of the ["markdown-it" plug-ins](https://www.npmjs.com/package/markdown-it) that are [abundantly available](https://www.npmjs.com/browse/keyword/markdown-it-plugin) in the [npm package registry](https://www.npmjs.com). All the packages can be configured from a single source: "settings.json", [on the user or workspace level](https://code.visualstudio.com/docs/getstarted/settings).

That said, there is no a need for different Markdown extensions. It's quite enough to have only the built-in extension combined with Extensible Markdown Converter. All required functionality can be assembled from available plug-ins using the single unified configuration design.

See [detailed documentation](https://sakryukov.github.io/vscode-markdown-to-html).

## Features

- Conversion of individual file or all Markdown files of the current Visual Studio Code workspace;
- A possibility of installation of ["markdown-it" plug-ins](https://www.npmjs.com/package/markdown-it) in an arbitrary directory, without the need to install "markdown-it" itself;
- User-configurable Markup syntax coloring for plug-ins;
- Optional embedding of CSS in HTML;
- Optional Detection of the document title based on user-configurable Regular Expression;
- Optional preview in the default Web browser;
- Preview in Visual Studio Code, in a full-size window or side by side, with styles fully matching generated HTML file;
- Configuration of all processing detail of the extension, ["markdown-it"](https://www.npmjs.com/package/markdown-it) and its plug-ins, from a single source.

## Usage

Open Markdown file (.md) in Visual Studio Code and activate the editor's context menu, use the command **"Markdown: Convert to HTML"**, to convert this file. All files found in a currently opened workspace can be converted at once with the command **"Markdown: Convert to HTML all .md files in workspace"**. This command appears in context menu of any editor, and also in the Explorer context menu.

Two more commands showing in the editor's context menu show HTML preview using all of the extended features: **Markdown: Open <u>P</u>review** (`Ctrl+Shift+V`) and **Markdown: Open Preview to the <u>S</u>ide** (`Ctrl+K V`).

Alternatively, open the Command Palette ("`Ctrl+Shift+P`"/"`Cmd+Shift+P`" or `F1`) and search for the these commands.

## Settings

The user can set up the extension of three levels: 1) general behavior of the commands, 2) detail of Markdown parsing and HTML production rules, 3) plug-ins options. The user can install additional plug-ins. If a plug-in has its own options, they are transparently passed from user or workspace "settings.json" to the plug-in.

For detailed specifications, see the [documentation](https://sakryukov.github.io/vscode-markdown-to-html).

## Credits

The embedded [markdown-it](https://www.npmjs.com/package/markdown-it) was developed based on the study of two existing plug-ins. Even though there are almost no traces of the code of these contributions, they helped to learn some basic techniques:

- [markdown-it-named-headers](https://github.com/leff/markdown-it-named-headers) by [Jason Brackins](https://github.com/leff)
- [markdown-it-table-of-contents](https://github.com/Oktavilla/markdown-it-table-of-contents) by [Oktavilla](https://github.com/Oktavilla)

