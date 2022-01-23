export default class Global {
    constructor() {
        this.rgbPos = 0;
        this.whitePos = 1;
        this.black = 0;
        this.white = 255;
        this.cache = {};
    }

    getNextColor() {
        function rand(min, max) { // min and max included
            return Math.floor(Math.random() * (max - min + 1) + min);
        }

        let rgb = [];
        for (let i = 0; i <= 2; i++) {
            let col = rand(127, 255);
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