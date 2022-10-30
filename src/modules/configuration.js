import logger from "./log.js";

export default class Configuration {


    static get() {

        if (!window.configuration) {
            window.configuration = new ConfigurationSingleton();
        }
        return window.configuration;
    }

    static getBasePath() {
        return Configuration.get().getBasePath();
    }

    static setBasePath(basePath) {
        Configuration.get().setBasePath(basePath);
        return Configuration.get();
    }

    static getViewPath() {
        return Configuration.get().getViewpath();
    }

    static setServicePath(viewPath) {
        Configuration.get().setServicePath(viewPath);
        return Configuration.get();
    }

    static getServicePath() {
        return Configuration.get().getServicePath();
    }

    static setServicePath(servicePath) {
        Configuration.get().setServicePath(servicePath);
        return Configuration.get();
    }

}

class ConfigurationSingleton {
    #basePath = "";
    #viewPath = "views/";
    #servicePath = "services/";

    constructor() {
        logger.setCaller(this);
    }

    setBasePath(basePath) {

        this.#basePath = basePath;
        return this;
    }

    getBasePath() {

        return this.#basePath;
    }

    setViewPath(viewPath) {
        this.#viewPath = viewPath
        return this;
    }

    getViewpath() {
        return this.#viewPath
    }

    setServicePath(servicePath) {
        this.#servicePath = servicePath
        return this;
    }

    getServicePath() {
        return this.#servicePath
    }

}

