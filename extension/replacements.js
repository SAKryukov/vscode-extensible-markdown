"use strict";

module.exports = (md, options) => {

    const patterns = [
        { find: /!\=/g, replace: "≠" }, // != not equal
        { find: /!\|\|/g, replace: "∦" }, // !|| not parallel
        { find: /<\=/g, replace: "≤" }, // <= less or equal
        { find: /\>\=/g, replace: "≥" }, // >= more or equal
        { find: /!\~/g, replace: "≁" }, // !~ not tilde
        { find: /\-\+/g, replace: "∓" }, // -+
        { find: /\-\:/g, replace: "÷" }, // -:
        { find: /\|\|/g, replace: "∥" }, // || parallel
        { find: /\~\~/g, replace: "≈" }, // ~~ almost equal
        { find: /\=\=\=/g, replace: "≣" }, // === strictly equivalent
        { find: /\=\=/g, replace: "≡" }, // == identical
        { find: /!\.\</g, replace: "∉" }, // !.< not element of
        { find: /\.\</g, replace: "∈" }, // .< element of
        { find: /\<\|/g, replace: "⊂" }, // <| subset of
        { find: /\|\>/g, replace: "⊃" }, // |> superset of
        { find: /\@!/g, replace: "¬" }, // @! not
        { find: /\@all/g, replace: "∀" }, // @all universal quantifier
        { find: /\@exists/g, replace: "∃" }, // @exists quantifier
        { find: /\@empty/g, replace: "∅" }, // @empty set
        { find: /\@union/g, replace: "∪" }, // @union of sets
        { find: /\@intersection/g, replace: "∩" }, // @intersection set
        { find: /\@left/g, replace: "←" }, // @left
        { find: /\@right/g, replace: "→" }, // @right
        { find: /\@up/g, replace: "↑" }, // @up
        { find: /\@down/g, replace: "↓" }, // @down
        { find: /\@imply/g, replace: "⇒" }, //@imply
        { find: /\@minus/g, replace: "−" }, //@minus, typographically correct
    ];

    md.core.ruler.after("replacements", "extended_replacements", state => {
        for (let index = state.tokens.length - 1; index >= 0; --index) {
            const token = state.tokens[index];
            if (token.type != "inline") continue;
            let insideAutoLink = 0;
            for (let childIndex = token.children.length - 1; childIndex >= 0; --childIndex) {
                const childToken = token.children[childIndex];
                if (childToken.info = "auto") {
                    if (childToken.type == "link_open")
                        insideAutoLink -= 1;
                    else if (childToken.type == "link_close")
                        insideAutoLink += 1;
                    else if (childToken.type == "text") {
                        if (!insideAutoLink)
                            for (let pattern of patterns)
                                if (pattern.find.exec(childToken.content))
                                    childToken.content = childToken.content.replace(pattern.find, pattern.replace);
                    } //if
                } //if
            } //loop
        } //loop tokens
        return true;
    });

}; //module.exports
