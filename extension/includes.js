"use strict";

module.exports = (md, options) => {

    const utility = require("./utility");

    const replaceIncludes = source => {
        const result = source;
        return result;
    }; //replaceIncludes

    md.core.ruler.before("normalize", "sourceIncludes", state => {
        state.src = replaceIncludes(state.src); 
    }); //before normalize

}; //module.exports

// module.exports.replaceIncludes = (importContext, input, hostFileName, settings) => {
//     const readFile = fileName => {
//         try {
//             return importContext.fs.readFileSync(fileName, importContext.encoding);
//         } catch (ex) {
//             return importContext.util.format(settings.includeLocatorFileReadFailureMessageFormat, fileName);
//         } //exception
//     }; //readFile
//     const invalidRegexMessage = importContext.util.format(settings.includes.invalidRegexMessageFormat, settings.thisExtensionSettings.includes.locatorRegex);
//     let result = input;
//     const replaceOne = regex => {
//         const match = regex.exec(result);
//         if (!match) return false;
//         if (match.length != 2) { result = invalidRegexMessage; return false; }
//         const includefileName = importContext.path.join(
//             importContext.path.dirname(hostFileName),
//             match[1]);
//         result = result.replace(match[0], readFile(includefileName));
//         return true;
//     }; //replaceOne
//     try {
//         const regex = new RegExp(settings.thisExtensionSettings.includes.locatorRegex);
//         do { } while (replaceOne(regex));
//         return result;
//     } catch (ex) {
//         return input;
//     } //exception
// }; //replaceIncludes