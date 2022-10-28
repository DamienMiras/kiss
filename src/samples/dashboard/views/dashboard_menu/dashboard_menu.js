import Kiss from "../../../../modules/kiss.js";

export default class Dashboard_menu extends Kiss {
    constructor(parentKiss, element) {
        super(parentKiss, element);
        this.last = 0;
        this.first = undefined;
        this.firstBatch = true
        this.stop = false;


    }


    onLoaded() {
        super.onLoaded();

        document.getElementById("stop").onclick = function () {
            this.postMessage(this, "dashboard", "stop", {});
            this.stopLoading();
        }.bind(this);
        document.getElementById("day").onclick = function () {
            this.postMessage(this, "dashboard", "rangeSelect", {range: 24});
        }.bind(this);
        document.getElementById("hour").onclick = function () {
            this.postMessage(this, "dashboard", "rangeSelect", {range: 4});
        }.bind(this);
        document.getElementById("2hour").onclick = function () {
            this.postMessage(this, "dashboard", "rangeSelect", {range: 2});
        }.bind(this);

    }


    stopLoading() {
        console.log("stopLoading");
        this.stop = true;
    }


    onMessageReceived(e, meta) {
        super.onMessageReceived(e, meta);
        if (meta.to === this.getName() && meta.data === "loaded") {
            this.fetchData();
        }
    }

    fetchData(parameters) {

        if (this.stop === true) {
            console.info("Stop asked stop timer", this.stop)
            clearInterval(this.timer);
            return;
        }
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
                if (this.stop === true) {
                    return;
                }
                console.info("stp", this.stop)
                if (result.last > this.last) {
                    this.last = result.last;
                    this.postMessage(this, "dashboard", "ohlc", result);
                    if (this.firstBatch === true) {
                        //dont use timer , because there is no garantie that the answer comes in the right order
                        if (this.stop === false) {
                            this.fetchData();
                        } else {
                            console.info("Stop asked stop timer", this.stop)
                            clearInterval(this.timer);
                        }
                    }
                } else if (this.last === result.last) {
                    if (this.firstBatch === true) {
                        clearInterval(this.timer);
                        this.timer = setInterval(() => this.fetchData(), 1000);
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