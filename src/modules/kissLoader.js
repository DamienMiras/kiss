import Peace from "./peace.js";
import Configuration from "./configuration.js";
import Bus from "./bus.js";
import {isNotEmpty} from "./objectUtil.js";
import {deb, err, log, warn} from "./log.js";


export default class kissLoader extends Peace {
    constructor() {
        super();

        this.#observeDomMutation();
        this.#loadAll(document.body).then(result => {
            log(this)("" +
                "                                                                 \r\n" +
                "                                                                 \r\n" +
                "                                                                 \r\n" +
                "                                                                 \r\n" +
                "                                                                 \r\n" +
                "                    d8b         d8,                              \r\n" +
                "                    ?88        `8P                               \r\n" +
                "                     88b                                         \r\n" +
                "                     888  d88'  88b .d888b, .d888b,              \r\n" +
                "                     888bd8P'   88P ?8b,    ?8b,                 \r\n" +
                "                    d88888b    d88    `?8b    `?8b               \r\n" +
                "                   d88' `?88b,d88' `?888P' `?888P'        ...sssssSTARTED\r\n" +
                "                                                                 \r\n" +
                "                                                                 \r\n" +
                "                                                                 \r\n" +
                "                                                                 \r\n"
                , result);
        }).catch(err => {
            console.error("Kiss not started ", err);
        });


    }

    getName() {
        return kissLoader.constructor.name;
    }


    #observeDomMutation() {
        new MutationObserver((mutations, observer) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    log(this)("node : ", node);
                    this.#loadAll(node).then(result => {
                        log(this)("load subtree : ", result);
                    }).catch(e => {
                        log(this)("subtree loading failed", e);
                    });
                }
                log(this)("mutation : ", mutation);
            }
        }).observe(document.body, {attributes: true, childList: true, subtree: true});
    }


    #loadAll(kissEl) {

        let kissessElements = kissEl.querySelectorAll('.kiss');
        for (let kissEl of kissessElements) {
            log(this)("found a kiss tag named [" + kissEl.tagName, "] current  :");
            //css are not mandatory and can fail without issues so no callback for this
            this.#loadCss(kissEl);
            this.#loadHtml(kissEl).catch(e => {
                err(this)("html loading error for " + kissEl.tagName, kissEl);
            })
        }
        return Promise.resolve("success");

    }

    #loadHtml(kissEl) {
        let kissName = kissEl.tagName.toLowerCase();
        let htmlUri = Configuration.getViewPath() + kissName + "/" + kissName + ".html";
        return this.getContent(
            htmlUri,
            (url, content) => {
                kissEl.innerHTML = content;

            },
            (url, error) => {
                warn(this)("no kiss html file found, so render with render() ", kissName, url, error);
                return this.#loadJsClass(kissEl, true)
                    .then(instance => {
                            let rend;
                            if (instance.hasMethod("render")) {
                                rend = instance.render();
                                if (isNotEmpty(rend)) {
                                    kissEl.innerHTML = rend;
                                    log(this)("no kiss html file found, so render with render() ", kissName, url, error);
                                    return Promise.resolve(true);
                                } else {
                                    let e = kissName + 'with  class=".kiss" has been found but there is any file nor a content returned by render().' +
                                        ' you could makes render() returning html content, or create the folowing file with non empty content ' + htmlUri
                                    err(this)(e);
                                    kissEl.innerHTML = '<div class="kiss-error" >' + e + '</div>';
                                    return Promise.reject(e);
                                }

                            } else {
                                let e = kissName + ' class=".kiss" ' +
                                    'has been found but there is any html file neither a  render() methode in the component';
                                warn(this)(e);
                                kissEl.innerHTML = '<div class="kiss-error" >' + e + '</div>';
                                return Promise.reject(e);
                            }

                        }
                    ).catch(e => {
                        err(this)("load js class failed for " + kissName, e)
                    });
            }
        ).catch(e => {
            err(this)("error while loading kiss element ", kissName, e)
        });
    }

    #loadJsClass(kissEl) {
        let kissName = kissEl.tagName.toLowerCase();
        let modulePath = Configuration.getBasePath() + Configuration.getViewPath() + kissName + "/" + kissName + ".js";
        return this.classFactory(modulePath, kissEl, kissName)

    }


    classFactory(modulePath, kissEl, kissName) {
        return import(modulePath)
            .then(obj => {
                let kissView = new obj.default(this, kissEl);
                Bus.register(kissView);
                try {
                    if (kissView.hasMethod("load")) {
                        kissView.load()
                            .then(result => {
                                log(this)("import loaded and class instanciated  ", kissName, result);
                                return result;
                            })
                            .catch(e => {
                                err(this)("instanciation error ", kissName, e);
                                return Promise.reject("instanciation error " + kissName);
                            });
                    }
                    return Promise.resolve(kissView);
                } catch (e) {
                    err(this)("Kiss.load() error ", e);
                    return Promise.reject("Kiss.load() error " + kissName);
                }
            })
            .catch(e => {
                err(this)("import error " + kissName, modulePath, e);
                return Promise.reject("import error " + kissName + " " + e);
            });
    }


    #loadCss(kissEl) {
        let cssUri = Configuration.getViewPath() + kissEl.tagName.toLowerCase() + "/" + kissEl.tagName.toLowerCase() + ".css";
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
            deb(this)("css views loaded : " + this.name, child);
        }
    }


}