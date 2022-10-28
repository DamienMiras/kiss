import Counter from "./counter.js";
import Rgb from "./rgb.js"

export default class Global {
    constructor() {
        this.rgbPos = 0;
        this.whitePos = 1;
        this.black = 0;
        this.white = 255;
        this.cache = {};
        let incr = 50;
        this.yellow = new Counter(incr, 0, 100);
        this.green = new Counter(incr, 0, 100);
        this.lavanda = new Counter(incr, 0, 100);
        this.rainbow = new Counter(2, 0, 100);

    }


    getRainbow() {
        "rgb(194,255,0)";
        "rgb(255,1,204)";
        return this.gradient(new Rgb(194, 255, 0), new Rgb(255, 1, 204), this.rainbow);
    }

    rand(min, max) { // min and max included
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    getYellow() {
        "rgb(252,238,105)";
        "rgb(255,115,0)";
        return this.gradient(new Rgb(252, 238, 105), new Rgb(255, 115, 0), this.yellow);
    }

    getGreen() {
        "rgb(0,93,65)";
        "rgb(143,255,51)";
        return this.gradient(new Rgb(0, 126, 35), new Rgb(143, 255, 51), this.green);
    }

    getLavanda() {
        //TODO make a module for color management with hsl
        //TODO convert color from string to Rgb
        "rgb(102,0,253)";
        "rgb(255,0,242)";
        return this.gradient(new Rgb(102, 0, 253), new Rgb(255, 0, 242), this.lavanda);
    }

    gradient(from, to, counter) {
        let amount = counter.next();
        new Rgb();
        let rgb = new Rgb(
            from.r - Math.floor((from.r - to.r) * amount / 100),
            from.g - Math.floor((from.g - to.g) * amount / 100),
            from.b - Math.floor((from.b - to.b) * amount / 100),
        )
        return rgb.toString();
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