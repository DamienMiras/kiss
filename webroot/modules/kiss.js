import Loader from "./loader.js";

let bus = $(window);
export default class Kiss extends Loader {
    constructor() {
        super();
        this.element = null;
        this.id = null;
        this.bus = bus;

    }

    bus() {
        return this.bus;
    }

    onLoaded(element, parent) {
        this.element = element;
        this.id = this.element.id;
        console.log(this.id, "loaded from:" + parent);
        if (this.id === parent) {
            console.error("try to load a child of the same id than parent :" + this.id);
            return;
        }
        let rend = this.render();
        if (rend !== undefined && rend !== '') {
            this.element.innerHTML = rend;
        }
        let kisses = this.element.querySelectorAll('.kiss');
        for (let i = 0; i < kisses.length; ++i) {
            let kiss = kisses[i].id;
            console.log(kiss)
            if (kiss !== undefined) {
                this.load(kiss, new Kiss(), null, null, this.id);
            } else {
                console.error("kiss elements must have an id, on of descendand of " + this.id + " does not have one")
            }

        }

    }

    render() {

    }
}