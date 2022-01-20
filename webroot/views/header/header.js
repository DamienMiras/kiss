import Kiss from "../../modules/kiss.js";


export default class Header extends Kiss {
    constructor() {
        super();

        this.bus.on('com.miras.loader.view.added', function (e, data) {
            console.log('%c YEEEES yes yes ' + this.id + ' received the message', "color :#7ff7f0", data, e);
        });
    }

    onLoaded(element) {
        super.onLoaded(element);

    }
}


