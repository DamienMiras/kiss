import Kiss from "./modules/kiss.js";
import App from "./views/app/app.js";
import Dashboard from "./views/dashboard/dashboard.js";
import Navigation from "./views/navigation/navigation.js";
import Header from "./views/header/header.js";

window.onload = () => {

    console.log("------------------------------------on loaaad-----------------------------------------------------------------s")

    let factory = {
        "app": App,
        "dashboard": Dashboard,
        "navigation": Navigation,
        "header": Header,
    }
    new Kiss(factory);

}

