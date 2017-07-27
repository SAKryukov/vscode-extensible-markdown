VSCode: Extensible Markdown Converter[](title)

[*Sergey A Kryukov*](https://www.SAKryukov.org)

[![Latest Release](https://vsmarketplacebadge.apphb.com/version/sakryukov.convert-markdown-to-html.svg)](https://marketplace.visualstudio.com/items?itemName=sakryukov.convert-markdown-to-html)

This package is the Visual Studio Code *extension* supporting [Markdown](https://en.wikipedia.org/wiki/Markdown). The extension depends on the built-in extension "VS Code Markdown" (`id="Microsoft.vscode-markdown"`) and adds important function: it reads Markdown content from a currently active editor and converts to an HTML file.

Since v. 2.0.0, the user can extend Markdown features by installing any of the ["markdown-it" plug-ins](https://www.npmjs.com/package/markdown-it) that are [abundantly available](https://www.npmjs.com/browse/keyword/markdown-it-plugin) in the [npm package registry](https://www.npmjs.com). All the packages can be configured from a single source: "settings.json", [on the user or workspace level](https://code.visualstudio.com/docs/getstarted/settings).

That said, there is no a need for different Markdown extensions. It's quite enough to have only the built-in extension combined with Extensible Markdown Converter. All required functionality can be assembled from available plug-ins using the single unified configuration design.

## Contents[](notoc)

[](toc)

## Features

- Conversion of individual file or all Markdown files of the current Visual Studio Code workspace;
- A possibility of installation of ["markdown-it" plug-ins](https://www.npmjs.com/package/markdown-it) in an arbitrary directory, without the need to install "markdown-it" itself;
- Optional user-configurable **auto-numbering** with rich set of options;
- User-configurable Markup syntax coloring for plug-ins;
- Optional embedding of CSS in HTML;
- Optional Detection of the document title based on user-configurable Regular Expression;
- Optional preview in the default Web browser;
- Preview in Visual Studio Code, in a full-size window or side by side, with styles fully matching generated HTML file;
- Configuration of all processing detail of the extension, "[markdown-it](https://www.npmjs.com/package/markdown-it)" and its plug-ins, from a single source.

## Usage

Open Markdown file (.md) in Visual Studio Code and activate the editor's context menu, use the command "Markdown: Convert to HTML", to convert this file. All files found in a currently opened workspace can be converted at once with the command "Markdown: Convert to HTML all .md files in workspace". This command appears in context menu of any editor, and also in the Explorer context menu.

Alternatively, open the Command Palette ("`Ctrl+Shift+P`"/"`Cmd+Shift+P`" or `F1`) and search for the command "Markdown: Convert to HTML" or "Markdown: Convert to HTML all .md files in workspace".

The HTML file is saved to the same directory as original Markdown file, if not specified otherwise [by settings](#special-markdown-extension-convertToHtml-outputPath).

### Preview

Preview presents certain concerns, because built-in extension "VS Code Markdown" already implements the same two preview commands for Markdown.

Anyway, "Extensible Markdown Converter" extension defines keybinding to overwrite default preview keybinding:

- Open Preview: Ctrl+Shift+V
- Open Preview to Side: Ctrl+K V

As the extension "VS Code Markdown" uses fixed set of Markdown-specific options and does not load [additional plug-ins](#heading.additional-plug-ins), "VS Code Markdown" preview can be different from "Extensible Markdown Converter" rendering.

So, it's important to know the difference, to make sure the rendering is performed by Extensible Markdown Converter.

| Extension | Command | Command Title |
| --- | --- | --- |
| VS Code Markdown | markdown.showPreview | Markdown: Open Preview |
| Extensible Markdown Converter | extensible.markdown.showPreview | Markdown: Open &Preview |
| VS Code Markdown | markdown.showPreviewToSide | Markdown: Open Preview to Side |
| Extensible Markdown Converter | extensible.markdown.showPreviewToSide | Markdown: Open Preview to &Side |

In the Visual Studio Code UI, '&' is rendered as underscore and can be used as *hardware accelerator*: "Markdown: Open &Preview", "Markdown: Open Preview to &Side". These two strings are shown in the UI *Command Palette* as is, with '&'. Note that two `extensible.markdown.showPreview*` commands are also shown in the current editor's context menu, but "VS Code Markdown" `markdown.showPreview*` commands are not.

## Extending of Markdown Syntax

Markdown syntax can be extended. With Extensible Markdown Converter, all of them are user-configurable. At the very minimum,each extension can be enabled and disabled, and some extension allow for detailed configuration. All configurations can be modified [on the user or workspace level](https://code.visualstudio.com/docs/getstarted/settings) or combine both.

They can be classified into two parts: in first part, extensions are based on embedded "VSCode Markdown" extension. They come with Visual Studio Code installation, but are not fully exposed to the end user. The new "Extensible Markdown Converter" extension exposes most of them to user-defined "settings.json" files, so they are made configurable.

In second part, new extensions are added by Extensible Markdown Converter. Some are embedded, others can be installed and then configured by the user.

### Markdown-it Extensions

The embedded extension "VSCode Markdown" is based on the [node.js](https://nodejs.org) *package* ["markdown-it"](https://www.npmjs.com/package/markdown-it). This module does not require installation, it comes with Visual Studio Code. Extensible Markdown Converter exposed the following extended features: Typographer, "smart quotes" (can used when Typographer is enabled), enabled or disabled HTML formatting in input Markdown document, "linkify", generation of `br` attributes. The configuration parameters are described in the section [Markdown-it Options](#heading.markdown-it-options).

### Extensible Markdown Converter Embedded Extensions

Extensible Markdown Converter adds three syntax elements to Markdown:

- Tagging for detection of the document title
- File include declaration
- Table of Contents (TOC) tag
- Exclude from TOC tag

In addition to these syntactic extensions, version 5.0.0 introduces two new TOC features enabled through configuration options, without any addition to the Markdown syntax. The rendering of list items of the TOC can be defined on for the whole document, or separately per level of TOC. This way, the choice between `ul` (default) or `ul` list element can be done globally or per TOC level. Also, each of these element can be give a global or level-dependent set of HTML *attributes*. One of the uses of these attribute is setting `class` attribute. However, attributes are not limited to the classes. The possibility of adding arbitrary attributes is very important for the not uncommon situation where the document hosting does not provide access to CSS. Instead, inline `style` attribute can solve the problem. The configuration setting for these is described [below](#heading.extensible-markdown-converter-extension-options).

By default, both elements use *pseudo-link* form based on Markdown *link* syntax. They take the form: `[](some-tag)`. Even when such element produces HTML anchor, it gives no clickable area (normally defined by the text between [] brackets). The user can create/modify "settings.json" to describe any other suitable syntax, which is done in Regular Expression form.

Document title needs to get detected, because HTML requires a text value for the `title` element of the element `head`. The idea is to use some available Markdown element, which is actually rendered on HTML page, without replacing it, but with just tagging it as a title text.

The default syntax for title detection is:

```
The Name of The Document[](title)
```

In this example, the text "The Name of The Document" is copied to HTML `title`.

The default syntax for file include is: {id=special.include.file}

```
[](include( file-name... ))
// file-name expression should come without blank space characters
```

The default syntax for TOC tag is:

```
[](toc)
```

This tag works if it is placed at the beginning of a line. 

New feature in version 5.0.0 is the "no toc" tag. It is used to exclude some headings from the TOC. It can be important for headings like "Contents" or "Table of Contents". The default syntax for this tag is:

```
[](notoc)
```
This tag can be placed anywhere in the content of a heading text. 

Again, the user can use any other syntax .

Only first occurrence of the document title tag is taken into account. In Markdown view, it can be seen on *syntax coloring* of this element. Other elements, including TOC, can appear multiple times. Note that TOC feature works in collaboration with automatic generation of the `id` attributes for all heading elements (`h1`.. `h6`), which is also embedded in the extension.

All these elements are emphasized in source Markdown document by [syntax coloring](#heading.syntax-coloring) with coloring style configured by the user. Please see the description of the [settings](#heading.extensible-markdown-converter-syntax-extension-options).

### Extensible Markdown Converter User-Installed Extensions

The configuration option ["`markdown.extension.convertToHtml.options.additionalPlugins`"](#heading.markdown-it-options) is used for adding the referenced to additional ["markdown-it"](https://www.npmjs.com/package/markdown-it) plug-ins which can be installed by the user. Please see the section [Customization of Additional Plug-Ins](#heading.customization-of-additional-plug-ins) for the detail.

## Settings

### Three Levels of Settings

There are three levels of settings. The user of this extension can control them all.

1. [General options](#heading.general-options) control the behavior of command and detail of the HTML output unrelated to Markdown formatting.

1. The extension is based on the [node.js](https://nodejs.org) *package* ["markdown-it"](https://www.npmjs.com/package/markdown-it). This module has its own options. [Markdown-it options](#heading.markdown-it-options) define how the mark-down module should be set up before parsing.<br/>
There options are classified in two sets: a) embedded set of options, b) what plug-ins should be used.<br/>
Markdown-it can use other [node.js](https://nodejs.org) packages as plug-ins, each defining custom or extended parsing and rendering rules. See [customization of Additional Plug-Ins](#heading.customization-of-additional-plug-ins).<br/>

1. Some of the ["markdown-it"](https://www.npmjs.com/package/markdown-it) plug-in packages have their own options. For example, see the package ["markdown-it-table-of-contents"](https://www.npmjs.com/package/markdown-it-table-of-contents). The example of setting its options in "settings.json" is shown in the [settings sample](#heading.settings-sample).

### General Options

| Name | Default | Description |
| --- | --- | --- |
| markdown.extension.convertToHtml.reportSuccess | true | Shows the message upon successful conversion, reports the names of the input and output files |
| markdown.extension.convertToHtml.showHtmlInBrowser | false | Opens generated HTML file in the default browser |
| markdown.extension.convertToHtml.embedCss | false | Used to embed CSS code found in CSS files in generated HTML |
| markdown.extension.convertToHtml.outputPath | `""` | Specifies output path for generated HTL files, relative to current workspace |

The option "`markdown.extension.convertToHtml.showHtmlInBrowser`" is inapplicable to the command "Markdown: Convert to HTML all .md files in workspace": if a set of files is converted, none of those files is shown in a Web browser.

<i id="special-markdown-extension-convertToHtml-outputPath"></i>
The option "`markdown.extension.convertToHtml.outputPath`" is ignored it its value resolves to false (empty string, `null`, `undefined`). If defined, it specify the path relative to current workspace directory. The effective target directory may not exist — in this case, error message is shown. If it exists, all files are saved in the same directory. In this case, it's possible that the HTML files with identical base names but different locations overwrite one another. The user is responsible for suitability of the file names.

### Extensible Markdown Converter Extension Options

| Name | Default | Description |
| --- | --- | --- |
| markdown.extension.convertToHtml.titleLocatorRegex | `^(.*?)\[\]\(title\)` | Defines Regex pattern used to parse some fragment of Markdown text as title, to be used as HTML `head` `title` element |
| markdown.extension.convertToHtml.titleLocatorDecoratorStyle | see ["settings.json" sample](#heading.special-settings.json) | CSS style for syntax coloring of the title extended Markdown tag element |
| markdown.extension.convertToHtml.options.headingId | true | Enables or disables generation of the `id` attributes for `h1`.. `h6` elements |
| markdown.extension.convertToHtml.options.headingIdPrefix | `heading.` | If generation of the `id` attributes is enabled, the heading is added to each `id` value of each `h1`.. `h6` element |
| markdown.extension.convertToHtml.tocRegex | `^\[\]\(toc\)` | Defines Regex pattern used to recognize the location where Table Of Contents (TOC) is placed |
| markdown.extension.convertToHtml.excludeFromTocRegex | `\\[\\]\\(notoc\\)` | Marks the heading elements to be excluded from TOC |
| markdown.extension.convertToHtml.excludeFromTocLocatorDecoratorStyle | see ["settings.json" sample](#heading.special-settings.json) | CSS style for syntax coloring of the tag marking a heading to be excluded from TOC |
| markdown.extension.convertToHtml.tocDecoratorStyle | see ["settings.json" sample](#heading.special-settings.json) | CSS style for syntax coloring of the title extended Markdown tag marking the TOC placing |
| markdown.extension.convertToHtml.tocIncludeLevels | [1, 2, 3, 4, 5, 6] | Defines level of the headers to be included in TOC |
| markdown.extension.convertToHtml.defaultListElement | `ul` | Default HTML element for all TOC list elements. This option is ignored if one or more elements are defined on per-level basis (see below) |
| markdown.extension.convertToHtml.listElements | `[]` | Array of strings each defining an HTML element for a TOC list on each TOC level (see above) |
| markdown.extension.convertToHtml.defaultListElementAttributeSet | `{ "style": "list-style-type: none;" }` | An object defining set of HTML attributes to be added for all TOC list elements. This option is ignored if one or more sets is defined on per-level basis (see below) |
| markdown.extension.convertToHtml.listElementAttributeSets | `[]` | Array of sets of HTML attributes, same as above, but defining an attribute set for each TOC level |
| markdown.extension.convertToHtml.tocContainerClass | `toc` | CSS class of the TOC container (by default, `ul`) |
| markdown.extension.convertToHtml.tocListType | `ul` | HTML element representing TOC container; alternatively, can be `ol` |
| markdown.extension.convertToHtml.includeLocatorRegex | `\[\]\(include\(([^\s]+?)\)\)` | Defines Regex pattern used to define file include Markdown syntax extension |
| markdown.extension.convertToHtml.includeLocatorInvalidRegexMessageFormat | `!!! invalid Regular Expression of include:  "%s` | Message format for the message produced in the output HTML in case of invalid Regular Expression |
| markdown.extension.convertToHtml.includeLocatorFileReadFailureMessageFormat | `!!! failed to read file "%s" !!!` | Message format for the message produced in the output HTML in case of the file reading failure |
| markdown.extension.convertToHtml.includeLocatorDecoratorStyle | see ["settings.json" sample](#heading.special-settings.json) | CSS style for syntax coloring of the file include extended Markdown tag element |
| markdown.extension.convertToHtml.autoNumbering | `{ enable: false }` | Structure of auto-numbering; see [Auto-Numbering](#heading.auto-numbering); with default value `null` the effective options are taken from the embedded plugin default |
|markdown.extension.convertToHtml.autoNumberingRegex | `\[\]\(\=numbering([\s\S]*?)\=\)` | Defines Regex pattern for the tag used to define structure of auto-numbering at the document level. See [Auto-Numbering](#heading.auto-numbering). This tag should come at first position of the Markdown document file. |
| markdown.extension.convertToHtml.autoNumberingDecoratorStyle | see default settings | CSS style for syntax coloring of the auto-numbering extended Markdown tag element (above) |

### Markdown-it Options

The extension is based on the "VS Code Markdown" extension, which supplies node.js module ["markdown-it"](https://www.npmjs.com/package/markdown-it) with the plug-in ["markdown-it-named-headers"](https://www.npmjs.com/package/markdown-it-named-headers). Since v.2.0.0, most of the module options are exposed to the user of the extension:

| Name | Default | Description |
| --- | --- | --- |
| markdown.extension.convertToHtml.options.allowHTML | true | If true, allows HTML formatting, otherwise HTML code is rendered as text |
| markdown.extension.convertToHtml.options.linkify | false | Renders "Link-like" text as link |
| markdown.extension.convertToHtml.options.br | true | [New line](https://en.wikipedia.org/wiki/Newline) handling: if true, line separators are replaced with the HTML *element* `br` |
| markdown.extension.convertToHtml.options.typographer | true | [*Typographer*](#heading.Typographer) option is used |
| markdown.extension.convertToHtml.options.smartQuotes | `“”‘’` | If typographer option is true, replaces `""` and `''` characters |
| markdown.extension.convertToHtml.options.additionalPlugins | see [below](#heading.customization-of-additional-plug-ins) | Descriptor of [additional markdown-it plug-ins](#heading.additional-plug-ins) |

The value of the option "`markdown.extension.convertToHtml.options.smartQuotes`" should have four characters, otherwise the characters `""` and `''` are rendered as is, as if the option value was `""''`. It can be used to turn off "smart quotes" feature when other typographer processing is enabled.

Note that selection of "markdown-it" options can render generated HTML files different from the  preview based on "VS Code Markdown" extension. For example, this preview presently does not enable "linkify" and "typographer".

### Settings Sample

This is the sample fragment of the file "settings.json" file ([user or workspace settings](https://code.visualstudio.com/docs/getstarted/settings)):{id=special-settings.json}

```json
[](include(vscode-workspace-sample/.vscode/settings.json))
```

The extension also uses "`markdown.styles`" option related to the extension "VS Code Markdown".
If one of more CSS files is defined, they are used in the generated HTML files as *external* or *embedded* style sheets, depending on the option "`markdown.extension.convertToHtml.embedCss`". The user is responsible for supplying the CSS files themselves.

## Advanced Usage and Settings

### Typographer

To use the typographer,  ["markdown-it" option](#heading.markdown-it-options) "`markdown.extension.convertToHtml.options.typographer`" should be set to true (default).

Typographer substitution rules:

1. `+-` → ±
1. `...` → … (single character, [ellipsis](https://en.wikipedia.org/wiki/Ellipsis))
1. `---` → — ([em dash](https://en.wikipedia.org/wiki/Dash#Em_dash))
1. `--` → – ([en dash](https://en.wikipedia.org/wiki/Dash#En_dash))
1. `"…"`: depends on "markdown.extension.convertToHtml.options.smartQuotes" value, two first characters
1. `'…'`: depends on "markdown.extension.convertToHtml.options.smartQuotes" value, two last characters

Two last patterns are more complicated. They match the text taken in a *pair* of [quotation marks](https://en.wikipedia.org/wiki/Quotation_mark#Summary_table), either `""` or `''`. Importantly, they should be balanced, to get processed.

The value of the option "`markdown.extension.convertToHtml.options.smartQuotes`" should be a string with four characters. If the values resolved to false in a *conditional expression* (undefined, null) or contain less than four characters, no replacement is performed — this is the way to turn the feature off, even if other typographer substitutions are enabled. For languages such as English, Hindi, Indonesian, etc., it should be `“”‘’` (default); for many European languages and languages using Cyrillic system, it's `«»‹›`, `«»“”` or the like (second pair highly polymorphic and rarely used), and so on.

### Detecting Document Title

To use the typographer,  ["markdown-it" option](#heading.markdown-it-options) "`markdown.extension.convertToHtml.titleLocatorRegex`" should define the [regular expression](https://en.wikipedia.org/wiki/Regular_expression) pattern used to detect some fragment of the input Markdown text which should be interpreted as the title of the document.
If the pattern match is successfully found in the Markdown document, it is written to the `title` element of the HTML `head` element. If the match is not found, the text "Converted from: /<input-file-name/>" is used as the title.

It's important to understand that detection never modifies input Markdown text. The idea is to detect some text fragment present in the document. If Markdown rules rendering this text fragment in output HTML, it will be rendered; and the copy of this fragment will be written in the `title` element.

Let's see how default value of the "`markdown.extension.convertToHtml.titleLocatorRegex`" works.

By default, the following regular expression is used:

```
^/(*.?)/[/]/(title/)
```

It means that first occurrence of the text between beginning of line ("^" in [regular expressions](https://en.wikipedia.org/wiki/Regular_expression#POSIX_basic_and_extended)) and "[](title)" will make a match. The *group* "(*.?)" (marked by round brackets) means that the arbitrary text in between will be detected as the match.

For example, this line in source Markdown document

```
My Article Name[](title)
```
will create two matches:

0. `My Article Name[](title)`
1. `My Article Name`

The text of the second match corresponds to the group "(*.?)". It will be rendered as an HTML paragraph and written as the text values of its `title` element. Only the first occurrence of the matching text will be handled this way.

In practice, this particular regular expression is useful to use the very first *paragraph* in the document to produce the title string. It can be taken into account in the CSS, to render this paragraph accordingly. For example, the special CSS properties can be applied to the paragraph defined by the [child selector](https://developer.mozilla.org/en-US/docs/Web/CSS/Child_selectors) combined with the [first-child](https://developer.mozilla.org/en-US/docs/Web/CSS/:first-child) [pseudo-class](https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes).

CSS line example:

```
body > p:first-child { font-size: 240%; text-align: center; }
```
Alternatively, the heading element of some level (level 1, for example) could be used as a title. It will require the following regular expression:

```
^/# (*.?)/[/]/(title/)
```
Note the blank space between "#" and (*.?).

Matching Markdown would be:<br/>
```
# My Article Name[](title)
```

### File Includes

The File Includes feature allows [including](#special.include.file) an external file in the source Markdown document, before it is parsed. The file path is relative to the current document where the include element is placed.

### Syntax Coloring

Syntax coloring can be defined using a pair of configuration settings a Regular Expression and a set of CSS properties. A regular expression should contain additional *group* marked by round brackets (), according to the Regular Expression syntax. This group is used in the text of the *tooltip* shown by the matching text fragment when a mouse cursor hovers over it. The matching text is styled according to the provided CSS style set. Please see the properties `*Regex*` and `style` in the ["settings.json" sample](#special-settings.json).

### Auto-Numbering

Version 5.0.0 introduced optional user-configurable auto-numbering option. Auto-numbering can be configured either at the level of Visual Studio Code settings options `markdown.extension.convertToHtml.autoNumbering` and `markdown.extension.convertToHtml.autoNumberingRegex`, or at the document level, in the extension tag matching the Regular Expression defined by `markdown.extension.convertToHtml.autoNumberingRegex`, by default: `\[\]\(\=numbering([\s\S]*?)\=\)`. If used, this tag should come at first position of the Markdown document file. 

By default, auto-numbering is not used. This is the case when both the auto-numbering tag is not present in the document and the option `markdown.extension.convertToHtml.autoNumbering`. If both conditions are met, document-level specification of auto-numbering takes precedence.

This is the representative sample of the fragment of the Markdown code using the extended syntax for passing auto-numbering option. This is a tag which should come in a first position of the document file:

```
[](=numbering {
    "enable": true,
    "defaultPrefix": "",
    "defaultSuffix": ". ",
    "defaultStart": 1,
    "defaultSeparator": ".",
    "pattern": [
        { "start": 1 },
        { "prefix": "Chapter ", "start": 1 },
        { },
        { "start": 1, "separator": ".", "standAlong": true },
        { "suffix": ") ", "start": "a", "separator":".", "standAlong":true }
    ]
}=)
```

With default settings, minimum in-document content of the in-document auto-numbering specification would be:

```
[](=numbering {
    "enable": true
}=)
```

First of all, all options come on two levels: general for the entire document (named `default*`) and per heading level, described in the property `pattern`. The exclusion is the option `standAlong` which appears only in `patter` and is only defined for individual heading levels. 

By default, a heading number is shown as a multi-component string including number of upper-level headings, such as in "2.11.3". The option `standAlong` is used to disable upper-level part, showing, in this example, just "3".

| Property Name | Default | Description |
| --- | --- | --- |
| prefix<br/>defaultPrefix | `""` | String which comes before number. Typical uses include "Chapter ", "Part " |
| suffix<br/>defaultSuffix | `". "` | String which comes after number. It is used to separate number and heading caption |
| start<br/>defaultStart | 1 | Starting number in each numbered section. It can be any integer number, any string parsable to an integer number or any character. |
| separator<br/>defaultSeparator | "." | Starting number in each numbered section. It can be any integer number, any string parsable to an integer number or any character. | . | String (most typically, as single-character string) delimiting components of number inherited from upper-level headings |
| standAlong | `undefined`| "Stand along" flag defining that for some individual levels of headings, the components of number inherited from upper-level headings are not shown |

## Additional Plug-ins

Since v. 2.0.0, additional ["markdown-it"](https://www.npmjs.com/package/markdown-it) [plug-ins](https://www.npmjs.com/browse/keyword/markdown-it-plugin) can be installed by the users of the extension and configured for the use with Visual Studio Code.

### Installation

All ["markdown-it"](https://www.npmjs.com/package/markdown-it) plug-ins can be installed using [node.js](https://nodejs.org) [npm](https://www.npmjs.com) without installation of the ["markdown-it"](https://www.npmjs.com/package/markdown-it) module itself, as it is already installed with Visual Studio Code. It is assumed that all such plug-ins are installed in the same `"node_modules"` directory. The "convert-markdown-to-html" does not require installation of plug-ins to the same directory as any of the ["markdown-it"](https://www.npmjs.com/package/markdown-it). It is recommended to install the plug-ins separately.

Initial installation of plug-ins requires installation of [node.js](https://nodejs.org), but node.js is not required after the plug-ins are installed. Plug-ins can be installed *locally* (recommended):

```
npm install --save a-name-of-markdown-it-plug-in
```

### Customization of Additional Plug-Ins

Additional plug-ins are set up with one single "setting.json" option: [markdown.extension.convertToHtml.options.additionalPlugins](#heading.markdown-it-options).

This is how default value is shown in "package.json":
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
Main purpose of such default-value object is to provide the user with a placeholder for structured plug-in descriptor data. The sample of the "settings.json" is shown [above](#special-settings.json).

First, the settings specify path to the directory where the set of additional plug-ins is installed, either "absolutePath" or "relativePath". There is no need to include both properties, but it if happens, "absolutePath" is considered first. If it is not defined (more exactly, evaluates to "false" in conditional expression), "relativePath" is considered. It is assumed to be relative to the current Visual Studio Code workspace path. Then it's checked up if effective path exists. This path is assumed to be the parent path to each individual plug-in directory. Most typically, it has the name `"node_modules"`.

For each plug-in, its name is specified. This name is always the same as the name of a plug-in sub-directory. Then the extension tries to load (`require`) each plugin, if its directory exists and the property "enable" is evaluates to `true`. If loading fails, the command execution continues with next plug-in. If a plug-in is successfully loaded, it's used by markdown-it, with options specified by the "options" object, which can be omitted.
