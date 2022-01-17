export default class Watch {
    constructor(name) {
        this.startTime = new Date();
        this.endTime = 0;
        this.elaspedTime = 0;
        this.name = (name === undefined ? "default" : name);
    }


    start() {
        this.startTime = new Date();
        return this;
    };


    stop() {
        this.endTime = new Date();
        this.elaspedTime = this.endTime - this.startTime; //in ms
        return this;
    }

    toMs() {
        return this.elaspedTime;
    }

    toString() {
        let minutes = Math.floor(this.elaspedTime / 60000);
        let seconds = ((this.elaspedTime % 60000) / 1000).toFixed(0);
        let ms = this.elaspedTime % 1000;
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds + "'" + ms + " " + this.elaspedTime;
    }

    log() {

        console.log(this.name + " " + this.toString());
    }
}