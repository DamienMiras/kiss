import Kiss from "./modules/kiss.js";
import App from "./views/app/app.js";


window.context = {
    global: "this is really global"
}
window.onload = () => {

    console.log("------------------------------------on loaaad-----------------------------------------------------------------s")


    let factory = {
        "app": App,
        // "dashboard": Dashboard,
        // "navigation": Navigation,
        // "header": Header,
        // "dashboard_menu": DashboardMenu
    }
    window.context.global = new Kiss(factory);
    window.context.global.load();
    console.log("this is a global object", context.global);

}

