import Kiss from "./modules/kiss.js";


window.context = {
    global: "this is really global"
}
window.onload = () => {

    console.log("------------------------------------on loaaad-----------------------------------------------------------------s")


    window.context.global = new Kiss();
    window.context.global.load();
    console.log("this is a global object", context.global);

}

