import Peace from "./peace.js";
import Configuration from "./configuration.js";
import Bus from "./bus.js";
import logger from "./log.js";


export default class Kiss extends Peace {
    constructor(parentKiss, element) {
        super();

        let apps = document.getElementsByTagName("app");
        if (apps.length > 1) {
            throw "Only one <app></app> tag is allowed per html document"
        }
        if (apps.length === 0) {
            throw "any tag found please create one like that <app> this should no be shown</app>";
        }
        let app = apps[0];


        if (!parentKiss) {
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
        this.id = this.element.id;


        //TODO set as config, to get it from the console
        this.visualDebug = true;
        logger.setCaller(this);
    }

    getId() {
        return this.id;
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


    getParent() {
        return this.parentKiss;
    }

    getName() {
        return this.name;
    }

    getElement() {
        return this.element;
    }



    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }


    load() {

        let htmlUri = Configuration.getViewPath() + this.name + "/" + this.name + ".html";
        let cssUri = Configuration.getViewPath() + this.name + "/" + this.name + ".css";

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

                let modulePath = Configuration.getBasePath() + "views/" + kissName + "/" + kissName + ".js";
                promises.push(
                    import(modulePath)
                        .then(obj => {


                            let kissView = new obj.default(this, kiss);
                            try {
                                let result = kissView.load();

                                return result.then(result => {
                                    log("import loaded and class instanciated  ", kissName, result);
                                    return result;
                                }).catch(e => {
                                    error("instanciation error ", kissName, e);
                                    return Promise.reject("instanciation error " + kissName);
                                });

                            } catch (e) {
                                err("Kiss.load() error ", e);
                                return Promise.reject("Kiss.load() error " + kissName);
                            }
                        })
                        .catch(err => {
                            err("import error " + kissName, err);
                            return Promise.reject("import error " + kissName + " " + err);
                        })
                );

            }

            if (promises.length > 0) {
                return Promise.all(promises).then(values => {
                    try {
                        this.onLoaded();
                        for (let kiss of values) {
                            if (kiss) {
                                kiss.onLoaded();
                            }
                        }

                        log("kiss childs loaded", values);
                    } catch (e) {
                        err("onLoaded error ", e);
                    }
                    return Promise.resolve(this);
                }).catch(err => {
                    err("loading error " + this.name, err);
                    return Promise.reject();
                });
            } else {
                return Promise.resolve(this);
            }


        }
        this.#loadCss(cssUri);

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
                    log("no kiss html file found, so render with render() ", url, error);
                    return loadAllkisses();

                } else {
                    err("<" + this.names + ' class=".kiss"> has been found but there is any file nor a content returned by render().' +
                        ' you could makes render() returning html content, or create the folowing file with non empty content ', htmlUri);
                    //TODO return load Service;
                    return Promise.resolve(this);
                }
            }
        );
    }

    #loadCss(cssUri) {
        let id = this.name + "Css";
        if (!document.getElementById(id)) {
            new MutationObserver((mutations, observer) => {
                for (const mutation of mutations) {
                    for (const node of mutation.addedNodes) {
                        // Add additional checks here if needed
                        // to identify if the script is the one added by the library
                        if (node.rel === "stylesheet") {
                            node.addEventListener('error', (event) => {
                                node.parentNode.removeChild(node);
                                event.stopPropagation();
                                return true;
                            });
                            // Remove the observer, since its purpose is fulfilled
                            observer.disconnect();
                            return;
                        }
                    }
                }
            }).observe(document.head, {childList: true});

            let link = document.createElement('link');
            link.id = id;
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = cssUri;
            let child = document.head.appendChild(link);
            this.v("css views loaded : " + this.name, child);
        }
    }

    onLoaded() {
        log("COMPONENT LOADED " + this.name);
        Bus.register(this);
    }

    render() {
        return '<div>extends Kiss and implement render() or create a file</div>'
    }


    onMessageReceived(event) {
        log(this.name + " recevieved a message type[" + event.type + "] from [" + event.from.getName() + "]", event);
    }


}