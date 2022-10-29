/**
 * kiss fancy console with colors
 */
export default class l {

    name = "";
    subtitle = "";
    color = "";

    constructor(name, subtitle, color) {
    }

    l(...args) {
        console.log("%c+------------------------------------kiss[" + this.name + "]-------" + this.getPath() + "\t",
            "color:" + this.getColor() + ";",
            this, "\r\n", ...args);
    }

    t(...args) {
        console.log("%c+------------------------------------kiss[" + this.name + "]-------" + this.getPath() + "\t",
            "color:" + this.getColor() + ";",
            this, "\r\n", ...args);
    }

    e(...args) {
        console.error("%c+------------------------------------kiss[" + this.name + "]-------" + this.getPath() + "\t",
            "color:" + this.getColor() + ";",
            this, "\r\n", ...args);
    }
}