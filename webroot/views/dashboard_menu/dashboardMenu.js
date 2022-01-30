import Kiss from "../../modules/kiss.js";

export default class Dashboardmenu extends Kiss {
    constructor(factory, parentKiss, element) {
        super(factory, parentKiss, element);
        this.last = 0;
        this.first = undefined;
        this.firstBatch = true


    }

    onLoaded() {


        /*
        window.setInterval(function () {
          //  this.postMessage(this, "dashboard", "test", "I am alive");
        }.bind(this), 1000 * 10);
        */
    }

    onMessageReceived(e, meta) {
        super.onMessageReceived(e, meta);
        if (meta.from.getName() === "dashboard" && meta.data === "loaded") {
            this.fetchData();
        }
    }

    fetchData(parameters) {

        parameters = {
            last: this.last,
            limit: 4320
        }
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
                if (result.last > this.last) {
                    this.last = result.last;
                    this.postMessage(this, "dashboard", "ohlc", result);
                    if (this.firstBatch === true) {
                        //dont use timer , because there is no garantie that the answer comes in the right order
                        //this.fetchData();
                    }
                } else if (this.last === result.last) {
                    if (this.firstBatch === true) {
                        clearInterval(this.timer);
                        this.timer = setInterval(() => this.fetchData(), 1000 * 60);
                        this.firstBatch = false;
                    }
                }

            })
            .catch((e) => {
                console.log(e);
                clearInterval(this.timer);
                this.timer = setInterval(() => this.fetchData(), 3000);
            });

    }


}