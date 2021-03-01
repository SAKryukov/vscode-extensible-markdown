Custom Attributes{title}

## CSS Classes

The attribute {`title`} shown above is a special title class. It is used not only for CSS but to indicate the string used as the header title in the generated HTML document. The name for this class can be specified in settings: Markdown > Extensible Markdown > Title Class Name. 

Custom CSS classes:

Sergey A Kryukov{.author}

Demo class{.demo}

Multiple classes{.demo}{.author}

## Arbitrary Attributes

Unique ID{id=paragraph-unique-id}

To avoid the clashes of the `id` values with the auto-generated `id` values for headings, see settings: Markdown > Extensible Markdown > Heading ID Prefix. Simply keep explicitly defined IDs unique and use some other prefixes for them. For example, in the present document, all the `id` values start with "`paragraph-`" or "`code-`", the default Heading ID Prefix is "`heading-`".

Another way to specify one or more CSS classes{class=demo}{class=author}

Arbitrary style (not recommended){style=color: red; font-weight: bold; padding-top: 1em; }{title=The attribute style is used to define inline element style. Again: not recommended!}

Text with the attribute `title`{title=Detailed description of the element} --- place a mouse pointer over the acronym and see the title showing the title content. Do the same to the "Arbitrary style" element above.

## Attributes Combined with Source Code

```{id=code-assign-object}{lang=JavaScript}
const result = { count: 1, name: "name", };
const const status = { x: 0, y: 0, enabled: true, };
```

In CodeProject, the attribute `lang`  is used for syntax decoration, and the `id` is required to create an anchor in the article to reference a code sample.

## Abbreviations

This feature uses the HTML &lt;`abbr`&gt; element and the attribute `title`. Place a mouse pointer over the acronym text and see the title showing the full description of the term:

Example: *{Request for Comments}RFC*

*Note: abbreviations always work for the generated HTML document in a Web browser, but not always in the VSCode preview. I think this is a specific bug of VSCode or the embedded version of Markdown-it.*