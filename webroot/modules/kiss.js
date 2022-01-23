let bus = $("app");
import Peace from './peace.js';
import Global from "./global.js";
//import App from "../views/app/app.js";

let global = new Global();
export default class Kiss extends Peace {
    constructor(factory, parentKiss, element) {
        super();
        if (!factory) {
            this.e("factory is null... makes sure to call super with all args factory, parent, element : \n" +
                "export default class MyClass extends Kiss {\n" +
                "    constructor(factory, parentKiss, element) {\n" +
                "        super(factory, parentKiss, element);\n" +
                "    }\n" +
                "}")
        }
        this.factory = factory;
        this.bus = bus;
        this.gloabl = global;
        this.parentKiss = parentKiss;

        if (!element) {
            this.element = document.getElementsByTagName("app")[0];
        } else {
            this.element = element;
        }
        this.name = this.element.tagName.toLowerCase();
        this.element.style.color = this.getColor();
        this.bus.on("kiss." + this.name, this.onBroadcastMessage.bind(this));
        /*
                this.bus.on('kiss', function (e, data) {
                    console.error(e, data)
                });
        */
        try {
            this.load();
        } catch (e) {
            this.e("Kiss.load() error ", e);
        }
    }

    onBroadcastMessage(e, data) {

        if (e.type === "kiss" && e.namespace === this.name) {
            this.onMessageReceived(e, data)
        }
    }

    onMessageReceived(e, data) {
        this.l(this.name + " recevieved a message", data, e);
    }


    getPath() {
        let path = "";
        let parent = this;
        while (parent) {
            path = parent.getName() + '>' + path;
            parent = parent.getParent();
        }
        return path;
    }

    v(...arg) {
        if (this.verbose) {
            this.l(arg);
        }
    }

    l(...args) {
        console.log("%c+------------------------------------kiss[" + this.name + "]-------" + this.getPath() + "\t",
            "color:" + this.getColor() + ";",
            this, "\r\n", ...args);
    }

    e(...args) {
        console.error("%c+------------------------------------kiss[" + this.name + "]-------" + this.getPath() + "\t",
            "color:" + this.getColor() + ";",
            this, "\r\n", ...args);
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

    bus() {
        return this.bus;
    }

    onError(url, error) {
        this.e("fetch error " + url, this, error);
    }

    onData(url, data) {
        this.l("data success " + url, this, data);
    }

    onFile(url, text) {
    }


    load() {
        let htmlUri = "views/" + this.name + "/" + this.name + ".html";
        let cssUri = "views/" + this.name + "/" + this.name + ".css";

        this.getContent(
            htmlUri,
            (url, content) => {

                let parentElement;
                if (this.parentKiss) {
                    parentElement = this.parentKiss.getName();
                }

                this.element.innerHTML = content;
                // this.element.style.border = '1px solid ' +  this.getColor() ;

                let kisses = this.element.querySelectorAll('.kiss');
                for (let kiss of kisses) {
                    let kissName = kiss.tagName.toLowerCase();
                    this.l("found a kiss tag named [" + kissName, "] current  :", this.element, "parent:", parentElement);
                    if (this.factory[kissName]) {
                        new this.factory[kissName](this.factory, this, kiss)
                    } else {
                        new Kiss(this.factory, this, kiss);
                    }
                    //new Kiss(this.factory, this, kiss);
                    //FIXME should return a promise, to be sure to laoad all the tree before pretent it is loaded
                }
                try {
                    this.onLoaded();
                    this.l("kiss loaded");
                } catch (e) {
                    this.e(e);
                }


            },
            (url, error) => {
                let rend = this.render();
                if (rend !== undefined && rend !== '') {
                    this.element.innerHTML = rend;
                    this.l("no kiss html file found, so render with render() ", url, error);
                } else {
                    this.e("<" + this.names + ' class=".kiss"> has been found but there is any file nor a content returned by render().' +
                        ' you could makes render() returning html content, or create the folowing file with non empty content ', htmlUri)
                }
            }
        );

        if (!document.getElementById(this.name + "Css")) {

            this.getHead(
                htmlUri,
                (url, content) => {
                    let link = document.createElement('link');
                    link.id = this.name + "Css";
                    link.rel = "stylesheet";
                    // link.type = "text/css";
                    link.href = cssUri;
                    let child = document.head.appendChild(link);
                    this.v("css views loaded : " + this.name, child);
                });

        }
    }

    onLoaded() {

    }

    render() {
        return '<div>extends Kiss and implement render() or create a file</div>'
    }


    getColor() {
        if (!this.color) {
            this.color = global.getNextColor();
        }
        return this.color;
    }
}