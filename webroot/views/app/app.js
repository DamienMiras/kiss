import Kiss from "../../modules/kiss.js";


//TODO front use loadash
export default class Dashboard extends Kiss {
    constructor() {
        super();

        this.bus.on('com.miras.loader.view.added', function (e, data) {
            console.log('%c YEEEES yes yes ' + this.id + ' received the message', "color :rgb(127,127,0)", data, e);
        });
    }

    onLoaded(element) {
        super.onLoaded(element);
    }


}


