"use strict";

module.exports = function (options, headingLevel) {

    function getOption(optionSet, level, property, defaultValue) {
        if (!defaultValue) defaultValue = '';
        if (!optionSet) return defaultValue;
        const pattern = optionSet.pattern;
        if (!pattern) return defaultValue;
        const arrayElement = pattern[level - 1];
        if (!arrayElement) return defaultValue;
        const propertyValue = arrayElement[property];
        if (!propertyValue) return defaultValue;
        return propertyValue;
    } //getOption

    const initializeAutoNumbering = function (tokens) {
        const effectiveOptions = options.autoNumbering;
        if (!effectiveOptions) return null;
        if (!effectiveOptions.enable) return null;
        const theSet = {
            level: -1,
            levels: [],
            effectiveOptions: effectiveOptions,
            getSeparator: function (level) {
                return getOption(effectiveOptions, level, "separator", effectiveOptions.defaultSeparator);
            },
            getStart: function (level) {
                return getOption(effectiveOptions, level, "start", effectiveOptions.defaultStart)
            },
            getPrefix: function (level) {
                return getOption(effectiveOptions, level, "prefix", effectiveOptions.defaultPrefix);
            },
            getSuffix: function (level) {
                return getOption(effectiveOptions, level, "suffix", effectiveOptions.defaultSuffix);
            },
            getStandAlong: function (level) {
                return getOption(effectiveOptions, level, "standAlong", effectiveOptions.defaultPrefix);
            }
        }; //theSet

        theSet.getAccumulator = function (level) {
            if (!theSet.levels[theSet.level]) return '';
            if (!theSet.levels[theSet.level].accumulator)
                return theSet.levels[theSet.level].number;
            return theSet.levels[theSet.level].accumulator
                + theSet.getSeparator(theSet.level)
                + theSet.levels[theSet.level].number
        }; //theSet.getAccumulator

        theSet.getNumberingText = function (level) {
            const standAlong = theSet.getStandAlong(level);
            return (!standAlong) && theSet.levels[level].accumulator.length > 0 ?
                theSet.levels[level].accumulator
                + theSet.getSeparator(level)
                + theSet.levels[level].number.toString()
                : theSet.levels[level].number.toString();
        }; //theSet.getNumberingText
        return theSet;
    }; //initializeAutoNumbering

    const iterateAutoNumbering = function (excludeFromToc, autoSet, token) {
        if (!autoSet) return '';
        if (excludeFromToc) return '';
        const level = headingLevel(token);
        if (!autoSet.levels[level])
            autoSet.levels[level] = { number: new Iterator(autoSet.getStart(level)) };
        if (level > autoSet.level) {
            autoSet.levels[level].number = new Iterator(autoSet.getStart(level));
            autoSet.levels[level].accumulator = autoSet.getAccumulator(level);
        } else
            autoSet.levels[level].number = autoSet.levels[level].number.next();
        const result = autoSet.getNumberingText(level);
        const prefix = autoSet.getPrefix(level);
        const suffix = autoSet.getSuffix(level);
        autoSet.level = level;
        return prefix + result + suffix;
    }; //iterateAutoNumbering

    return { initializer: initializeAutoNumbering, iterator: iterateAutoNumbering };

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

} //module.exports
