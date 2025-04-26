"use strict";

module.exports = (md, options, importContext) => {

    const prefixBOMInIncludeFiles = "In included files, ";

    const locatorRegex = importContext.utility.createOptionalRegExp(options.locatorRegex, true);
    if (!locatorRegex) return;

    const formatMessage = (formatString, text, normalizePath) => {
        if (normalizePath)
            text = text.replace(/\\/g, "/");
        return formatString.replace("%s", text);
    }; //formatMessage

    const readFileContent = match => {
        const sourcefileName = importContext.fileName == null
            ? importContext.vscode.window.activeTextEditor.document.fileName
            : importContext.fileName;
        const documentPath = importContext.path.dirname(sourcefileName);
        const fileName = importContext.path.join(documentPath, match.file);
        if (! (importContext.fs.existsSync(fileName) && importContext.fs.lstatSync(fileName).isFile()))
            return formatMessage(options.fileNotFoundMessageFormat, fileName, true);
        try {
            let buffer = importContext.fs.readFileSync(fileName);
            buffer = importContext.utility.removeBOM(buffer, prefixBOMInIncludeFiles);
            return buffer.buffer.toString(buffer.encoding);
        } catch (ex) {
            const detail = ex.constructor == importContext.utility.definitionSet.exceptions.BOMException
                ? ex.message
                : importContext.utility.definitionSet.stringEmpty;
            return importContext.utility.definitionSet.formats.IncludeException(
                formatMessage(options.fileReadFailureMessageFormat, fileName, true),
                detail);
        } //exception
    }; //readFileContent

    const replaceIncludes = source => {
        const matches = [];
        let match = true;
        while (match = locatorRegex.exec(source)) {
            if (match.length != 2)
                return formatMessage(options.invalidRegexMessageFormat, locatorRegex.source, true);
            matches.push({ match: match[0], file: match[1] });
        } //loop
        let result = source;
        for (let match of matches)
            result = result.replace(match.match, readFileContent(match));
        return result;
    }; //replaceIncludes

    md.core.ruler.before("normalize", "sourceIncludes", state => {
        state.src = replaceIncludes(state.src);
    }); //before normalize

}; //module.exports
