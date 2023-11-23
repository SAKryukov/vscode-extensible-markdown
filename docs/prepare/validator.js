// To detect invalid anchor targets, add:
//     <script src="prepare/validator.js"></script>
//

window.onload = () => {

    const errors = [];
    const external = [];
    const anchors = document.getElementsByTagName("a");
    for (let anchor of anchors) {
        if (!anchor.textContent) continue;
        if (!anchor.href) continue;
        if (anchor.protocol == "file:") {
            if (!anchor.hash) continue;
            element = document.getElementById(anchor.hash.replace("#", ""));
            if (!element)
                errors.push(anchor);    
        } else
            external.push(anchor);
    } //loop

    if (errors.length > 0) {
        document.writeln(
            `<h1>Errors: invalid anchor hrefs:</h1>`);
        for (let anchor of errors)
            document.writeln(
                `<h3> ${anchor.hash}<dd>Text:
                    "${anchor.textContent}"</dd></h3>`);
    } //if

    if (external.length > 0) {
        document.writeln(`<h1>External anchors:</h1><ol>`);
        for (let anchor of external)
            document.writeln(
                `<li><a href="${anchor.href}">
                    ${anchor.textContent}</a></li>`);
        document.writeln("</ol>");
    } //if

} //window.onload
