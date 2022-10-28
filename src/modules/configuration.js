export default class Configuration {



    static get() {


        if (!window.configuration) {
            window.configuration=  {
                basePath : ""
            }
        }
        return window.configuration;
    }





    static getBasePath() {
        return Configuration.get().basePath;
    }


    static setBasePath(basePath) {
        Configuration.get().basePath = basePath;
        return  Configuration.get();
    }




}