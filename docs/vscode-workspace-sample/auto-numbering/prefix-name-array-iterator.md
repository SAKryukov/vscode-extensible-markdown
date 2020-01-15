@numbering {
    enable: true
    defaultSeparator: "."
    defaultSuffix: " "
    h2.prefix: "Глава "
    h2.suffix: ": "
    h2.separator: "-"
    h2.start: ["первая", "вторая", "третья"]
    h4.start: "a"
    h4.suffix: "-"
    h3.standAlong: true
}

The{title} title

{.cls}Rweer{class=newClass}

@toc


[](include(body.md))

## Out of Chapter Names

### next2
1
#### 4a

#### 4b

No more names in "start": ["One", "Two", "Three", "Four"]

## Using Letters Instead of Names

### more

#### 4aa

#### 4bb

### even more

## Good

This a is *{Request for Comments}RFC* #1.{a=b}
## Bad, but graceful degradation


