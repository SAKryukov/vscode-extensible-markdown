"use strict";

function Iterator(first) {
    if (first.constructor == Array) this.array = first;
    this.counter = this.array ? 0 : first;
    Iterator.prototype.toString = function () {
        return this.array ?
            this.array[this.counter].toString() : this.counter.toString()
    }; // toString
    Iterator.prototype.next = function () {
        if (this.array)
            if (!this.array[this.counter + 1]) {
                this.counter = this.array[this.array.length - 1];
                delete this.array;
            } else
                this.counter++;
        if (!this.array) { // again, because it could have changed by delete this.array 
            let tryNumeric = parseInt(this.counter);
            if (isNaN(tryNumeric)) {
                let codePoint = this.counter.codePointAt();
                this.counter = String.fromCodePoint(++codePoint);
            } else
                this.counter = (++tryNumeric).toString();
        } //if
        return this;
    } //next
} //Iterator

module.exports.Iterator = Iterator;

module.exports.getEffectiveLevelOptions = (options, level) => {
    const effectiveOptions = {
        suffix: options.autoNumbering.defaultSuffix,
        prefix: options.autoNumbering.defaultPrefix,
        start: options.autoNumbering.defaultStart,
        separator: options.autoNumbering.defaultSeparator,
        standalone: false
    };
    if (!options.autoNumbering.pattern[level]) return effectiveOptions;
    if (options.autoNumbering.pattern[level].suffix != undefined) effectiveOptions.suffix = options.autoNumbering.pattern[level].suffix;
    if (options.autoNumbering.pattern[level].prefix != undefined) effectiveOptions.prefix = options.autoNumbering.pattern[level].prefix;
    if (options.autoNumbering.pattern[level].start != undefined) effectiveOptions.start = options.autoNumbering.pattern[level].start;
    if (options.autoNumbering.pattern[level].separator != undefined) effectiveOptions.separator = options.autoNumbering.pattern[level].separator;
    if (options.autoNumbering.pattern[level].standalone != undefined) effectiveOptions.standalone = options.autoNumbering.pattern[level].standalone;
    return effectiveOptions;
} //module.exports.getEffectiveLevelOptions
