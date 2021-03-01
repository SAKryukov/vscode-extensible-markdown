@numbering {
    enable: true
    h1.prefix: "Chapter "
    h1.suffix: ": "
    h1.separator: "-"
    h1.start: ["One", "Two", "Three", "Four"]
    defaultSeparator: "."
    defaultSuffix: " "
    h2.prefix: "Chapter "
    h2.separator: ", §"
    h2.suffix: ": " 
    h3.standAlong: true
    h4.start: "a"
    h4.suffix: ") "
}

Advanced Auto-Numbering{title}{.title}

@toc


@include(body.md)

# Fifth Top-Level Heading: out of Chapter Names
# Sixth Top-Level Heading: out of Chapter Names

## Auto-Numbering Descriptor Sample

```
@numbering {
    enable: true
    h1.prefix: "Chapter "
    h1.suffix: ": "
    h1.separator: "-"
    h1.start: ["One", "Two", "Three", "Four"]
    defaultSeparator: "."
    defaultSuffix: " "
    h2.prefix: "Chapter "
    h2.separator: ", §"
    h2.suffix: ": " 
    h3.standAlong: true
    h4.start: "a"
    h4.suffix: ") "
}
```

