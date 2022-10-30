import ColorUtil from "./colorUtil.js";
import logger from "./log.js";

let colors = new ColorUtil();
export default class Peace {
    verbose = false;

    getVerbose() {
        return this.verbose;
    }

    setVerbose(value) {
        this.verbose = value;
    }

    constructor(name) {
        logger.setCaller(this);
        this.name = name;
    }

    getColor() {
        if (!this.color) {
            this.color = colors.getNextColor();
        }
        return this.color;
    }

    v(...arg) {
        if (this._verbose) {
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

    getPath() {
        if (path) {

            return path;
        }
        return "";
    }


    debounce(func, timeout = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                func.apply(this, args);
            }, timeout);
        };
    }

    getJson(url, onDataCallback, onErrorCallback) {
        fetch(url)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("status " + response.status);
                }
            })
            .then(data => {
                this.onData(url, data);
                if (onDataCallback) {
                    onDataCallback(url, data);
                }
            })
            .catch(error => {

                if (onErrorCallback) {
                    onErrorCallback(url, data);
                } else {
                    this.onError(url, error);
                }
            });
    }

    getContent(url, onDataCallback, onErrorCallback) {
        return fetch(url)
            .then(response => {
                if (response.ok) {
                    this.v(url, response);
                    return response.text();
                } else {
                    throw new Error("status " + response.status);
                }
            })
            .then(data => {
                let result = this.onFile(url, data);
                if (onDataCallback) {
                    return onDataCallback(url, data);
                }
                return result;

            })
            .catch(error => {

                if (onErrorCallback) {
                    return onErrorCallback(url, error);
                } else {
                    return this.onError(url, error)

                }

            });
    }

    getHead(url, onDataCallback, onErrorCallback) {
        fetch(url, {method: 'HEAD'})
            .then(response => {
                if (response.ok) {
                    this.v(url, response);
                    return response.text();
                } else {
                    throw new Error("status not ok 200 but " + response.status);
                }
            })
            .then(data => {
                this.onFile(url, data);
                if (onDataCallback) {
                    onDataCallback(url, data);
                }
            })
            .catch(error => {

                if (onErrorCallback) {
                    onErrorCallback(url, error);
                }
                this.onError(url, error);
            });
    }

    onError(url, error) {
        err("fetch error " + url, this, error);
        return Promise.reject("fetch error " + url);
    }

    onData(url, data) {
        log("data success " + url, this, data);
        return Promise.resolve(data);
    }

    onFile(url, text) {
        return Promise.resolve(text);
    }


}