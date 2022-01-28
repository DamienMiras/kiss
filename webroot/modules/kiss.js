let bus = $("app");
import Peace from './peace.js';
import Global from "./global.js";


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
                "}");
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

        this.bus.on("kiss." + this.name, this.onBroadcastMessage.bind(this));

        try {
            this.load();
        } catch (e) {
            this.e("Kiss.load() error ", e);
        }
        //TODO set as global, to get it from the console
        this.visualDebug = false;
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

        let loadAllkisses = () => {
            if (this.visualDebug) {
                this.element.style.color = this.getColor();
                this.element.style.border = '1px dashed ' + this.getColor();
                this.element.style.boxShadow = 'inset 0px 0px 6px 0px ' + this.getColor();
                this.element.style.display = "inline-grid";
                this.element.style.boxSizing = "border-box";
                this.element.style.height = "auto";
            }

            let parentElement;
            if (this.parentKiss) {
                parentElement = this.parentKiss.getName();
            }
            let kisses = this.element.querySelectorAll('.kiss');
            for (let kiss of kisses) {
                let kissName = kiss.tagName.toLowerCase();
                this.v("found a kiss tag named [" + kissName, "] current  :", this.element, "parent:", parentElement);

                if (this.factory[kissName]) {
                    new this.factory[kissName](this.factory, this, kiss);
                } else {
                    new Kiss(this.factory, this, kiss);
                }
                //FIXME should return a promise, to be sure to laoad all the tree before pretent it is loaded
                //use promise all
            }
            try {
                this.onLoaded();
                this.l("kiss loaded");
            } catch (e) {
                this.e(e);
            }

        }

        this.getContent(
            htmlUri,
            (url, content) => {
                this.element.innerHTML = content;
                return loadAllkisses();
            },
            (url, error) => {
                let rend = this.render();
                if (rend !== undefined && rend !== '') {
                    this.element.innerHTML = rend;
                    this.l("no kiss html file found, so render with render() ", url, error);
                    return loadAllkisses();

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

    onBroadcastMessage(e, data) {

        if (e.type === "kiss" && e.namespace === this.name) {
            this.onMessageReceived(e, data)
        }
    }

    onMessageReceived(e, meta) {
        this.l(this.name + " recevieved a message type[" + meta.type + "] from " + meta.from.getName(), meta.data, e);
    }

    postMessage(from, to, type, data) {

        this.bus.trigger("kiss." + to, {
            type: type,
            data: data,
            from: from
        });
    }

}