import Kiss from "../../modules/kiss.js"
import Configuration from "../../modules/configuration.js";
import {err, log} from "../../modules/log.js";


window.onload = () => {


    log(window)("------------------------------------Load KISS-----------------------------------------------------------------s");

    Configuration.setBasePath("../samples/dashboard/");

    new Kiss().load().then(result => {

        log(this)("" +
            "                                                                 \r\n" +
            "                                                                 \r\n" +
            "                                                                 \r\n" +
            "                                                                 \r\n" +
            "                                                                 \r\n" +
            "                    d8b         d8,                              \r\n" +
            "                    ?88        `8P                               \r\n" +
            "                     88b                                         \r\n" +
            "                     888  d88'  88b .d888b, .d888b,              \r\n" +
            "                     888bd8P'   88P ?8b,    ?8b,                 \r\n" +
            "                    d88888b    d88    `?8b    `?8b               \r\n" +
            "                   d88' `?88b,d88' `?888P' `?888P'        ...sssssSTARTED\r\n" +
            "                                                                 \r\n" +
            "                                                                 \r\n" +
            "                                                                 \r\n" +
            "                                                                 \r\n"
            , result);
    }).catch(error => {
        err("Kiss not started ", error);
    });

}

