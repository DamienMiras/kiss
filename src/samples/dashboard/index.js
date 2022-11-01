import Configuration from "../../modules/configuration.js";
import kissLoader from "../../modules/kissLoader.js";
import {log} from "../../modules/log.js";


window.onload = () => {

    log("init");
    Configuration.setBasePath("../samples/dashboard/");
    new kissLoader();

}

