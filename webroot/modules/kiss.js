let bus = $("app");
import Peace from './peace.js';
import Global from "./global.js";


let global = new Global();
export default class Kiss extends Peace {
    constructor(parentKiss, element) {
        super();


        this.bus = bus;
        this.global = global;
        this.parentKiss = parentKiss;

        if (!element) {
            this.element = document.getElementsByTagName("app")[0];
        } else {
            this.element = element;
        }
        this.name = this.element.tagName.toLowerCase();

        this.bus.on("kiss." + this.name, this.onBroadcastMessage.bind(this));


        //TODO set as global, to get it from the console
        this.visualDebug = true;
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
        return Promise.reject();
    }

    onData(url, data) {
        this.l("data success " + url, this, data);
        return Promise.resolve(data);
    }

    onFile(url, text) {
        return Promise.resolve(text);
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
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
            let promises = [];
            for (let kiss of kisses) {
                let kissName = kiss.tagName.toLowerCase();
                this.v("found a kiss tag named [" + kissName, "] current  :", this.element, "parent:", parentElement);


                let className = this.capitalizeFirstLetter(kissName);
                let modulePath = "../views/" + kissName + "/" + kissName + ".js";
                promises.push(
                    import(modulePath)
                        .then(obj => {
                            this.l("import " + className, obj);

                            let kissView = new obj.default(this, kiss);
                            try {
                                let result = kissView.load();

                                return result.then(result => {
                                    this.l("load ok  ", kissName, result);
                                    return result;
                                }).catch(e => {
                                    this.e("load error ", kissName, e);
                                    return Promise.reject();
                                });

                            } catch (e) {
                                this.e("Kiss.load() error ", e);
                                return Promise.reject();
                            }

                        })
                        .catch(err => {
                            this.e("import error " + className, err);
                            return Promise.reject();
                        })
                );

            }
            if (promises.length > 0) {
                return Promise.all(promises).then(values => {
                    try {
                        for (let kiss of values) {
                            if (kiss) {
                                kiss.onLoaded();
                            }
                        }
                        this.onLoaded();
                        this.l("kiss childs loaded", values);
                    } catch (e) {
                        this.e(e);
                    }
                    return Promise.resolve(this);
                }).catch(err => {
                    this.e("loading error " + this.name, err);
                    return Promise.reject();
                });
            } else {
                return Promise.resolve(this);
            }


        }
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

        return this.getContent(
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
                        ' you could makes render() returning html content, or create the folowing file with non empty content ', htmlUri);
                    //TODO return load Service;
                    return Promise.resolve(this);
                }
            }
        );


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
        this.l(this.name + " recevieved a message type[" + meta.type + "] from [" + meta.from.getName() + "]", meta, e);
    }

    postMessage(from, to, type, data) {

        this.bus.trigger("kiss." + to, {
            type: type,
            data: data,
            from: from,
            to: to
        });
    }

}