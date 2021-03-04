 All in One Toolchain for Article Writing with Visual Studio Code{title}

[*Sergey A Kryukov*](https://www.SAKryukov.org){.author}

[Original Publication](https://www.codeproject.com/Articles/1194125/Article-Writing-Toolchain-with-VSCode)


<!-- copy to CodeProject from here -->
## Contents{no-toc}

@toc

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

It is possible to adjust a Markdown-based article to CodeProject requirements. I would recommend:

Use `@toc` for auto-built Table of Constants, and use it without auto-numbering, as HTML navigation is quite sufficient. Use regular Markdown headings starting from the level "##", that is "##", "###", etc. Instead of `#`, use a regular paragraph with the extended markup `{title}`.

To the section "`## Contents`" itself, use the the extended markup `{no-toc}`. This way, this heading will not appear in the TOC.

The auto-generated `id` values for the headings will be automatically used in the TOC. If you need to reference a heading element anywhere else, generate HTML at least one and see how it is referenced in your TOC, copy/paste it, for example: `as it is explained [in this section](#heading-usage)`.

Use fenced code blocks to show source code. Add the `lang` and `id` attributes, which is made possible through the new Markdown extension, "attrubution" syntax. For example:

````
~~~ {lang=C#}{id=code-csharp-usage-sample}
class MyClass { /* ... */ }
~~~
````

The attribute `lang` will be used for proper syntax highlighting, and `id` can be used to reference a source code sample. For example: `in the sample [shown above](#code-csharp-usage-sample)...`

Add regular HTML comments: before "`## Contents`", add `&lt;!-- copy to CodeProject from this point --&gt;`, and, at the very end `&lt;!-- copy to CodeProject to this point --&gt;`. When an HTML file is generated, located these two marks, copy the text between them, and paste to the source element of the CodeProject article submission wizard. Everything will be correct, no manual editing should be required.
