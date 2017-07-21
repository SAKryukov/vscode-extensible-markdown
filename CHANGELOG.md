# Changelog

## Version 5.0.0

* Added advanced Markdown extension features based on embedded markdown-it plug-in:
	- Syntax extension: a tag to mark a heading to be excluded from TOC 
	- Extended options to make a choice between `ul` or `ol` elements in TOC, either globally or per TOC level
	- Extended options to add sets of HTML attributes to TOC list elements, either globally or per TOC level
* Added images to conversion and preview commands and menu items to the editor title
* Improved logo

## Version 4.3.0

* Added logo
* Minor fixes (non-functional)

## Version 4.2.0

* Table of Contents and generation of heading `id` attributes unified in a single embedded module.
* Added settings option: "markdown.extension.convertToHtml.options.headingIdPrefix", default "heading."
* Fixed a bug in heading `id` attribute generation; now the set of used `id` values is reset on each rendering

## Version 4.1.0

* Added settings option: "markdown.extension.convertToHtml.tocIncludeLevels", default [1, 2, 3, 4, 5, 6]
* Added settings option: "markdown.extension.convertToHtml.tocContainerClass", default "toc"
* Added settings option: "markdown.extension.convertToHtml.tocListType", default "ul"

## Version 4.0.0

* Found critical bug in the external "markdown-it-named-headers" and "markdown-it-table-of-contents": generated id values of headers were not unique. As a work-around, these external modules are eliminated and replaced with modules embedded in the extension.

Major version is incremented because the default Markdown pattern for Table of Content has changed to `^\[\]\(toc\)`, which means "`[](toc)`" at the beginning of line. Potentially, it could break backward compatibility with existing Markdown documents using "`[[toc]]`", but it's easy to fix.

## Version 3.0.0

* Location of the included file is now relative to the Markdown document location

## Version 2.3.0

* Implemented extensible Markdown syntax coloring for each plug-in syntax, user-configurable
* Implemented user-configurable syntax coloring for document title in input Markdown
* Implemented file includes, with user-configurable syntax coloring
* Added keybinding, to overwrite "VS Code Markdown" preview key bindings

## Version 2.2.0

* Implemented preview identical to generated HTML
* Improved performance (lazy evaluation of markdown-it module setup and settings)
* In settings, implemented "outputPath" option

## Version 2.1.0

* Minor code fixes: turned on JavaScript strict mode; it revealed some undeclared variables, fixed; none of those problems were functional
* Added forgotten and important `<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>` element to the HTML template

## Version 2.0.0

* New feature introduced: user-installed additional markdown-it plug-ins, configurable through the "settings.json" of the extension

## Version 1.2.0

* Some "markdown-it" options and "markdown-it-named-headers" plug-in exposed as optional: 6 new options added to extension settings
* Fixed CSS relative path in generated HTML: on Windows, backslash separator replaced with /

## Version 1.1.1

* Fixed a bug in a relative path to CSS files

## Version 1.1.0

* Implemented new settings option: "markdown.extension.convertToHtml.embedCss"
* Multiple CSS files listed in "markdown.styles" option are supported
* For CSS files, path relative to HTML path is calculated 

## Version 1.0.3

* README fix: corrected linking to https://vsmarketplacebadge.apphb.com/version/sakryukov.convert-markdown-to-html.svg and extension page

## Version 1.0.2

* Cosmetic code and README fixes

## Version 1.0.1

* Updated README to include release version image from https://vsmarketplacebadge.apphb.com/version/sakryukov.convert-markdown-to-html.svg

## Version 1.0.0

* Initial production release

## Version 0.1.0

* Initial release
