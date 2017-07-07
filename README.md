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

### General Options   

| Name | Default | Description |
| --- | --- | --- |
| markdown.extension.convertToHtml.reportSuccess | true | Shows the message upon successful conversion, reports the names of the input and output files |
| markdown.extension.convertToHtml.showHtmlInBrowser | false | Opens generated HTML file in the default browser |
| markdown.extension.convertToHtml.embedCss | false | Used to embed CSS code found in CSS files in generated HTML |

The option "markdown.extension.convertToHtml.showHtmlInBrowser" is inapplicable to the command "Markdown: Convert to HTML all .md files in workspace": if a set of files is converted, none of those files is shown in a Web browser.

### Markdown-it Options

The extension is based on the "VS Code Markdown" extension, which supplied node.js module "markdown-it" with the plug-in "markdown-it-named-headers". Most of these options are exposed to the user of the extension:

| Name | Default | Description |
| --- | --- | --- |
| markdown.extension.convertToHtml.options.allowHTML | true | If true, allows HTML formatting, otherwise HTML code is rendered as text |
| markdown.extension.convertToHtml.options.headingId | true | Generates attribute `id` for h1.. h6 elements, which is controlled by the use of the plug-in "markdown-it-named-headers" |
| markdown.extension.convertToHtml.options.linkify | false | Renders "Link-like" text as anchor |
| markdown.extension.convertToHtml.options.br | true | End-of-line handling |
| markdown.extension.convertToHtml.options.typographer | true | *Typographer* option is used |
| markdown.extension.convertToHtml.options.smartQuotes | “”‘’ | If typographer option is true, replaces `""` and `''` characters |
| markdown.extension.convertToHtml.options.smartQuotes | see [below](#settings-default-value) | Descriptor of additional markdown-it plug-ins |

The value of the option "markdown.extension.convertToHtml.options.smartQuotes" should have four characters, otherwise the characters `""` and `''` are rendered as is, as if the option value was `""''`. It can be used to turn off "smart quotes" feature when other typographer processing is enabled.

Note that selection of "markdown-it" options can render generated HTML files different from the  preview based on "VS Code Markdown" extension. For example, this preview presently does not enable "linkify" and "typographer".

This is the sample fragment of the file "settings.json" file ([user or workspace settings](https://code.visualstudio.com/docs/getstarted/settings)):

```json
{
    "markdown.extension.convertToHtml.reportSuccess": true, // default
    "markdown.extension.convertToHtml.showHtmlInBrowser": false, // default
    "markdown.extension.convertToHtml.embedCss": false, // default
    // markdown-it options, all defaults:  
    "markdown.extension.convertToHtml.options.allowHTML": true,
    // "markdown-it-named-headers" plug-in, adds id attributes to h1 .. h6 elements:
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
        "absolutePath": null, // just a placeholder; absolute path has higher priority
        "relativePath": "../additional_plugins/node_modules", // relative to workspace
        "plugins": [
            {
                "name": "markdown-it-sub",
                "enable": true
            },
            {
                "name": "markdown-it-sup",
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

### Installation

### Settings: Default Value

This is how default value is shown in "package.json:
```Json
// ...
                    "default": {
                        "absolutePath": null,
                        "relativePath": null,
                        "plugins": [
                            {
                                "name": null,
                                "enable": true
                            }
                        ]
                    }
// ...
```
Main purpose of such default-value object is to provide the user a placeholder for structured plug-in descriptor data. The sample of the "settings.json" is shown above.

First, the settings specify path to the directory where the set of additional plug-ins is installed, either "absolutePath" or "relativePath". There is no need to include both properties, but it if happens, "absolutePath" is considered first. If it is not defined (more exactly, evaluates to "false" in conditional expression), "relativePath" is considered. It is assumed to be relative to the current Visual Studio Code workspace path. Then it's checked up if effective path exists. This path is assumed to be the parent path to each individual plug-in directory. Most typically, it has the name `node_modules"`.

For each plug-in, its name is specified. This name is always the same as the name of a plug-in sub-directory. Then the extension tries to load (`require`) each plugin, if its directory exists and the property "enable" is evaluates to `true`. If loading fails, the command execution continues with next plug-in. If a plug-in is successfully loaded, it's used by markdown-it.
