//let bus = $("app");
import Peace from './peace.js';
import ColorUtil from "./colorUtil.js";


let colors = new ColorUtil();
export default class Kiss extends Peace {
    constructor(parentKiss, element) {
        super();

        this.basePath= "";
        if(!window.context  ||  !window.context.kiss) {
            window.context = {
                kiss: this,
                basePath : ""
            }
        }


        let apps =  document.getElementsByTagName("app");
        if(apps.length > 1) {
            throw "Only on app tag is allowed per htl document"
        }
        if(apps.length  === 0) {
            throw "any tag found please create one like that <app> this should no be shown</app>";
        }
        let app = apps[0];
        //attach the main app element to the eventbus
        this.bus = app;
        this.bus.addEventListener("kiss." + this.name, this.onBroadcastMessage.bind(this));

        if(!parentKiss) {
            parentKiss = null;
        }
        this.parentKiss = parentKiss;

        if (!element) {
            //the bus
            this.element = app;
        } else {
            this.element = element;
        }
        this.name = this.element.tagName.toLowerCase();




        //TODO set as colors, to get it from the console
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
        return Promise.reject("fetch error " + url);
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

    configureBasePath(basePath) {
        window.context.basePath = basePath

    }
    getBasePath() {
        return    window.context.basePath;
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
                let modulePath =  this.getBasePath()+"views/" + kissName + "/" + kissName + ".js";
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
                                    return Promise.reject("load error "+kissName);
                                });

                            } catch (e) {
                                this.e("Kiss.load() error ", e);
                                return Promise.reject("Kiss.load() error "+kissName);
                            }
                        })
                        .catch(err => {
                            this.e("import error " + kissName, err);
                            return Promise.reject("import error " + kissName+ " " +err);
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
            this.color = colors.getNextColor();
        }
        return this.color;
    }

    onBroadcastMessage(e, data) {

        if (e.type === "kiss." + this.name) {
            this.onMessageReceived(e, e.detail);
        }
    }

    onMessageReceived(e, meta) {
        this.l(this.name + " recevieved a message type[" + meta.type + "] from [" + meta.from.getName() + "]", meta, e);
    }

    postMessage(from, to, type, data) {

        this.bus.dispatchEvent(new CustomEvent("kiss." + to, {
                    detail: {
                        type: type,
                        data: data,
                        from: from,
                        to: to
                    }
                }
            )
        );
    }


}