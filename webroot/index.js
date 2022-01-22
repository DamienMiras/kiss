import Kiss from "./modules/kiss.js";

window.onload = () => {
    console.log("------------------------------------on loaaad-----------------------------------------------------------------s")
    new Kiss(null, document.getElementsByTagName("app")[0]);
}

