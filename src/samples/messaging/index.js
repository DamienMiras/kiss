import Configuration from "../../modules/configuration.js";

import kissLoader from "../../modules/kissLoader.js";


window.onload = () => {

    Configuration.setBasePath("../samples/messaging/");
    new kissLoader();


}

