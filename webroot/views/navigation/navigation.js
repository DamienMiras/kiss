import Kiss from "../../modules/kiss.js";

export default class Navigation extends Kiss {
    constructor(factory, parentKiss, element) {
        super(factory, parentKiss, element);


    }

    onLoaded() {
        window.setInterval(function () {

            this.bus.trigger("kiss.header", {aField: "bisous for header ", date: "" + new Date()});
            this.bus.trigger("kiss", {aField: "bisous for all" + new Date()});

        }.bind(this), 1000 * 5);

    }
}

