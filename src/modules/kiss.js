import Peace from "./peace.js";
import Configuration from "./configuration.js";
import Bus from "./bus.js";


export default class Kiss extends Peace {
    constructor(parentKiss, element) {
        super();

        let apps = document.getElementsByTagName("app");
        if (apps.length > 1) {
            throw "Only on app tag is allowed per html document"
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


        //TODO set as colors, to get it from the console
        this.visualDebug = true;
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

                let modulePath = Configuration.getBasePath() + "views/" + kissName + "/" + kissName + ".js";
                promises.push(
                    import(modulePath)
                        .then(obj => {


                            let kissView = new obj.default(this, kiss);
                            try {
                                let result = kissView.load();

                                return result.then(result => {
                                    this.l("import loaded and class instanciated  ", kissName, result);
                                    return result;
                                }).catch(e => {
                                    this.e("instanciation error ", kissName, e);
                                    return Promise.reject("instanciation error " + kissName);
                                });

                            } catch (e) {
                                this.e("Kiss.load() error ", e);
                                return Promise.reject("Kiss.load() error " + kissName);
                            }
                        })
                        .catch(err => {
                            this.e("import error " + kissName, err);
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

                        this.l("kiss childs loaded", values);
                    } catch (e) {
                        this.e("onLoaded error ", e);
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
        this.l("COMPONENT LOADED " + this.name);
        Bus.register(this);
    }

    render() {
        return '<div>extends Kiss and implement render() or create a file</div>'
    }




    onMessageReceived(event) {
        this.l(this.name + " recevieved a message type[" + event.type + "] from [" + event.from.getName() + "]", event);
    }


}