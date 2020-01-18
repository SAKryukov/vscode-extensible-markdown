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

{.cls}Rweer{someattribute=newClass}

@toc

This a is *{Request for Comments}RFC* #1.{a=b}

@include(body.md)

## Out of Chapter Names

###
2 
#### 4a{no-toc}

#### 4b

No more names in "start": ["One", "Two", "Three", "Four"]

## Using Letters Instead of Names

### more

#### 4aa

#### 4bb

### even more

## Good

## Bad, but graceful degradation


