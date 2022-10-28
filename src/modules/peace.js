export default class Peace {
    constructor(name) {

        this.name = name;
    }


    debounce(func, timeout = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                func.apply(this, args);
            }, timeout);
        };
    }

    getJson(url, onDataCallback, onErrorCallback) {
        fetch(url)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("status " + response.status);
                }
            })
            .then(data => {
                this.onData(url, data);
                if (onDataCallback) {
                    onDataCallback(url, data);
                }
            })
            .catch(error => {

                if (onErrorCallback) {
                    onErrorCallback(url, data);
                } else {
                    this.onError(url, error);
                }
            });
    }

    getContent(url, onDataCallback, onErrorCallback) {
        return fetch(url)
            .then(response => {
                if (response.ok) {
                    this.v(url, response);
                    return response.text();
                } else {
                    throw new Error("status " + response.status);
                }
            })
            .then(data => {
                let result = this.onFile(url, data);
                if (onDataCallback) {
                    return onDataCallback(url, data);
                }
                return result;

            })
            .catch(error => {
                let err = this.onError(url, error).catch(err => {
                        return Promise.reject(err);
                    }
                );
                if (onErrorCallback) {
                    return onErrorCallback(url, error);
                } else {
                    return err;
                }

            });
    }

    getHead(url, onDataCallback, onErrorCallback) {
        fetch(url, {method: 'HEAD'})
            .then(response => {
                if (response.ok) {
                    this.v(url, response);
                    return response.text();
                } else {
                    throw new Error("status not ok but " + response.status);
                }
            })
            .then(data => {
                this.onFile(url, data);
                if (onDataCallback) {
                    onDataCallback(url, data);
                }
            })
            .catch(error => {
                this.onError(url, error);
                if (onErrorCallback) {
                    onErrorCallback(url, error);
                } else {
                    this.onError(url, error);
                }
            });
    }

}