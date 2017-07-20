Using Additional Plug-ins</small>[](title)

[Sergey A Kryukov](http://www.sakryukov.org)

## Contents[](notoc)

The way to avoid adding the heading is to mark it with `[](notoc)`.

The TOC below is automatically generated with the plug-in "[markdown-it-table-of-contents](https://www.npmjs.com/package/markdown-it-table-of-contents)":

[](toc)

## Installation of Plug-ins

This demo requires installation of

* [markdown-it-footnote](https://www.npmjs.com/package/markdown-it-footnote)
* [markdown-it-attrs](https://www.npmjs.com/package/markdown-it-attrs)
* [markdown-it-sub](https://www.npmjs.com/package/markdown-it-sub)
* [markdown-it-sup](https://www.npmjs.com/package/markdown-it-sup)

For installation, [node.js](https://nodejs.org) should be installed. It comes with [npm](https://www.npmjs.com).

All plug-ins can be installed locally, in any arbitrary directory. Choose such directory, make it a current (working) directory and launch [npm](https://www.npmjs.com) with command line, which is shown on the Web page of each plug-in module. For example:

```
npm install markdown-it-footnote --save
```

Then this directory should be specified in a workspace "settings.json" as absolute path or a path relative to workspace. This is explained in [Extensible Markdown Converter documentation](https://sakryukov.github.io/vscode-markdown-to-html/#additional-plug-ins); and this is the [sample of settings](https://sakryukov.github.io/vscode-markdown-to-html/#settings-sample) — look at the option "`markdown.extension.convertToHtml.options.additionalPlugins`".

Importantly, syntax coloring does not require installation of corresponding plug-in. It only needs to be mentioned in "settings.json" and not even necessarily enabled -- that's why "syntacticDecorators" have separate "enable" property. A plug-in descriptor has only three properties: "name", "enable" and "syntacticDecorators". For syntax coloring, only "syntacticDecorators" needs to be present; first two, "name" and "enable" can be missing, contain wrong values, and so on.
The properties "name" and "enable" are important for Markdown processing by the plug-ins.


## Footnotes

Let's say, we want to reference a footnote [^first] and one more, a long one [^long].

Let's reference the same footnote [^first].

[^first]: This is the footnote itself.
We have indication that this footnote is referenced from two places:

[^long]:
    This is a long footnote.

    One paragraph.

    Another paragraph.

    As many as we want...

    We need to have many footnote paragraphs, to illustrate the location of footnotes.

    ...<br/>...<br/>...<br/>...<br/>...<br/>...<br/>...<br/>...<br/>...<br/>...<br/>...<br/>...<br/>...<br/>...<br/>...<br/>...<br/>...<br/>...<br/>...<br/>...<br/>...<br/>...<br/>...<br/>...<br/>...<br/>...<br/>...<br/>...<br/>...<br/>...<br/>...<br/>

    That's enough.

## Inline Notes

Here is an inline note.^[Inline notes are easier to write, since
you don't have to pick an identifier and move down to type the
note. &copy; [markdown-it-footnote](https://www.npmjs.com/package/markdown-it-footnote)]

## Subscripts and Superscripts

As we know, E = mc^2^. No, this is not a Unicode superscript `²` of *code point* U+00b2, as in a². To illustrate it, we can write a bit more complex expression: e^sin(x)^.

This works: A~n,m~ = B~j,k~, but blank space inside subscript/superscript expression won't.

In a code block, everything is shown as is:
```
E = mc^2^
e^sin(x)^
A~n,m~ = B~j,k~
```

## Adding Attributes

One problem with documenting using Markdown is the lack of the possibility to anchor to arbitrary element in text.

This is a paragraph: {id=id.value}

This is a paragraph with class: {.cls}

## Sample of Headings:

## Level 2 A

### Level 3 A....

### Level 3 A.2

#### Level 4 A.2....

#### Level 4 A.2.2

#### Level 4 A.2.3

## Level 2 B

### Level 3 B....

### Level 3 B.2i

Link to the [paragraph with id](#id.value).