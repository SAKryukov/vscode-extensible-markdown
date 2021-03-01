Using Additional Plug-ins{title}

[Sergey A Kryukov](http://www.sakryukov.org){.author}

## Contents{no-toc}

@toc

## Installation of Plugins

This demo requires installation of

* [markdown-it-sub](https://www.npmjs.com/package/markdown-it-sub)
* [markdown-it-sup](https://www.npmjs.com/package/markdown-it-sup)

For installation, [node.js](https://nodejs.org) should be installed. It comes with [npm](https://www.npmjs.com).

All plugins can be installed locally, in any arbitrary directory. Choose such directory, make it a current (working) directory and launch [npm](https://www.npmjs.com) with command line, which is shown on the Web page of each plugin module. For example:

```
npm install markdown-it-sub --save
```

Then this directory should be specified in a workspace "settings.json" as absolute path or a path relative to workspace. Look at the [sample of settings](https://github.com/SAKryukov/vscode-extensible-markdown/blob/master/docs/vscode-workspace-sample/.vscode/settings.json), the option "`markdown.extensibleMarkdown.options.additionalPlugins`", see also the [sample shown below](#heading-settings).

Importantly, syntax coloring does not require installation of corresponding plugin. It only needs to be mentioned in "settings.json" and not even necessarily enabled -- that's why "syntacticDecorators" have separate "enable" property. A plugin descriptor has only three properties: "name", "enable" and "syntacticDecorators". For syntax coloring, only "syntacticDecorators" needs to be present; first two, "name" and "enable" can be missing, contain wrong values, and so on.
The properties "name" and "enable" are important for Markdown processing by the plugins.

## Example: Using Subscripts and Superscripts

As we know, E = mc^2^. No, this is not a Unicode superscript `²` of *code point* U+00b2, as in a². To illustrate it, we can write a bit more complex expression: e^sin(x)^.

This works: A~n,m~ = B~j,k~, but blank space inside subscript/superscript expression won't.

In a code block, everything is shown as is:
```
E = mc^2^
e^sin(x)^
A~n,m~ = B~j,k~
```

## Settings
Fragment of "settings.json":
```
{
    "...": "...",
    "markdown.extensibleMarkdown.options.additionalPlugins": {
        "absolutePath": "/app/Node.js/node_modules",
        "plugins": [
            {
                "name": "markdown-it-sub",
                "enable": true,
                "syntacticDecorators": [
                    {
                        "enable": true,
                        "regexString": "\\~(.*?)\\~",
                        "tooltipFormat": "Subscript: %s",
                        "style": { "backgroundColor": "LemonChiffon" }
                    }
                ]
            },
            {
                "name": "markdown-it-sup",
                "enable": true,
                "syntacticDecorators": [
                    {
                        "enable": true,
                        "regexString": "\\^(.*?)\\^",
                        "tooltipFormat": "Superscript: %s",
                        "style": { "backgroundColor": "LavenderBlush" }
                    }
                ]
            }
        ]
    }
}
```

The object `syntacticDecorators` is optional.

Note that R`egexString` is a string, not a JavaScript [`RegExp` object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp), so the Regular Expression escape characters "`\`" are doubled: "`\\`". Besides, if "%s" is used in `tooltipFormat`, the Regular Expression should contain at least one group (in round brackets). In this case, the content matching to the first *group* found will replace "%s".

## Fallback

If additional plugins are configured in settings but the actual plugin code is missing the rendered content experiences [graceful degradation](https://en.wikipedia.org/w/index.php?title=Graceful_degradation&redirect=no). The markup is rendered as if the supporting plugins did not exist.

When the plugins are installed properly and the paths to them specified in the settings object `markdown.extensibleMarkdown.options.additionalPlugins` are correct, the rendering effect may not manifest itself immediately in the preview --- restart of VSCode may be required. In contrast to that, the modification of "settings.json", as always, should be manifested immediately and reflected in the preview.
