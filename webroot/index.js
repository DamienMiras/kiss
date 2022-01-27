import Kiss from "./modules/kiss.js";
import App from "./views/app/app.js";
import Dashboard from "./views/dashboard/dashboard.js";
import Navigation from "./views/navigation/navigation.js";
import Header from "./views/header/header.js";
import DashboardMenu from "./views/dashboard_menu/dashboardMenu.js";

window.context = {
    global: "this is really global"
}
window.onload = () => {

    console.log("------------------------------------on loaaad-----------------------------------------------------------------s")

    console.log("this is a global object", context.global);
    let factory = {
        "app": App,
        "dashboard": Dashboard,
        "navigation": Navigation,
        "header": Header,
        "dashboard_menu": DashboardMenu
    }
    new Kiss(factory);

}

