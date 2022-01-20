import Loader from "./modules/loader.js";
import Dashboard from "./views/dashboard/dashboard.js";
import Header from "./views/header/header.js";
import Navigation from "./views/navigation/navigation.js";

$(document).ready(function () {
    let loader = new Loader();
    loader.load("navigation", new Navigation());
    loader.load("header", new Header());
    loader.load("dashboard", new Dashboard());
});
