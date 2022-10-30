/**
 * wip this is not a singleton dont use me
 */
export default class Singleton {


    static getFoo() {
        return instance.getFoo()
    }

    static setFoo(foo) {
        instance.setFoo(foo);
        return instance;
    }
}

class Impl {
    #foo = null;

    constructor() {
    }


    setFoo(foo) {
        this.#foo = foo;
    }

    getFoo() {
        return this.#foo;
    }
}

const instance = new Impl();