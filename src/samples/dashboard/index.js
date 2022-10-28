import Kiss from "../../modules/kiss.js"

window.context = {
    kiss: null
}
window.onload = () => {

    console.log("------------------------------------Load KISS-----------------------------------------------------------------s")


    window.context.kiss = new Kiss();
    window.context.kiss.load();
    console.log("this is a global object", context.global);

}

