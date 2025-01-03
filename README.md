# Extensible Markdown

This package is the Visual Studio Code *extension* supporting [Markdown](https://en.wikipedia.org/wiki/Markdown). It saves Markdown as HTML and optionally provides extended Markdown syntax with the capabilities for additional user extensions.

The extension depends on the [node.js](https://nodejs.org) Markdown parser [&ldquo;markdown-it&rdquo;](https://www.npmjs.com/package/markdown-it) built in Visual Studio Code.

Since v.&thinsp;2.0.0, the user can extend Markdown features by installing any [&ldquo;markdown-it&rdquo;](https://www.npmjs.com/package/markdown-it) plug-ins [abundantly available](https://www.npmjs.com/browse/keyword/markdown-it-plugin) in the [npm package registry](https://www.npmjs.com). All the packages can be configured from a single source: &ldquo;settings.json&rdquo;, [on the user or workspace level](https://code.visualstudio.com/docs/getstarted/settings).

## References

[Extensible Markdown On Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=sakryukov.extensible-markdown)<br/>
[Detailed Documentation](https://sakryukov.github.io/vscode-extensible-markdown/index.html)<br/>
[Original publication](https://sakryukov.github.io/publications/2017-06-29.All-in-One-Toolchain-for-Article-Writing-with-Visual-Studio-Code.html)

## Features

* Conversion of an individual file or all Markdown files of the current Visual Studio Code workspace;
* A possibility of installation of [&ldquo;markdown-it&ldquo; plug-ins](https://www.npmjs.com/package/markdown-it) in an arbitrary directory, without the need to install &ldquo;markdown-it&rdquo; itself;
* Optional user-configurable **auto-numbering** with a rich set of options;
* User-configurable Markup syntax coloring for plug-ins;
* Optional embedding of CSS in HTML;
* Optional Detection of the document title based on user-configurable Regular Expression;
* Preview in Visual Studio Code, in a full-size window or side by side, with styles fully matching the generated HTML file;
* Configuration of all processing details of the extension, [&ldquo;markdown-it&rdquo;](https://www.npmjs.com/package/markdown-it) and its plug-ins, from a single source.

## Usage

Open a Markdown file (.md) in Visual Studio Code and activate the editor's context menu, use the command **&ldquo;Markdown: Convert to HTML&rdquo;**, to convert this file. All files found in a currently opened workspace can be converted at once with the command **&ldquo;Markdown: Convert to HTML all .md files in workspace&rdquo;**. This command appears in the context menu of any editor, and also in the Explorer context menu.

Alternatively, open the Command Palette (`Ctrl+Shift+P`/`Cmd+Shift+P or `F1`) and search for these commands.

## Settings

The user can set up the extension of three levels: 1) general behavior of the commands, 2) detail of Markdown parsing and HTML production rules, and 3) plug-in options. The user can install additional plug-ins. If a plug-in has its own options, they are transparently passed from the user or workspace &ldquo;settings.json&rdquo; to the plug-in. See the [documentation](https://sakryukov.github.io/vscode-extensible-markdown/Extensible-Markdown.html) page for all the details.
