// Full version of `log` that:
//  * Prevents errors on console methods when no console present.
import {isNotEmpty, isObject} from "./objectUtil.js";


let log = function log() {
};
let deb = function deb() {
};
let err = function err() {
};
let warn = function warn() {
};
let info = function info() {
};

class bindConsole {

    color = "rgb(0,152,2)";

    constructor() {

        this.#init(this);
    }

    #init() {
        let method;
        let noop = function () {
        };
        let methods = [
            'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
            'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
            'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
            'timeStamp', 'trace', 'warn'
        ];
        let length = methods.length;
        let console = (window.console = window.console || {});

        while (length--) {
            method = methods[length];
            // Only stub undefined methods.
            if (!console[method]) {
                console[method] = noop;
            }
        }

        if (Function.prototype.bind) {

            let format = function (caller, consoleMethod) {
                let name = "logger";
                let color = "rgb(0, 152, 2)";
                let path = ">";
                if (isNotEmpty(caller)) {
                    name = "logger";
                    if (caller.hasMethod("getColor") && caller.getColor()) {
                        color = caller.getColor();
                    }
                    if (caller.hasMethod("getPath") && caller.getPath()) {
                        path = caller.getPath();
                    }
                    if (caller.hasMethod("getName") && caller.getName()) {
                        name = caller.getName();
                    } else if (isObject(caller)) {
                        name = caller.constructor.name;
                    }
                } else {
                    caller = "anonymous()";
                }
                let colorStyle = "color:" + color + ";";
                let title = "%c+------------------------------------kiss[" + name + "]-------" + path + "\t";
                return Function.prototype.bind.call(consoleMethod, console, title, colorStyle, caller, "\r\n");
            }
            log = function (caller) {
                return format(caller, console.log)
            }
            err = function (caller) {
                return format(caller, console.error)
            }
            warn = function (caller) {
                return format(caller, console.warn)
            }
            info = function (caller) {
                return format(caller, console.info)
            }

        } else {
            //TDOO implments others
            log = function () {
                Function.prototype.apply.call(console.log, console, arguments);
            };
        }
    }

}

let logger = new bindConsole();
export {log, err, warn, deb, info, logger}
export default logger



