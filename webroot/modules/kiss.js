let bus = $("app");
import Peace from './peace.js';
import Global from "./global.js";

let global = new Global();
export default class Kiss extends Peace {
    constructor(parentKiss, element) {
        super();
        this.bus = bus;
        this.gloabl = global;
        this.parentKiss = parentKiss;
        this.element = element;
        this.name = element.tagName.toLowerCase();
        if (this.element) {
            //this.element.style.border = '1px solid ' +  this.getColor() ;
            this.element.style.color = this.getColor();
        } else {
            this.e("no element yet");
        }

        try {
            this.load();
        } catch (e) {
            this.e("Kiss.load() error ", e);
        }
        this.l("yeah yet another kiss built", this.getPath());

    }

    getPath() {
        let path = ">";
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
        console.log("%c+-------------------------------------------------------------------kiss[" + this.name + "]\t",
            "color:" + this.getColor() + ";",
            this, "\r\n", ...args);
    }

    e(...args) {
        console.error("%c+-------------------------------------------------------------------kiss[" + this.name + "]\t",
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


                let kisses = this.element.querySelectorAll('.kiss');
                for (let kiss of kisses) {
                    let kissName = kiss.tagName.toLowerCase();
                    this.l("found a kiss tag named [" + kissName, "] current  :", this.element, "parent:", parentElement);
                    new Kiss(this, kiss);
                    //FIXME should return a promise, to be sure to laoad all the tree before pretent it is loaded
                }
                this.onLoaded()

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

    onLoaded(element, parent) {


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


    onError(url, error) {
        this.e("fetch error " + url, this, error);
    }

    onData(url, data) {
        this.l("data success " + url, this, data);
    }

    onFile(url, text) {
    }
}