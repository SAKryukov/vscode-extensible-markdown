VSCode: Extensible Markdown Converter[](title)

[![Latest Release](https://vsmarketplacebadge.apphb.com/version/sakryukov.convert-markdown-to-html.svg)](https://marketplace.visualstudio.com/items?itemName=sakryukov.convert-markdown-to-html)

This package is the Visual Studio Code *extension* supporting [Markdown](https://en.wikipedia.org/wiki/Markdown). The extension depends on the built-in extension "VS Code Markdown" (`id="Microsoft.vscode-markdown"`) and adds important function: it reads Markdown content from a currently active editor and converts to an HTML file.

Since v. 2.0.0, the user can extend Markdown features by installing any of the ["markdown-it" plug-ins](https://www.npmjs.com/package/markdown-it) that are [abundantly available](https://www.npmjs.com/browse/keyword/markdown-it-plugin) in the [npm package registry](https://www.npmjs.com). All the packages can be configured from a single source: "settings.json", [on the user or workspace level](https://code.visualstudio.com/docs/getstarted/settings).

That said, there is no a need for different Markdown extensions. It's quite enough to have only the built-in extension combined with Extensible Markdown Converter. All required functionality can be assembled from available plug-ins using the single unified configuration design.   

[[toc]]

## Usage

Open Markdown file (.md) in Visual Studio Code and activate the editor's context menu, use the command "Markdown: Convert to HTML", to convert this file.

All files found in a currently opened workspace can be converted at once with the command "Markdown: Convert to HTML all .md files in workspace". This command appears in context menu of any editor, and also in the Explorer context menu.

Alternatively, open the Command Palette ("Ctrl+Shift+P"/"Cmd+Shift+P" or F1) and search for the command "Markdown: Convert to HTML" or "Markdown: Convert to HTML all .md files in workspace".

The HTML file is saved to the same directory as original Markdown file.

## Settings

### Three Levels of Settings

There are three levels of settings. The user of this extension can control them all.

1. [General options](#general-options) control the behavior of command and detail of the HTML output unrelated to Markdown formatting.

1. The extension is based on the [node.js](https://nodejs.org) *package* ["markdown-it"](https://www.npmjs.com/package/markdown-it). This module has its own options. [Markdown-it options](#markdown-it-options) define how the mark-down module should be set up before parsing.<br/>
There options are classified in two sets: a) embedded set of options, b) what plug-ins should be used.<br/>
Markdown-it can use other [node.js](https://nodejs.org) packages as plug-ins, each defining custom or extended parsing and rendering rules. See [customization of Additional Plug-Ins](#customization-of-additional-plug-ins).<br/>

1. Some of the ["markdown-it"](https://www.npmjs.com/package/markdown-it) plug-in packages have their own options. For example, see the package ["markdown-it-table-of-contents"](https://www.npmjs.com/package/markdown-it-table-of-contents). The example of setting its options in "settings.json" is shown in the [settings sample](#settings-sample).

### General Options   

| Name | Default | Description |
| --- | --- | --- |
| markdown.extension.convertToHtml.reportSuccess | true | Shows the message upon successful conversion, reports the names of the input and output files |
| markdown.extension.convertToHtml.showHtmlInBrowser | false | Opens generated HTML file in the default browser |
| markdown.extension.convertToHtml.embedCss | false | Used to embed CSS code found in CSS files in generated HTML |
| markdown.extension.convertToHtml.titleLocatorRegex | ^(.*?)\\[\\]\\(title\\) | Defines Regex pattern used to parse some fragment of Markdown text as title, to be used as HTML `head` `title` element |

The option "markdown.extension.convertToHtml.showHtmlInBrowser" is inapplicable to the command "Markdown: Convert to HTML all .md files in workspace": if a set of files is converted, none of those files is shown in a Web browser.

### Markdown-it Options

The extension is based on the "VS Code Markdown" extension, which supplies node.js module ["markdown-it"](https://www.npmjs.com/package/markdown-it) with the plug-in ["markdown-it-named-headers"](https://www.npmjs.com/package/markdown-it-named-headers). Since v.2.0.0, most of the module options are exposed to the user of the extension:

| Name | Default | Description |
| --- | --- | --- |
| markdown.extension.convertToHtml.options.allowHTML | true | If true, allows HTML formatting, otherwise HTML code is rendered as text |
| markdown.extension.convertToHtml.options.headingId | true | Generates attribute `id` for `h1`.. `h6` elements, which is controlled by the use of the plug-in "markdown-it-named-headers" |
| markdown.extension.convertToHtml.options.linkify | false | Renders "Link-like" text as link |
| markdown.extension.convertToHtml.options.br | true | [New line](https://en.wikipedia.org/wiki/Newline) handling: if true, line separators are replaced with the HTML *element* `br` |
| markdown.extension.convertToHtml.options.typographer | true | [*Typographer*](#Typographer) option is used |
| markdown.extension.convertToHtml.options.smartQuotes | `“”‘’` | If typographer option is true, replaces `""` and `''` characters |
| markdown.extension.convertToHtml.options.additionalPlugins | see [below](#customization-of-additional-plug-ins) | Descriptor of [additional markdown-it plug-ins](#additional-plug-ins) |

The value of the option "markdown.extension.convertToHtml.options.smartQuotes" should have four characters, otherwise the characters `""` and `''` are rendered as is, as if the option value was `""''`. It can be used to turn off "smart quotes" feature when other typographer processing is enabled.

Note that selection of "markdown-it" options can render generated HTML files different from the  preview based on "VS Code Markdown" extension. For example, this preview presently does not enable "linkify" and "typographer".

### Typographer

Typographer substitution rules:

1. `+-` → ±
1. `...` → …
1. `---` → — ([em dash](https://en.wikipedia.org/wiki/Dash#Em_dash))
1. `--` → – ([en dash](https://en.wikipedia.org/wiki/Dash#En_dash))
1. `"…"`: depends on "markdown.extension.convertToHtml.options.smartQuotes" value, two first characters
1. `'…'`: depends on "markdown.extension.convertToHtml.options.smartQuotes" value, two last characters

### Settings Sample

This is the sample fragment of the file "settings.json" file ([user or workspace settings](https://code.visualstudio.com/docs/getstarted/settings)):

```json
{
    "markdown.extension.convertToHtml.reportSuccess": true, // default
    "markdown.extension.convertToHtml.showHtmlInBrowser": false, // default
    "markdown.extension.convertToHtml.embedCss": false, // default
    "markdown.extension.convertToHtml.titleLocatorRegex": // default
        "^(.*?)\\[\\]\\(title\\)",        
    // markdown-it options, all defaults:  
    "markdown.extension.convertToHtml.options.allowHTML": true,
    // "markdown-it-named-headers" plug-in,
    // adds id attributes to h1 .. h6 elements:
    "markdown.extension.convertToHtml.options.headingId": true,
    // converts "link-like" text: for ex., "http://my.com" ->
    // <a href="http://my.com">"http://my.com"</a>: 
    "markdown.extension.convertToHtml.options.linkify": false,
    // replaces new line marker with <br/>:
    "markdown.extension.convertToHtml.options.br": true,
    // typographer replaces -- --- with en dash and em dash, smart quotes, etc.:
    "markdown.extension.convertToHtml.options.typographer": true,
    // applicable if typographer is true:
    // 4 characters, replacement for "" and '':
    "markdown.extension.convertToHtml.options.smartQuotes": "“”‘’",    
    "markdown.extension.convertToHtml.options.additionalPlugins": {
        "absolutePath": "", // in this case, just a placeholder; absolute path has higher priority
        "relativePath": "../additional_plugins/node_modules", // relative to workspace
        "plugins": [
            {
                "name": "markdown-it-sub",
                "enable": true
            },
            {
                "name": "markdown-it-sup",
                "enable": true
            },
            {
                "name": "markdown-it-table-of-contents",
                "options": { // content of this object depends on plug-in:
                    "includeLevel": [2, 3, 4],
                    "containerClass": "toc",
                    "listType": "ul"
                },
                "enable": true
            }
        ]
    },

    "markdown.styles": [
        // same styles used for preview are used in converted HTML files:
        "style.css", 
        "moreStyles.css"
    ],

    // ...
	
    "cSpell.enabled": true
}
```

The extension also uses "markdown.styles" option related to the extension "VS Code Markdown".
If one of more CSS files is defined, they are used in the generated HTML files as *external* or *embedded* style sheets, depending on the option "markdown.extension.convertToHtml.embedCss". The user is responsible for supplying the CSS files themselves.

## Additional Plug-ins

Since v. 2.0.0, additional ["markdown-it"](https://www.npmjs.com/package/markdown-it) [plug-ins](https://www.npmjs.com/browse/keyword/markdown-it-plugin) can be installed by the users of the extension and configured for the use with Visual Studio Code.

### Installation

All ["markdown-it"](https://www.npmjs.com/package/markdown-it) plug-ins can be installed using [node.js](https://nodejs.org) [npm](https://www.npmjs.com) without installation of the ["markdown-it"](https://www.npmjs.com/package/markdown-it) module itself, as it is already installed with Visual Studio Code. It is assumed that all such plug-ins are installed in the same `"node_modules"` directory. The "convert-markdown-to-html" does not require installation of plug-ins to the same directory as any of the ["markdown-it"](https://www.npmjs.com/package/markdown-it). It is recommended to install the plug-ins separately.

Initial installation of plug-ins requires installation of [node.js](https://nodejs.org), but node.js is not required after the plug-ins are installed. Plug-ins can be installed *locally* (recommended):

```
npm install --save a-name-of-markdown-it-plug-in
```

### Customization of Additional Plug-Ins

Additional plug-ins are set up with one single "setting.json" option: ["markdown.extension.convertToHtml.options.additionalPlugins"](#markdown-it-options).

This is how default value is shown in "package.json:
```Json
// ...
                    "default": {
                        "absolutePath": "",
                        "relativePath": "",
                        "plugins": [
                            {
                                "name": "",
                                "enable": true,
                                "options": {}
                            }
                        ]
                    }
// ...
```
Main purpose of such default-value object is to provide the user a placeholder for structured plug-in descriptor data. The sample of the "settings.json" is shown [above](#settings-sample).

First, the settings specify path to the directory where the set of additional plug-ins is installed, either "absolutePath" or "relativePath". There is no need to include both properties, but it if happens, "absolutePath" is considered first. If it is not defined (more exactly, evaluates to "false" in conditional expression), "relativePath" is considered. It is assumed to be relative to the current Visual Studio Code workspace path. Then it's checked up if effective path exists. This path is assumed to be the parent path to each individual plug-in directory. Most typically, it has the name `"node_modules"`.

For each plug-in, its name is specified. This name is always the same as the name of a plug-in sub-directory. Then the extension tries to load (`require`) each plugin, if its directory exists and the property "enable" is evaluates to `true`. If loading fails, the command execution continues with next plug-in. If a plug-in is successfully loaded, it's used by markdown-it, with options specified by the "options" object, which can be omitted.
