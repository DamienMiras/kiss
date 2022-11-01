import Peace from "./peace.js";
import Configuration from "./configuration.js";
import Bus from "./bus.js";
import {isNotEmpty} from "./objectUtil.js";
import {deb, err, info, log, warn} from "./log.js";


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
                if (mutation.type === "childList") {
                    let kissess = mutation.target.querySelectorAll(".kiss");
                    if (isNotEmpty(kissess)) {

                        info(this)("\r\n\r\n\r\n\r\n----mutation " + mutation.type, "\r\n\t\tmutation", mutation, "\r\n\t\tnodes", mutation.addedNodes);
                        for (const node of mutation.addedNodes) {
                            log(this)("---------node :" + node, node);
                        }
                        info(this)("----Mutation for target " + mutation.target, mutation.target, "\r\n\t\tFOUND kisses : " + kissess, kissess);

                        kissess.forEach(kissEl => {

                                if (!Bus.isRegistred(kissEl.tagName, kissEl.id)) {
                                    this.#loadOne(kissEl).then(result => {
                                        log(this)("loaded subtree of: ", kissEl.tagName, result);

                                        this.#loadJsClass(kissEl).then(result => {
                                            log(this)("loaded js class: ", kissEl.tagName, result);
                                        })


                                    }).catch(e => {
                                        err(this)("subtree loading failed", e);
                                    });
                                } else {
                                    warn(this)("already registed", kissEl.tagName)
                                }
                            }
                        );
                    }

                }


            }
        }).observe(document.body, {childList: true, subtree: true});
    }


    #loadAll(kissEl) {

        let kissessElements = kissEl.querySelectorAll('.kiss');
        for (let kissEl of kissessElements) {
            //TODO promise all
            this.#loadOne(kissEl);
        }
        return Promise.resolve("success");

    }

    #loadOne(kissEl) {
        log(this)("found a kiss tag named [" + kissEl.tagName, "] current  :");
        //css are not mandatory and can fail without issues so no callback for this
        this.#loadCss(kissEl);
        return this.#loadHtml(kissEl);
    }

    #loadHtml(kissEl) {
        let kissName = kissEl.tagName.toLowerCase();
        let htmlUri = Configuration.getViewPath() + kissName + "/" + kissName + ".html";
        return this.getContent(
            htmlUri,
            (url, content) => {
                kissEl.innerHTML = content;
                return Promise.resolve(true);

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
                        err(this)("load js class failed for " + kissName, e);
                        return Promise.reject("load js class failed for " + kissName + e);
                    });
            }
        ).catch(e => {
            err(this)("error while loading kiss element ", kissName, e);
            return Promise.reject("error while loading kiss element " + kissName + e);
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
                //TODO replace "this" by real parent
                let kissView = new obj.default(this, kissEl);
                Bus.register(kissView);
                try {
                    if (kissView.hasMethod("load")) {
                        //
                        let promise = kissView.load();
                        if (promise && typeof promise === 'object' && typeof promise.then === 'function') {
                            promise
                                .then(result => {
                                    log(this)("import loaded and class instanciated  ", kissName, result);
                                    return result;
                                })
                                .catch(e => {
                                    err(this)("instanciation error ", kissName, e);
                                    return Promise.reject("instanciation error " + kissName);
                                });
                        } else {
                            return Promise.resolve(true);
                        }
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