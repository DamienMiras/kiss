// Full version of `log` that:
//  * Prevents errors on console methods when no console present.

class bindConsole {
    caller = null;

    constructor() {
        this.caller = this;
        this.init(this);
    }

    init(caller) {
        var method;
        var noop = function () {
        };
        var methods = [
            'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
            'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
            'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
            'timeStamp', 'trace', 'warn'
        ];
        var length = methods.length;
        var console = (window.console = window.console || {});

        while (length--) {
            method = methods[length];

            // Only stub undefined methods.
            if (!console[method]) {
                console[method] = noop;
            }
        }


        let color = "rgb(143,255,51)";
        let path = ">";
        let name = this.caller.constructor.name;
        if (this.caller.hasMethod("getColor")) {
            color = this.caller.getColor();
        }
        let colorStyle = "color:" + color + ";";
        if (this.caller.hasMethod("getPath")) {
            path = this.caller.getPath();
        }
        if (this.caller.hasMethod("getName")) {
            name = this.caller.getPath();
        }
        let title = "%c+------------------------------------kiss[" + name + "]-------" + path + "\t"
        if (Function.prototype.bind) {

            window.log = Function.prototype.bind.call(console.log, console, title, colorStyle, this.caller, "\r\n");
            window.deb = Function.prototype.bind.call(console.trace, console, title, colorStyle, this.caller, "\r\n");
            window.err = Function.prototype.bind.call(console.error, console, title, colorStyle, this.caller, "\r\n");
        } else {
            window.log = function () {
                Function.prototype.apply.call(console.log, console, arguments);
            };
        }
    }

    setCaller(caller) {
        this.caller = caller;
        this.init(caller);
    }
}

let logger = new bindConsole();
export default logger;




