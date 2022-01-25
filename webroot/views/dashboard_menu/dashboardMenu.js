import Kiss from "../../modules/kiss.js";

export default class Dashboardmenu extends Kiss {
    constructor(factory, parentKiss, element) {
        super(factory, parentKiss, element);
        this.last = 0;
        this.first = undefined;


    }

    onLoaded() {
        this.fetchData({
            last: 0,
            limit: 4320
        });

        window.setInterval(function () {
            this.postMessage(this, "dashboard", "test", "I am alive");
        }.bind(this), 1000 * 10);

    }

    fetchData(parameters) {

        let url = "/api/getOHLC?";
        for (const attr in parameters) {
            let value = parameters[attr];
            if (value) {
                url += "&" + attr + "=" + value;
            }
        }


        fetch(url)
            .then(response => response.json())
            .then(result => {
                this.postMessage(this, "dashboard", "ohlc", result);

            })
            .catch((e) => {
                console.log(e);
                clearInterval(this.timer);
                this.timer = setInterval(() => this.fetchData(), 3000);
            });

    }


}