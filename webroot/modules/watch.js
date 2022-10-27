/**
 * there is already a timer for console but dont fits the needs
 */
export default class Watch {
    constructor(name, color) {
        if (color === undefined) {
            color = "#ffffff";
        }
        this.color = color;
        this.startTime = new Date();
        this.endTime = 0;
        this.elaspedTime = 0;
        this.name = (name === undefined ? "default" : name);
        this.totalTimeSpent = 0;
        this.isRunning = false;
        this.runningcount = 0;
    }

    restart() {

        this.start(true);
    }

    start(force) {
        if (this.isRunning === false || force === true) {
            this.startTime = new Date();
            this.isRunning = true;
            if (force === true) {
                console.log(this.name + " restarted");
            }
        } else {
            console.warn(this.name + " already started");
        }
        return this;
    };


    stop() {
        if (this.isRunning === true) {
            this.endTime = new Date();
            this.elaspedTime = this.endTime - this.startTime;
            this.totalTimeSpent += this.elaspedTime;
            this.runningcount++;
            this.isRunning = false;
        }
        return this;
    }

    resetTotal() {
        this.totalTimeSpent = 0;
    }

    toMs() {
        return this.elaspedTime;
    }


    convertMsToMinSecMs(milliseconds) {
        let minutes = Math.floor(milliseconds / 60000);
        let seconds = ((milliseconds % 60000) / 1000).toFixed(0);
        let ms = milliseconds % 1000;
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds + "'" + ms + " ";
    }

    toString() {
        return this.convertMsToMinSecMs(this.elaspedTime) + " " + this.elaspedTime + "ms | " +
            "total:" + this.convertMsToMinSecMs(this.totalTimeSpent);
    }

    log() {
        console.log("%c" + this.name + " " + this.toString(), "background-color: #000000; width:100%; color:" + this.color + ";");
    }
}