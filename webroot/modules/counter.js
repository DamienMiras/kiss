export default class Counter {
    constructor(incr, start, end) {

        this.incr = incr;
        this.start = start;
        this.end = end;
        this.current = start;
    }

    next() {
        this.current += this.incr;
        if (this.current >= this.end) {
            this.current = this.start;
        }
        return this.current;
    }
}