﻿Extensible Markdown, a Visual Studio Code Extension{title}

[*Sergey A Kryukov*](https://www.SAKryukov.org)

This package is the Visual Studio Code *extension* supporting [Markdown](https://en.wikipedia.org/wiki/Markdown). It saves Markdown as HTML and optionally provides extended Markdown syntax with the capabilities for additional user extensions.

The extension depends on the [node.js](https://nodejs.org) Markdown parser [&ldquo;markdown-it&rdquo;](https://www.npmjs.com/package/markdown-it) built in Visual Studio Code.

Since v.&thinsp;2.0.0, the user can extend Markdown features by installing any [&ldquo;markdown-it&rdquo;](https://www.npmjs.com/package/markdown-it) plug-ins [abundantly available](https://www.npmjs.com/browse/keyword/markdown-it-plugin) in the [npm package registry](https://www.npmjs.com). All the packages can be configured from a single source: &ldquo;settings.json&rdquo;, [on the user or workspace level](https://code.visualstudio.com/docs/getstarted/settings).

## Contents{no-toc}

@toc

## Introduction and History

The first article on this component was published in 2017: [All in One Toolchain for Article Writing with Visual Studio Code](https://www.codeproject.com/Articles/1194125/Article-Writing-Toolchain-with-VSCode).

Initially, the main reason for the creation of this tool was my desire to write CodeProject articles offline from the beginning to the end, and then post them with the help of the article submission wizard in one shot, just by a single paste of the HTML code.

The tool I wanted to use was Visual Studio Code (VSCode) and its embedded implementation of Markdown, [markdown-it](https://github.com/markdown-it/markdown-it). My initial problem was the export of already rendered HTML code.

It worked well for me, a lot better than any other method. First of all, it ensured internal consistency of the entire document, first of all, due to the new features I added to the "markdown-it" plugin: automatic generation of the `id` attributes of the headings and automatic generation of the Table of Contents (TOC).

However, even with this generation, my article-writing practice revealed, that this is not quite enough. I still had the submission in one shot, but I had a certain number of fragments to be written in HTML, more than I wanted to. First of all, it was related to the need to reference some elements other than headings, especially source code samples. A big annoyance was the manual correction of the TOC styles. These requirements were well beyond the standard Markdown syntax. This way, to *wikify* the source code more, I stepped on the shaky way of extending the syntax. After all, it worked out pretty well, but through some stages of development.

Since that time, the extension has changed radically, doubled the number of features, and became more regular. It requires a lot more documentation. I also collected a lot more experience.

In addition to CodeProject articles, I found that VSCode with Markdown is the best way to write all kinds of documents. It was everything from small "readme" and git comments to pretty big chunks of documentation written to several companies, and even some private letters or chat posts.

I decided to forget all kinds of Office products and never get back to them. I even created two variants of the product successfully replacing those bulky Office presentation applications and published both of them on CodeProject: [Web Presentation, an Application in a Single File](https://www.codeproject.com/Articles/5286790/Web-Presentation-an-Application-in-a-Single-File), and [Web Presentation, the Other Way Around](https://www.codeproject.com/Articles/5290221/Web-Presentation-the-Other-Way-Around).

For these reasons, I reworked my [original article](https://www.codeproject.com/Articles/1194125/Article-Writing-Toolchain-with-VSCode) on the toolchain into an article focused on the specific requirement of CodeProject and added the present article to serve as the product documentation.

One of the worst problems was that the VSCode extension API broke backward compatibility at least twice. My extension was published on the [Microsoft Marketplace](https://marketplace.visualstudio.com/VSCode), and the users started to complain. I had to remove the extension from the marketplace and started to use the product for my own needs with the obsolete VSCode versions. After two fixes related to broken backward compatibility, I reviewed all parts of the code, added a good number of features, and fixes, and published the product under a new name. Indeed, originally it was a Markdown converter to HTML, but later it grew into a feature-rich extension, with extended Markdown syntax.

More importantly, the extension is itself extensible, hence the name. With Extensible Markdown, a user can configure additional markdown-it plugins. Any existing markdown-it plugins found on node.js [npm](https://www.npmjs.com) can be used, or the user can write some new extensions, which is not an easy task though.

## Features

* Conversion of an individual file or all Markdown files of the current Visual Studio Code workspace;
* A possibility of installation of [&ldquo;markdown-it&ldquo; plug-ins](https://www.npmjs.com/package/markdown-it) in an arbitrary directory, without the need to install &ldquo;markdown-it&rdquo; itself;
* Optional user-configurable **auto-numbering** with a rich set of options;
* User-configurable Markup syntax coloring for plug-ins;
* Optional embedding of CSS in HTML;
* Optional Detection of the document title based on user-configurable Regular Expression;
* Preview in Visual Studio Code, in a full-size window or side by side, with styles fully matching the generated HTML file;
* Configuration of all processing details of the extension, [&ldquo;markdown-it&rdquo;](https://www.npmjs.com/package/markdown-it) and its plug-ins, from a single source.

## Conversion to HTML

## Usage by Plugin

The class `MarkdownIt` implements the mechanism of dynamically loaded *plugins*. Four plugins are embedded in the Extensible Markdown extension and can be turned on or off by the settings elements MarkDown > Extensible Markdown. Also, the user can supply additional external plugins and configure them for use by Extensible Markdown. Each of those additional plugins can be turned on or off individually.

The embedded plugins are: "Includes", "IDs and TOC", "Attribution", and "Replacements". Let's consider them one by one.

### Includes

An .md file can include one or more Markdown fragments placed in separate files. The syntax is:

~~~{lang=Markdown}
<span class="keyword highlighter">@include</span>(file name)    
~~~

The markup should go without blank spaces, no blank spaces in the file name are accepted. If the is found, the Markdown content of the file is rendered, otherwise, the detailed error message is rendered.

### IDs and TOC

In all cases, `id` attributes are generated for all headings (`#`, `##`, and so on).

This markup is the placeholder for TOC:

~~~{lang=Markdown}
<span class="keyword highlighter">@toc</span>
~~~

Any heading can be excluded from TOC. Usually, it is used for the heading "Contents". To exclude a heading from TOC, the markup `{no-toc}` can be added on the same line, for example:

~~~{lang=Markdown}
<span class="keyword highlighter">##</span> Some Heading<span class="keyword highlighter">{no-toc}</span>
~~~

Also, the headings of certain *levels* can be excluded from TOC. It is useful for deeper nesting levels. For example, in this "settings.json" file only the headers of two levels are included in TOC, `##` and `###`:

~~~{lang=JSON}
<span class="operator highlighter">{</span>
    <span class="property highlighter">"markdown.extensibleMarkdown.TOC.includeLevels"</span>: <span class="operator highlighter">[</span> 2, 3 <span class="operator highlighter">]</span>
<span class="operator highlighter">}</span>
~~~

For the implementation, see [id.toc.js](https://github.com/SAKryukov/vscode-extensible-markdown/blob/master/extension/id.toc.js).

### Attribution

For the implementation see [attribution.js](https://github.com/SAKryukov/vscode-extensible-markdown/blob/master/extension/attribution.js).

#### Title

The attribute `title` marks a paragraph playing the role of the document title. It is used to indicate the string used as the header title in the generated HTML document. Also, it sets up a special CSS class for this paragraph. The name for this class can be specified in settings: Markdown > Extensible Markdown > Title Class Name. For example:

~~~{lang=Markdown}
My Story<span class="keyword highlighter">{title}</span>
~~~

#### CSS Classes

The attribute starting with a dot, `.class_name` can be used to add a `class` attribute to a paragraph or a header. I should be placed on the same line. A class name should not contain space characters. Multiple classes can be specified for the same element; in this case, each class should go in a separate pair of `{}` brackets.

For example:
~~~{lang=Markdown}
Sergey A Kryukov<span class="keyword highlighter">{.author}<span>

Demo class<span class="keyword highlighter">{.demo}<span>

Multiple classes<span class="keyword highlighter">{.demo}{.author}<span>
~~~

#### Arbitrary Attributes

An arbitrary attribute can be added to an element in the form `name=value`. It is especially used for the fenced code blocks. For example, CodeProject requires the attribute `lang` to be used for syntax highlighting. The `id` attribute is useful when it is required to create an anchor in the article to reference code samples or some other elements.

For example:
```{lang=Markdown}
Some paragraph <span class="keyword highlighter">&#123;id=paragraph-of-interest&#125;</span>

<span class="keyword highlighter">~~~</span> <span class="keyword highlighter">&#123;lang=C#&#125;&#123;id=code.utilitySet&#125;</span>
static class UtilitySet { /* ... */ }
<span class="keyword highlighter">~~~</span>
```

### Abbreviations

This feature uses the HTML &lt;`abbr`&gt; element and the attribute `title`. Place a mouse pointer over the acronym text and see the title showing the full description of the term:

For example:

~~~{lang=Markdown}
*{Request for Comments}RFC*
~~~
It renders in HTML as:

~~~{lang=HTML}
<span class="xmltag all highlighter"><span class="xmltag all highlighter">&lt;</span><span class="xmltag name highlighter">abbr</span></span> <span class="xmltag attribute highlighter">title</span><span class="xmltag operator highlighter">=</span><span class="literal quote highlighter">"</span><span class="literal string highlighter">Request for Comments</span><span class="literal quote highlighter">"</span><span class="xmltag close highlighter">&gt;</span>RFC<span class="xmltag all highlighter"><span class="xmltag all highlighter">&lt;</span><span class="xmltag special highlighter">/</span><span class="xmltag name highlighter">abbr</span></span><span class="xmltag close highlighter">&gt;</span>
~~~

Hover a mouse on `RFC` to see how `abbr` works:
<abbr title="Request for Comments">RFC</abbr>.

### Replacements

Some combinations of characters are replaced with important characters not represented on most keyboards.

Here are some examples:

Amount: 7-:8

Equal or not: A=B, C!=D

Order relation: z <= y, p >= f

Tilde and not tilde c~d, a!~b

Plus/minus: 10+-0.1, 16.2-+0.1

Parallel of not: v||w, a!||b

Almost equal or not: d ~~ 10.4 mm, a !~~ b

Strictly equivalent: f===h

Identical or not: F==G but A !== B

Sets: A@unionB != @empty, E = C@intersectionD; n.<N but a!.<A

Subset and superset: (A<|B) == (B|>A)

Arrows: @left @right @up @down

Dashes and minus: A -- B --- C; typographically correct minus: @minus1

Imply: A @imply B, not: @!C

Quantifiers:<br/>
Definition of the limit of the function f(x)=b for x@rightx₀,

According to O. L. Cauchy,<br/>
@all ε>0 @exists δ>0: @all x.<R: 0 < |x−x₀| < δ  @imply |f(x)−b| < ε

Copyright (C) sign, section sign (P), registered (R) sign, trademark(TM) sign.

In the escaped form, they are just letters in brackets: (C\), (P\), (R\), (TM\).

Typographically correct quotes: 'single', "double". Quotation characters are defined by settings: Markdown > Extensible Markdown > Options: Smart Quotes.

The source markup can be found in this [demo document "replacements.md"](https://github.com/SAKryukov/vscode-extensible-markdown/blob/master/docs/vscode-workspace-sample/replacements.md), for the implementation, see [replacements.js](https://github.com/SAKryukov/vscode-extensible-markdown/blob/master/extension/replacements.js).

### Additional Custom Plugins

The user can use additional "markdown-it" plug-ins by adding them using the settings element "markdown.extensibleMarkdown.options.additionalPlugins".

## Usage

Open a Markdown file (.md) in Visual Studio Code and activate the editor's context menu, use the command "Markdown: Convert to HTML", to convert this file. All files found in a currently opened workspace can be converted at once with the command "Markdown: Convert to HTML all .md files in workspace". This command appears in the context menu of any editor, and also in the Explorer context menu.

Alternatively, open the Command Palette (`Ctrl+Shift+P`/`Cmd+Shift+P` or `F1`) and search for the command "Markdown: Convert to HTML" or "Markdown: Convert to HTML all .md files in workspace".

The HTML file is saved to the same directory as the original Markdown file, if not specified otherwise [by settings](#special-markdown-extension-convertToHtml-outputPath).

### Preview

Markdown preview is created using the available VSCode command "Open Preview...", Ctrl+K V or Ctrl+Shift V.
Nevertheless, all the Extensible Markdown properties are used in preview, including extended systax.

## Extending of Markdown Syntax

Markdown syntax can be extended. With the extension "Extensible Markdown", all of them are user-configurable. At the very minimum, each extension can be enabled and disabled, and some extensions allow for detailed configuration. All configurations can be modified [on the user or workspace level](https://code.visualstudio.com/docs/getstarted/settings) or their combination.

They can be classified into two parts: in the first part, extensions are based on the predefined VSCode setting. They come with Visual Studio Code installation but are not fully exposed to the end user. The new "Extensible Markdown" extension exposes most of them to user-defined "settings.json" files, so they are made configurable.

In the second part, new extensions are added by Extensible Markdown. Some are embedded, others can be installed and then configured by the user.

### Markdown-it Extensions

VSCode uses embedded ["markdown-it"](https://www.npmjs.com/package/markdown-it) code. The extension "Extensible Markdown" exposed the following extended features: Typographer, "smart quotes" (can used when Typographer is enabled), enabled or disabled HTML formatting in an input Markdown document, "linkify", generation of `br` attributes. The configuration parameters are described in the section [Markdown-it Options](#heading-markdown-it-options).

### Extensible Markdown Embedded Extensions

Extensible Markdown adds three syntax elements to Markdown:

* Tagging for detection of the document title
* File include declaration
* Table of Contents (TOC) tag
* Exclude from TOC tag

By default, both elements use *pseudo-link* form based on Markdown *link* syntax. They take the form: `{&#123;d=some-ID}`. The user can create/modify "settings.json" to describe any other suitable syntax, which is done in the Regular Expression form.

Document title needs detection because HTML requires a text value for the `title` element of the element `head`. The idea is to use some available Markdown element, which is rendered on the HTML page, without replacing it, but by just tagging it as a title text.

The default syntax for title detection is:

~~~{lang=Markdown}
The Name of The Document<span class="keyword highlighter">{title}</span>
~~~

In this example, the text "The Name of The Document" is copied to the HTML `title`.

The default syntax for the file *include* is: {id=special.include.file}

~~~{lang=Markdown}
<span class="keyword highlighter">@include</span>(file-name)
~~~

The `file-name` expression should come without blank space characters.

A new feature in version 5.0.0 is the `no-toc` tag. It is used to exclude some headings from the TOC. It can be important for headings like "Contents" or "Table of Contents". The default syntax for this tag is:

~~~{lang=Markdown}
<span class="keyword highlighter">{no-toc}</span>
~~~

This tag works if it is placed at the end of a heading line. 

Again, the user can use any other syntax.

Only the first occurrence of the document title tag is taken into account. In the Markdown view, it can be seen in the *syntax coloring* of this element. Other elements, including TOC, can appear multiple times. Note that the TOC feature works in collaboration with the automatic generation of the `id` attributes for all heading elements (`h1`.. `h6`), which is also embedded in the extension.

All these elements are emphasized in the source Markdown document by [syntax coloring](#heading-syntax-coloring) with a coloring style configured by the user. Please see the description of the [settings](#heading-extensible-markdown-extension-options).

### Extensible Markdown User-Installed Extensions

The configuration option ["`markdown.extension.convertToHtml.options.additionalPlugins`"](#heading-markdown-it-options) is used for adding the references to additional ["markdown-it"](https://www.npmjs.com/package/markdown-it) plug-ins which can be installed by the user. Please see the section [Customization of Additional Plug-Ins](#heading-customization-of-additional-plug-ins) for the details.

## Settings

General:
convertToHtml.openHtml
convertToHtml.showHtmlInBrowser
convertToHtml.embedCss
convertToHtml.outputPath

Syntax and related CSS:
titleClassName, titleLocatorRegex, titleLocatorDecoratorStyle
abbreviationRegex, abbreviationDecoratorRegex, abbreviationDecoratorStyle
attributeRegex, attributeDecoratorStyle, 
cssClassRegex, cssClassDecoratorStyle,
includes.locatorRegex, includes.locatorDecoratorStyle
(Includes errors: includes.invalidRegexMessageFormat, includes.fileNotFoundMessageFormat, includes.fileReadFailureMessageFormat)
TOC.regex, TOC.decoratorStyle, TOC.excludeHeaderRegex, excludeHeader.DecoratorStyle
TOC.autoNumberingRegex, TOC.autoNumberingDecoratorStyle

HTML generation:
headingIdPrefix
TOC.itemIndentInEm
TOC.includeLevels
TOC.containerClass
TOC.autoNumbering.brokenHierarchy

Control for the markdown-it options:
options.allowHTML, options.typographer, 
options.smartQuotes

New options:
options.typographerExtensions
options.additionalPlugins

### Three Levels of Settings

There are three levels of settings. The user of this extension can control them all.

1. [General options](#heading-general-options) control the behavior of command and detail of the HTML output unrelated to Markdown formatting.

1. The extension is based on the [node.js](https://nodejs.org) *package* ["markdown-it"](https://www.npmjs.com/package/markdown-it). This module has its own options. [Markdown-it options](#heading-markdown-it-options) define how the mark-down module should be set up before parsing.<br/>
These options are classified into two sets: a) embedded set of options, and b) what plug-ins should be used.<br/>
Markdown-it can use other [node.js](https://nodejs.org) packages as plug-ins, each defining custom or extended parsing and rendering rules. See [customization of Additional Plug-Ins](#heading-customization-of-additional-plug-ins).<br/>

1. Some of the ["markdown-it"](https://www.npmjs.com/package/markdown-it) plug-in packages have their own options. For example, see the package ["markdown-it-table-of-contents"](https://www.npmjs.com/package/markdown-it-table-of-contents). The example of setting its options in "settings.json" is shown in the [settings sample](#heading-settings-sample).

### General Options

| Name | Default | Description |
| --- | --- | --- |
| markdown.extensibleMarkdown.convertToHtml.openHtml | false | Upon successful conversion to HTML file, open it in VSCode workspace;<br/>this option is ignored if there are more then one file |
| markdown.extensibleMarkdown.convertToHtml.showHtmlInBrowser | false | Upon successful conversion to HTML file, show it in the default Web browser |
| markdown.extensibleMarkdown.convertToHtml.embedCss | false | Embed CSS files in an output HTML file, otherwise reference external CSS files |
| markdown.extensibleMarkdown.convertToHtml.outputPath | `""` | Specifies output directory for HTML files, relative to workspace directory.<br/>If the path is null or empty string, write HTML in the same directory of the input file |

<i id="markdown.extensibleMarkdown.convertToHtml.outputPath"></i>
The option "`markdown.extension.convertToHtml.outputPath`" is ignored if its value resolves to false (empty string, `null`, `undefined`). If defined, it specifies the path relative to the current workspace directory. The effective target directory may not exist — in this case, an error message is shown. If it exists, all files are saved in the same directory. In this case, it is possible that the HTML files with identical base names but different locations may overwrite one another. The user is responsible for the suitability of the file names.

### Extensible Markdown Extension Options

| Name | Default | Description |
| --- | --- | --- |
| markdown.extension.convertToHtml.titleLocatorRegex | `^(.*?)\[\]\(title\)` | Defines Regex pattern used to parse some fragment of Markdown text as title, to be used as HTML `head` `title` element |
| markdown.extension.convertToHtml.titleLocatorDecoratorStyle | see "settings.json" sample | CSS style for syntax coloring of the title extended Markdown tag element |
| markdown.extension.convertToHtml.options.headingId | true | Enables or the generation of the `id` attributes for `h1`.. `h6` elements |
| markdown.extension.convertToHtml.options.headingIdPrefix | `heading.` | If the generation of the `id` attributes is enabled, the heading is added to each `id` value of each `h1`.. `h6` element |
| markdown.extension.convertToHtml.tocRegex | `^\[\]\(toc\)` | Defines Regex pattern used to recognize the location where Table Of Contents (TOC) is placed |
| markdown.extension.convertToHtml.excludeFromTocRegex | `\\[\\]\\(no-toc\\)` | Marks the heading elements to be excluded from TOC |
| markdown.extension.convertToHtml.excludeFromTocLocatorDecoratorStyle | see "settings.json" sample | CSS style for syntax coloring of the tag marking a heading to be excluded from TOC |
| markdown.extension.convertToHtml.tocDecoratorStyle | see "settings.json" sample | CSS style for syntax coloring of the title extended Markdown tag marking the TOC placing |
| markdown.extension.convertToHtml.tocIncludeLevels | [1, 2, 3, 4, 5, 6] | Defines the level of the headers to be included in TOC |
| markdown.extension.convertToHtml.defaultListElement | `ul` | Default HTML element for all TOC list elements. This option is ignored if one or more elements are defined on a per-level basis (see below) |
| markdown.extension.convertToHtml.listElements | `[]` | Array of strings each defining an HTML element for a TOC list on each TOC level (see above) |
| markdown.extension.convertToHtml.defaultListElementAttributeSet | `{ "style": "list-style-type: none;" }` | An object used to define the set of HTML attributes to be added for all TOC list elements. This option is ignored if one or more sets are defined on a per-level basis (see below) |
| markdown.extension.convertToHtml.listElementAttributeSets | `[]` | Array of sets of HTML attributes, same as above, but defining an attribute set for each TOC level |
| markdown.extension.convertToHtml.tocContainerClass | `toc` | CSS class of the TOC container (by default, `ul`) |
| markdown.extension.convertToHtml.tocListType | `ul` | HTML element representing TOC container; alternatively, can be `ol` |
| markdown.extension.convertToHtml.includeLocatorRegex | `\[\]\(include\(([^\s]+?)\)\)` | Defines Regex pattern used to define file include Markdown syntax extension |
| markdown.extension.convertToHtml.includeLocatorInvalidRegexMessageFormat | `!!! invalid Regular Expression of include:  "%s` | Message format for the message produced in the output HTML in case of invalid Regular Expression |
| markdown.extension.convertToHtml.includeLocatorFileReadFailureMessageFormat | `!!! failed to read file "%s" !!!` | Message format for the message produced in the output HTML in case of the file reading failure |
| markdown.extension.convertToHtml.includeLocatorDecoratorStyle | see "settings.json" sample | CSS style for syntax coloring of the file include extended Markdown tag element |
| markdown.extension.convertToHtml.autoNumbering | `{ enable: false }` | Structure of auto-numbering; see [Auto-Numbering](#heading-auto-numbering); with default value `null` the effective options are taken from the embedded plugin default |
|markdown.extension.convertToHtml.autoNumberingRegex | `\[\]\(\=numbering([\s\S]*?)\=\)` | Defines Regex pattern for the tag used to define the structure of auto-numbering at the document level. See [Auto-Numbering](#heading-auto-numbering). This tag should come at the first position of the Markdown document file. |
| markdown.extension.convertToHtml.autoNumberingDecoratorStyle | see default settings | CSS style for syntax coloring of the auto-numbering extended Markdown tag element (above) |

### Markdown-it Options

The extension is based on the node.js module ["markdown-it"](https://www.npmjs.com/package/markdown-it) embedded in VSCode.Since v.&thinsp;2.0.0, most of the module options are exposed to the user of the extension:

| Name | Default | Description |
| --- | --- | --- |
| markdown.extension.convertToHtml.options.allowHTML | true | If true, allows HTML formatting, otherwise, HTML code is rendered as text |
| markdown.extension.convertToHtml.options.linkify | false | Renders "Link-like" text as link |
| markdown.extension.convertToHtml.options.br | true | [New line](https://en.wikipedia.org/wiki/Newline) handling: if true, line separators are replaced with the HTML *element* `br` |
| markdown.extension.convertToHtml.options.typographer | true | [*Typographer*](#heading-typographer) option is used |
| markdown.extension.convertToHtml.options.smartQuotes | `“”‘’` | If typographer option is true, replaces `""` and `''` characters |
| markdown.extension.convertToHtml.options.additionalPlugins | see [below](#heading-customization-of-additional-plug-ins) | Descriptor of [additional markdown-it plug-ins](#heading-additional-plug-ins) |

The value of the option "`markdown.extension.convertToHtml.options.smartQuotes`" should have four characters, otherwise the characters `""` and `''` are rendered as is, as if the option value was `""''`. It can be used to turn off the "smart quotes" feature when other typographer processing is enabled.

### Settings Sample

This is the sample fragment of the file "settings.json" file ([user or workspace settings](https://code.visualstudio.com/docs/getstarted/settings)):{id=special-settings.json}

~~~{lang=JSON}
<span class="operator highlighter">{</span>
    <span class="property highlighter">"markdown.preview.scrollEditorWithPreview"</span>: false,
    <span class="property highlighter">"markdown.preview.scrollPreviewWithEditor"</span>: false,
    <span class="property highlighter">"editor.minimap.enabled"</span>: false,
    <span class="property highlighter">"markdown.styles"</span>: <span class="operator highlighter">[</span>
        <span class="literal string highlighter">"style.css"</span>
    <span class="operator highlighter">]</span>,
    <span class="property highlighter">"markdown.extensibleMarkdown.options.additionalPlugins"</span>: <span class="operator highlighter">{</span>
        <span class="property highlighter">"absolutePath"</span>: <span class="literal string highlighter">"/app/Node.js/node_modules"</span>,
        <span class="property highlighter">"plugins"</span>: <span class="operator highlighter">[</span>
            <span class="operator highlighter">{</span>
                <span class="property highlighter">"name"</span>: <span class="literal string highlighter">"markdown-it-sub"</span>,
                <span class="property highlighter">"enable"</span>: true,
                <span class="property highlighter">"syntacticDecorators"</span>: <span class="operator highlighter">[</span>
                    <span class="operator highlighter">{</span>
                        <span class="property highlighter">"enable"</span>: true,
                        <span class="property highlighter">"regexString"</span>: <span class="literal string highlighter">"\\~(.*?)\\~"</span>,
                        <span class="property highlighter">"tooltipFormat"</span>: <span class="literal string highlighter">"Subscript: %s"</span>,
                        <span class="property highlighter">"style"</span>: <span class="operator highlighter">{</span> <span class="property highlighter">"backgroundColor"</span>: <span class="literal string highlighter">"lightSkyBlue"</span> <span class="operator highlighter">}</span>
                    <span class="operator highlighter">}</span>
                <span class="operator highlighter">]</span>
            <span class="operator highlighter">}</span>,
            <span class="operator highlighter">{</span>
                <span class="property highlighter">"name"</span>: <span class="literal string highlighter">"markdown-it-sup"</span>,
                <span class="property highlighter">"enable"</span>: true,
                <span class="property highlighter">"syntacticDecorators"</span>: <span class="operator highlighter">[</span>
                    <span class="operator highlighter">{</span>
                        <span class="property highlighter">"enable"</span>: true,
                        <span class="property highlighter">"regexString"</span>: <span class="literal string highlighter">"\\^(.*?)\\^"</span>,
                        <span class="property highlighter">"tooltipFormat"</span>: <span class="literal string highlighter">"Superscript: %s"</span>,
                        <span class="property highlighter">"style"</span>: <span class="operator highlighter">{</span> <span class="property highlighter">"backgroundColor"</span>: <span class="literal string highlighter">"aqua"</span> <span class="operator highlighter">}</span>
                    <span class="operator highlighter">}</span>
                <span class="operator highlighter">]</span>
            <span class="operator highlighter">}</span>
        <span class="operator highlighter">]</span>
    <span class="operator highlighter">}</span>,
    <span class="property highlighter">"markdown.preview.typographer"</span>: true
<span class="operator highlighter">}</span>
~~~

The extension also uses "`markdown.styles`" option related to the extension "VS Code Markdown".
If one or more CSS files are defined, they are used in the generated HTML files as *external* or *embedded* style sheets, depending on the option "`markdown.extension.convertToHtml.embedCss`". The user is responsible for supplying the CSS files themselves.

## Advanced Usage and Settings

### Typographer

To use the typographer,  ["markdown-it" option](#heading-markdown-it-options) "`markdown.extension.convertToHtml.options.typographer`" should be set to true (default).

Typographer substitution rules:

1. `+-` → ±
1. `...` → … (single character, [ellipsis](https://en.wikipedia.org/wiki/Ellipsis))
1. `---` → — ([em dash](https://en.wikipedia.org/wiki/Dash#Em_dash))
1. `--` → – ([en dash](https://en.wikipedia.org/wiki/Dash#En_dash))
1. `"…"`: depends on "markdown.extension.convertToHtml.options.smartQuotes" value, two first characters
1. `'…'`: depends on "markdown.extension.convertToHtml.options.smartQuotes" value, two last characters

The two last patterns are more complicated. They match the text taken in a *pair* of [quotation marks](https://en.wikipedia.org/wiki/Quotation_mark#Summary_table), either `""` or `''`. Importantly, they should be balanced, to get processed.

The value of the option "`markdown.extension.convertToHtml.options.smartQuotes`" should be a string with four characters. If the values resolved to false in a *conditional expression* (undefined, null) or contain less than four characters, no replacement is performed — this is the way to turn the feature off, even if other typographer substitutions are enabled. For languages such as English, Hindi, Indonesian, etc., it should be `“”‘’` (default); for many European languages and languages using the Cyrillic system, it's `«»‹›`, `«»“”` or the like (second pair highly polymorphic and rarely used), and so on.

### Detecting Document Title

To use the typographer,  ["markdown-it" option](#heading-markdown-it-options) "`markdown.extension.convertToHtml.titleLocatorRegex`" should define the [regular expression](https://en.wikipedia.org/wiki/Regular_expression) pattern used to detect some fragment of the input Markdown text which should be interpreted as the title of the document.
If the pattern match is successfully found in the Markdown document, it is written to the `title` element of the HTML `head` element. If the match is not found, the text "Converted from: /<input-file-name/>" is used as the title.

It's important to understand that detection never modifies input Markdown text. The idea is to detect a specific text fragment present in the document. If Markdown rules rendering this text fragment are applied to the output HTML, it will be rendered, and the copy of this fragment will be written in the `title` element.

The user can introduce alternative syntax for this feature by modifying the option "`markdown.extension.convertToHtml.titleLocatorRegex`".

### File Includes

The File Includes feature allows [including](#special.include.file) an external file in the source Markdown document before it is parsed. The file path is relative to the current document where the *include* element is placed.

### Syntax Coloring

Syntax coloring can be defined using a pair of configuration settings a Regular Expression and a set of CSS properties. A regular expression should contain an additional *group* marked by round brackets (), according to the Regular Expression syntax. This group is used in the text of the *tooltip* shown by the matching text fragment when a mouse cursor hovers over it. The matching text is styled according to the provided CSS style set. Please see the properties `*Regex*` and `style` in the "settings.json" sample.

### Auto-Numbering

Version 5.0.0 introduced an optional user-configurable auto-numbering option. Auto-numbering can be configured either at the level of Visual Studio Code settings options `markdown.extension.convertToHtml.autoNumbering` and `markdown.extension.convertToHtml.autoNumberingRegex`, or at the document level, in the extension tag matching the Regular Expression defined by `markdown.extension.convertToHtml.autoNumberingRegex`, by default: `\[\]\(\=numbering([\s\S]*?)\=\)`. If used, this tag should come at the first position of the Markdown document file. 

By default, auto-numbering is not used. This is the case when both the auto-numbering tag is not present in the document and the option `markdown.extension.convertToHtml.autoNumbering`. If both conditions are met, document-level specification of auto-numbering takes precedence.

This is the representative sample of the fragment of the Markdown code using the extended syntax for passing the auto-numbering option. This is a tag that should come in the first position of the document file:

~~~{lang=Markdown}
<span class="keyword highlighter">@numbering</span> {
    "<span class="property highlighter">enable</span>": true,
    "<span class="property highlighter">defaultPrefix</span>": "",
    "<span class="property highlighter">defaultSuffix</span>": ". ",
    "<span class="property highlighter">defaultStart</span>": 1,
    "<span class="property highlighter">defaultSeparator</span>": ".",
    "pattern": [
        { "start": 1 },
        { "prefix": "Chapter ", "start": 1 },
        { },
        { "start": 1, "separator": ".", "standalone": true },
        { "suffix": ") ", "start": "a", "separator":".", "standalone":true }
    ]
}
~~~

With default settings, the minimum in-document content of the in-document auto-numbering specification would be:

~~~{lang=Markdown}
<span class="keyword highlighter">@numbering</span> {
    "<span class="property highlighter">enable</span>": true
}
~~~

First of all, all options come on two levels: general for the entire document (named `default*`) and per heading level, described in the property `pattern`. The exclusion is the option `standalone` which appears only in `patterns` and is only defined for individual heading levels. 

By default, a heading number is shown as a multi-component string including several upper-level headings, such as in "2.11.3". The option `standalone` is used to disable the upper-level part, showing, in this example, just "3".

| Property Name | Default | Description |
| --- | --- | --- |
| prefix<br/>defaultPrefix | `""` | String which comes before the number. Typical uses include "Chapter ", "Part " |
| suffix<br/>defaultSuffix | `". "` | String which comes after the number. It is used to separate the number and the heading caption |
| start<br/>defaultStart | 1 | Starting number in each numbered section. It can be any integer number, any string parsable to an integer number, or any character. |
| separator<br/>defaultSeparator | "." | Starting number in each numbered section. It can be any integer number, any string parsable to an integer number or any character. | . | String (most typically, as single-character string) delimiting components of number inherited from upper-level headings |
| standalone | `undefined`| "Stand along" flag defining that for some individual levels of headings, the components of number inherited from upper-level headings are not shown |

### Simplified Auto-Numbering Options Format

Version 3.6.1 introduces an alternative format for the auto-numbering. The format used previously is JSON; it still can be used, but it is not very suitable for human input and is not fault-tolerant. The new parser tries to parse the content of the `@{ ... }` tag using new grammar:

* Each property is placed on a separate line
* Leading and trailing blank spaces and spaced between syntactic elements are ignored
* Line syntax: `<property>: <value>`
* Document properties:
    - enabled: true
    - defaultStart: `<value>`
    - defaultSeparator: `<value>`
    - defaultPrefix: `<value>`
    - defaultSuffix: `<value>`
* Heading level properties:
    - h`<level>`.standalone: true
    - h`<level>`.start: `<value>`
    - h`<level>`.separator: `<value>`
    - h`<level>`.prefix: `<value>`
    - h`<level>`.suffix: `<value>`
    here, `<level>` values 1, 2, ... correspond to Markdown headings `#`, `##`, ... or HTML elements `h1`, `h2`, ...
* Valid values for .start, defaultStart:
    - integer number
    - string (in this case, only the first character is used)
    - array of strings

If a line fails to parse, it is ignored. It can be used for comments.

Example of auto-numbering option in-document specifications:

~~~{lang=Markdown}
<span class="keyword highlighter">@numbering</span> {
    <span class="property highlighter">enable</span>: true
    <span class="property highlighter">defaultSuffix</span>: 1". "
    <span class="property highlighter">h2.prefix</span>: "Chapter "
    <span class="property highlighter">h2.start</span>: ["One", "Two", "Three", "Four"]
    <span class="property highlighter">h2.suffix</span>: ": "
    <span class="property highlighter">h5.standalone</span>: true
    <span class="property highlighter">h4.standalone</span>: true
    <span class="property highlighter">h5.start</span>: "a"
    <span class="property highlighter">h5.suffix</span>: ") "
}
~~~

## Additional Plug-ins

Since v.&thinsp;2.0.0, additional ["markdown-it"](https://www.npmjs.com/package/markdown-it) [plug-ins](https://www.npmjs.com/browse/keyword/markdown-it-plugin) can be installed by the users of the extension and configured for use with Visual Studio Code.

### Installation

All ["markdown-it"](https://www.npmjs.com/package/markdown-it) plug-ins can be installed using [node.js](https://nodejs.org) [npm](https://www.npmjs.com) without installation of the ["markdown-it"](https://www.npmjs.com/package/markdown-it) module itself, as it is already installed with Visual Studio Code. It is assumed that all such plug-ins are installed in the same `"node_modules"` directory. The "convert-markdown-to-html" does not require the installation of plug-ins to the same directory as any of the ["markdown-it"](https://www.npmjs.com/package/markdown-it). It is recommended to install the plug-ins separately.

Initial installation of plug-ins requires the installation of [node.js](https://nodejs.org), but node.js is not required after the plug-ins are installed. Plug-ins can be installed *locally* (recommended):

~~~
npm install --save a-name-of-markdown-it-plug-in
~~~

### Customization of Additional Plug-Ins

Additional plug-ins are set up with one single "setting.json" option: [markdown.extension.convertToHtml.options.additionalPlugins](#heading-markdown-it-options).

This is how the default value is shown in "package.json":
~~~{lang=JSON}
// ...
                    <span class="property highlighter">"default"</span>: <span class="operator highlighter">{</span>
                        <span class="property highlighter">"absolutePath"</span>: <span class="literal string highlighter">""</span>,
                        <span class="property highlighter">"relativePath"</span>: <span class="literal string highlighter">""</span>,
                        <span class="property highlighter">"plugins"</span>: <span class="operator highlighter">[</span>
                            <span class="operator highlighter">{</span>
                                <span class="property highlighter">"name"</span>: <span class="literal string highlighter">""</span>,
                                <span class="property highlighter">"enable"</span>: true,
                                <span class="property highlighter">"options"</span>: <span class="operator highlighter">{</span><span class="operator highlighter">}</span>
                            <span class="operator highlighter">}</span>
                        <span class="operator highlighter">]</span>
                    <span class="operator highlighter">}</span>
// ...
~~~

The main purpose of a such default-value object is to provide the user with a placeholder for structured plug-in descriptor data. The sample of the "settings.json" is shown [above](#special-settings.json).

First, the settings specify the path to the directory where the set of additional plug-ins is installed, either "absolutePath" or "relativePath". There is no need to include both properties, but it if happens, "absolutePath" is considered first. If it is not defined (more exactly, evaluates to "false" in a conditional expression), `relativePath` is considered. It is assumed to be relative to the current Visual Studio Code workspace path. Then it's checked to see if the effective path exists. This path is assumed to be the parent path to each individual plug-in directory. Most typically, it has the name `"node_modules"`.

For each plug-in, its name is specified. This name is always the same as the name of a plug-in sub-directory. Then the extension tries to load (`require`) each plugin, if its directory exists and the property "enable" is evaluates to `true`. If loading fails, the command execution continues with the next plug-in. If a plug-in is successfully loaded, it's used by markdown-it, with options specified by the "options" object, which can be omitted.

<script src="https://SAKryukov.github.io/publications/code/source-code-decorator.js"></script>
