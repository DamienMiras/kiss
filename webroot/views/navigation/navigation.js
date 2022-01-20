import Kiss from "../../modules/kiss.js";

export default class Navigation extends Kiss {
    constructor() {
        super();


        this.bus.on('com.miras.loader.view.added', function (e, data) {
            console.log('%c YEEEES yes yes ' + this.id + ' received the message', "color :#FF007f", data, e);
        });

    }

    onLoaded(element) {
        super.onLoaded(element);
    }
}

