# Changelog

## Version 8.4.2

* Simplified passing parameters to markdown-it plugins
* Implemented unified utilization of definitionSet
* Code clean-up

## Version 8.4.0

* Fixed marginal issue with BOM in include files: embedded CSS and the files included using `@include` feature.
* Definitions are refactored: the object `definitionSet` is created.

## Version 8.3.3

Included CHANGELOG

## Version 8.3.2

* The publication moved to GitHub (CodeProject is out of business, publications are accessible but not updateable) and improved.
* Auto-numbering syntax fixed.

## Version 8.3.1

* Improved slugify; now all blank spaces in id values are rendered as '-'

## Version 5.8.0

* Introduced simplified new format for in-document auto-numbering options

## Version 5.7.1

* Fixed a long-hunted bug: markdown-it failure in some valid but less usual use cases, such as: paragraph in next line after heading, HTML comment before heading, end-of file at the end line of a paragraph following some heading

## Version 5.7.0

* Improved handling of the case of invalid JSON in the in-doc auto-numbering specifications

## Version 5.6.0

* New major feature: heading number iterates not only by numbers or letters, but also by array of "numbers", such as ["One", "Two", "Three"]
* Regression issue fix: arrays in user options are not overridden by default, first of all, `includeLevel` used in TOC

## Version 5.5.4

* Many improvements related to auto-numbering options, defaults and handling the options and the defaults
* Improved syntax coloring for extended syntactic features

* Fixed a bug with second run of embedded markdown-it plugin: TOC was not updated

## Version 5.5.3

* Fixed a bug with second run of embedded markdown-it plugin: TOC was not updated

## Version 5.5.1

* Fixed regression bug in auto-numbering, related to handling of RegExp failure: if first token is paragraph and not a auto-numbering settings tag, it wasn't rendering

## Version 5.5.0

* Fixed known bugs in 5.4.0: incorrect auto numbering default in settings, redundant re-setting of handler in the embedded markdown-it plugin

## Version 5.4.0

* Added user-configurable auto-numbering

## Version 5.3.0

* Fixed critical bugs in the embedded markdown-it plug-in: shifted sequence of `id` values in TOC when some heading levels are excluded

## Version 5.2.0

* Fixed critical bugs in the embedded markdown-it plug-in: shifted sequence of `id` values in headings when "no-TOC" features is used

## Version 5.1.0

* Found critical bugs in the legacy code of the embedded markdown-it plug-in, so this module is fully re-written

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
* Added settings option: "markdown.extension.convertToHtml.tocListType", default "ul" (later removed SA???)

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
