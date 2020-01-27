"use strict";

module.exports = (md, options) => {

    const locatorRegex = options.importContext.utility.createOptionalRegExp(options.includes.locatorRegex, true);
    if (!locatorRegex) return;

    const formatMessage = (formatString, text) =>  { return formatString.replace("%s", text); };

    const readFileContent = match => {
        const documentPath = options.importContext.path.dirname(options.importContext.vscode.window.activeTextEditor.document.fileName);
        const fileName = options.importContext.path.join(documentPath, match.file);
        if (! (options.importContext.fs.existsSync(fileName) && options.importContext.fs.lstatSync(fileName).isFile()))
            return formatMessage(options.includes.fileNotFoundMessageFormat, fileName);
        try {
            return  options.importContext.fs.readFileSync(fileName, options.importContext.encoding);
        } catch (ex) { 
            return formatMessage(options.includes.fileReadFailureMessageFormat, fileName);            
        } //exception
    }; //readFileContent

    const replaceIncludes = source => {
        const matches = [];
        let match = true;
        while (match = locatorRegex.exec(source)) {
            if (match.length != 2)
                throw  `Invalid regular expression for includes: ${locatorRegex.src}`;
            matches.push({ match: match[0], file: match[1]});
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
