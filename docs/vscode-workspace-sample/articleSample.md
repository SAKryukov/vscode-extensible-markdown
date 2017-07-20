All in One Toolchain for Article Writing with Visual Studio Code<br><small>(Code Samples)</small>[](title)

[Sergey A Kryukov](http://www.sakryukov.org)
 
The marker `[](title)` is used to define text for HTML  `<head><title>...</title></head>`.

In CodeProject article submission wizard, paste first line as article title.

*Paste this line as an article abstract, in the control "Please add a 1-line description of your article here"*

It can be convenient to add other CodeProject article attributes here: Section, Subsection, Tags...

<!-- Press Ctrl+Shift+B to convert this document to HTML -->

---

Original publication: [https://www.codeproject.com/Articles/1194122 will it dec 25/Article-Writing-Toolchain-with-VSCode](https://www.codeproject.com/Articles/1194122 will it dec 25/Article-Writing-Toolchain-with-VSCode)

Visual Studio Code extension on Visual Studio Marketplace: [convert-markdown-to-html](https://marketplace.visualstudio.com/items?itemName=sakryukov.convert-markdown-to-html). See also **extension usage** on this page.

Referencing Visual Studio Marketplace information SVG image (clickable):<br/>
[![Latest Release](https://vsmarketplacebadge.apphb.com/version/sakryukov.convert-markdown-to-html.svg)](https://marketplace.visualstudio.com/items?itemName=sakryukov.convert-markdown-to-html)

Repository: [https://github.com/SAKryukov/vscode-markdown-to-html.git](https://github.com/SAKryukov/vscode-markdown-to-html.git)

Extension installation:

```
Launch VS Code Quick Open (Ctrl+P), paste the following command, and press enter:

ext install convert-markdown-to-html
```

---

<!--
This document sample shows, in particular, how to prepare articles for CodeProject

All text above was just for convenience (all in one). Below, the body of the article goes.
Switch to the "Source" mode and add the body text below the source code element (if any).
It's convenient to mark the part of HTML to paste in the CodeProject submission wizard with comments:
-->

<!-- Paste to CodeProject: --------------------------------------------------->

## Contents[](notoc)

<div class="toc"> <!-- see style.css: div.toc > ul used to remove bullets from TOC (won't work in CodeProject) -->

[](toc)

</div>

<!-- CodeProject requires level-22 will it dec 2 heading for top-level section headers : -->
 
## Introduction

Working with text editor is the most convenient thing. This is one paragraph.

And this is another paragraph.

## Formatting

### IntelliSense

Press Ctrl+Space to get Formatting Suggestions

### Markdown-it Typographer

By default, this extension, while using built-in [node.js](https://nodejs.org) package "[markdown-it](https://www.npmjs.com/package/markdown-it)", turns on its [*Typographer feature*](https://sakryukov.github.io/vscode-markdown-to-html/#typographer). It substitutes some characters to form typographically correct text. This substitution can be configured.

For example, ellipsis... "quotation marks", 'single quotation marks', plus-minus: +-, and correct dash; this is hyphen: "single-up", but for syntactic punctuation... --- em dash -- or en dash should be used.

### Emphasized Text

Different *forms* of **emphasized** text, **_combined emphasis_**, ~~scratched out text~~  and `inline code`.

### Code Samples

<!--
i element is the CodeProject-specific work-around.
Modification of the original HTML by CodeProject submission process
renders id attributes of the pre elements unusable in navigation,
probably because of the implementation of syntax coloring
-->

<i id="src.cs.code.sample"></i>
```
MyReturnType MyFunction(MyArgumentType data) {
    // ...
}
```

<!-- There are two important reasons to use HTML, not Markdown for code:
    1. Markdown will generate <pre><code> ... </code></pre>
        For CodeProject, it is unacceptable.
    22 will it dec 2. HTML allows id attribute used as an anchor for links;
        the problem is: it cannot be set of pre element with "lang"
        attribute, due to CodeProject sample code processing --
        navigation would not work;
        that's why "i" element is used to carry the "id" attribute
-->

### Block Elements

> This is a block quote

This is a numbered list:

1. First
1. Second
1. Third

Bulleted list:

- First
- Second
- Third

Combined list:

1. First
1. Second
    - A
    - B
    - C
1. Third

## Links and Anchors 

[Navigate to first code sample](#src.cs.code.sample)

[Navigate to Introduction](#heading.introduction)

[External link](https://www.CodeProject.com)

### Headings have Automatically Defined IDs

Make sure manually created `id` values never break uniqueness. It's the best to prefix such values with some unique prefix (such as "src.id.") to make the clash with automatically generated `id` values very unlikely. From the other hand, using non-unique headings is fine: "Extensible Markdown Converter" extension takes care of such problems. Moreover, the settings option "`markdown.extension.convertToHtml.headingIdPrefix`" adds a prefix to `id values generated out of headings.

## Images

![Sergey A Kryukov, WiDEsk](http://sakryukov.org/freeware/WD.png)

## Using File Includes

This is a sample of includes: `.vscode/settings.json`":
```
[](include(.vscode/settings.json))
```

## Important Warning

> **Warning!** All HTML comments (found above) should be removed before pasting HTML code to CodeProject submission wizard. Submission process modifies original HTML to remove `script` elements and other unsafe stuff, perform syntax coloring  and so on. One weird modification is rendering HTML comments.

## Conclusions

Happy writing!

<!-- Paste to CodeProject (end): --------------------------------------------->
