Object.prototype.hasMethod = function (methodName) {
    return ((typeof this[methodName]) == "function");
};
let dummy = function () {
}
export {dummy as ObjectUtil};
