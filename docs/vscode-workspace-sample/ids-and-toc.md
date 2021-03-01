Headings and Table of Contents{title}

# Contents{no-toc}

@toc

# Introduction

Use Markdown heading markup to define headings. Use `@toc` in a separate line to place a Table of Contents.

Some headings should not be placed in the TOC. Mark them with {`no-toc`}. Note the use of the attribute {`title`}. It is shown in the first line in the present document, but it doesn't have to be placed in the first line. If it is used, it is not rendered as a heading. Instead, this is a paragraph styled using a CSS class named "title". The name for this class can be specified in settings: Markdown > Extensible Markdown > Title Class Name. 

The attribute {`title`} is used not only for CSS but also to indicate the string used as the header title in the generated HTML document.

See [this section](#heading-how-to-reference-a-heading) for the example of referencing a heading.

@include(auto-numbering/body.md)

# Example: How to Reference a Heading

[See First Section, Heading Level 3](#heading-first-section2c-heading-level-3)

It is useful to generate HTML first, using the command "Markdown: Convert to HTML". Open the generated HTML document, look at the rendered TOC and find the appropriate heading reference specified by the auto-generated `id` attribute.