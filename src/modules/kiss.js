import Peace from "./peace.js";
import {log} from "./log.js";


export default class Kiss extends Peace {
    constructor(parentKiss, element) {
        super();


        if (!parentKiss) {
            parentKiss = null;
        }
        this.parentKiss = parentKiss;


        this.element = element;

        this.name = this.element.tagName.toLowerCase();
        this.id = this.element.id;


        //TODO set as config, to get it from the console
        this.visualDebug = true;

    }

    getId() {
        return this.id;
    }

    getPath() {
        let path = "";
        let parent = this;
        while (parent) {
            let name;
            if (parent.hasMethod("getParent")) {
                name = parent.getName();
            } else {
                name = parent.constructor.name;
            }
            path = name + '>' + path;
            if (parent.hasMethod("getParent")) {
                parent = parent.getParent();
            } else {
                parent = null;
            }
        }
        return path;
    }


    getParent() {
        return this.parentKiss;
    }

    getName() {
        return this.name;
    }

    getElement() {
        return this.element;
    }




    load() {
        //refactor compatibility
        this.onLoaded();
    }


    onLoaded() {
        log(this)("COMPONENT LOADED " + this.name);
    }

    render() {
        return '<div>extends Kiss and implement render() or create ' + this.name + '.html file</div>';
    }


    onMessageReceived(event) {
        log(this)(this.name + " recevieved a message type[" + event.type + "] from [" + event.from.getName() + "]", event);
    }


}