# Changelog

## Version 2.3.0

* Implemented extensible Markdown syntactic decorations for each plug-in syntax, user-configurable
* Implemented user-configurable style for document title in input Markdown

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
