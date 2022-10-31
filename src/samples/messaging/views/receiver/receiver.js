import {log} from "../../../../modules/log.js";

export default class Receiver {
    constructor() {
        log(this)("construct");
    }

    render() {
        return "<br> receiver yeah <br>";
    }

}