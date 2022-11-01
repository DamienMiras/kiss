Object.prototype.hasMethod = function (methodName) {
    return ((typeof this[methodName]) == "function");
};
let isNotEmpty = function (value) {
    if (value === null || value === undefined) {
        return false;
    }
    if ((typeof value === 'string' || value instanceof String) && value.length === 0) {
        return false;
    }

    if (Array.isArray(value) && value.length === 0) {
        return false;
    }
    if (value.hasMethod("length") && value.length() === 0) {
        return false;
    }
    if (value.hasOwnProperty("length") && value.length === 0) {
        return false;
    }
    if (value.hasMethod("size") && value.size() === 0) {
        return false;
    }
    if (value.hasMethod("entries") && value.entries().length === 0) {
        return false;
    }
    if (value.length === 0) {
        return false;
    }
    return true;
}
let isObject = function (value) {
    return typeof value === 'object' &&
        !Array.isArray(value) &&
        value !== null
}
let ObjectUtil = function () {
}
export {isNotEmpty, ObjectUtil, isObject};
