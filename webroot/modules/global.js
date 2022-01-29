import Counter from "./counter.js";

export default class Global {
    constructor() {
        this.rgbPos = 0;
        this.whitePos = 1;
        this.black = 0;
        this.white = 255;
        this.cache = {};
        let incr = 5;
        this.yello = new Counter(incr, 150, 255);
        this.green = new Counter(incr, 125, 255);
        this.lavanda = new Counter(incr, 0, 100);

    }


    rand(min, max) { // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    getYello() {
        let color = this.yello.next();
        return "rgb(" + color + "," + color + "," + 10 + ")";
    }

    getGreen() {
        let color = this.green.next();
        return "rgb(" + 0 + "," + color + "," + 0 + ")";
    }

    getLavanda() {
        //TODO make a module for color management with hsl
        //get gradient
        let ff
        ff = "rgb(191,148,255)";
        ff = "rgb(117,0,255)";

        let r = 191 - Math.floor((191 - 117) * this.lavanda.next() / 100);
        let g = 148 - Math.floor((148 - 0) * this.lavanda.next() / 100);
        let b = 255;
        return "rgb(" + r + "," + g + "," + b + ")";
    }

    getNextColor() {


        let rgb = [];
        for (let i = 0; i <= 2; i++) {
            let col = this.rand(127, 255);
            rgb.push(col);
        }

        if (this.rgbPos > 2) {
            this.rgbPos = 0;
        }
        rgb[this.rgbPos] = this.black;
        this.rgbPos++;
        if (this.whitePos > 2) {
            this.whitePos = this.white;
        }
        rgb[this.whitePos] = 255;
        this.whitePos++;
        //shuffle
        //rgb = rgb.sort(() => Math.random() - 0.5);
        return "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
    }

    put(k, content) {
        if (this.cache[k] !== undefined) {
            this.cache[k] = content;
        }
    }

    getCached(k) {
        if (this.cache[k] !== undefined) {
            return this.cache[k];
        } else {
            return null;
        }
    }
}