import {isNotEmpty} from "./objectUtil.js";
import {err, info, warn} from "./log.js";

export default class Bus {

    static get() {
        if (!window.bus) {
            window.bus = new EventBus();
        }
        return window.bus;
    }

    static register(instance) {
        Bus.get().register(instance);
        return Bus.get();
    }

    static isRegistred(name, id) {
        return Bus.get().isRegistred(name, id);

    }

    static postMessage(from, to, type, data) {
        Bus.get().postMessage(from, to, type, data);
        return Bus.get();
    }
}

class EventBus {
    registry = {};
    deadletterQueue = {};

    constructor() {

    }

    getColor() {
        return "rgb(22,255,0)";
    }

    isRegistred(name, id) {

        let identifier = name;
        if (isNotEmpty(id)) {
            identifier += "_" + id;
        }
        let instances = this.registry[identifier];

        return (isNotEmpty(instances) &&
            instances.find(registred => {
                //FIXME  tag with same name should be instantiate anyway sshould fix mutationObserver
                return registred.constructor.name === name;
            }) !== undefined);
    }

    register(instance) {
        let identifier = this.getIdentifierFromInstance(instance);

        if (!this.registry[identifier]) {
            this.registry[identifier] = [];
        }
        let instances = this.registry[identifier];
        if (instances.find(registred => registred === instance) === undefined) {
            instances.push(instance);
            let events = [];

            if (this.deadletterQueue["*"]) {
                events.concat(this.deadletterQueue["*"]);
            }
            if (this.deadletterQueue[identifier]) {
                events = events.concat(this.deadletterQueue[identifier]);
            }

            if (events.length > 0) {

                events.forEach(event => {
                    this.postMessage(event.from, event.to, event.type, event.data)
                        .then(result => {
                            info(this)("dead letter message finaly posted from " + this.getIdentifierFromInstance(event.from) +
                                " to " + event.to);
                        })
                        .catch(e => {
                            err(this)("dead letter message error when retry initialy  posted from " + this.getIdentifierFromInstance(event.from) +
                                " to " + event.to, e);
                        })
                })

            }

            info(this)("Instance registred on eventBus: " + identifier, instance, this.registry);
        } else {
            warn(this)("try to register instance twice for: " + identifier, instance)
        }
    }

    getIdentifierFromInstance(instance) {
        //TODO test if is registrable
        let identifier = instance.constructor.name;
        if (instance.hasMethod("getName") && isNotEmpty(instance.getName())) {
            identifier = instance.getName();
        }

        if (instance.hasMethod("getId") && instance.getId() && instance.getId() !== "") {
            identifier += "_" + instance.getId();
        }
        return identifier;
    }

    postMessage(from, to, type, data) {

        let event = {
            type: type,
            data: data,
            from: from,
            to: to,
        }
        if (!to || to === "*" || to === "") {
            let keys = Object.keys(this.registry);
            if (keys.length < -1) {
                return Promise.all(keys);
            } else {
                return this.postMessageToOne("*", event);
            }
        }
        return this.postMessageToOne(to, event);

    }

    postMessageToOne(to, event) {
        let destNameInregistry = Object.keys(this.registry).find(key => key === to);


        return new Promise((function (resolve, reject) {
            if (destNameInregistry === undefined) {
                if (this.deadletterQueue[to] === undefined) {
                    this.deadletterQueue[to] = [];
                }
                this.deadletterQueue[to].push(event);
                setTimeout(() => {
                    this.removeDeadLetter(to, event);
                    warn(this)("destination to [" + to + "] for event from [" + event.from.getName() +
                        "] not found  after timeout, event is discard from dead letter queue. " +
                        "the component does not exists or has been removed", event);
                    reject(new Error("destination to [" + to + "] for event from [" + event.from.getName() +
                        "] not found  after timeout, event is discard from dead letter queue. " +
                        "the component does not exists or has been removed"));
                }, 5000);
            } else {
                this.registry[to].forEach(instance => instance.onMessageReceived(event));
                resolve("posted");
            }
        }).bind(this));
    }

    removeDeadLetter(identifier, event) {
        if (this.deadletterQueue[identifier]) {
            let index = this.deadletterQueue[identifier].findIndex(oldEvent => {
                return oldEvent.type === event.type &&
                    oldEvent.data === event.data &&
                    oldEvent.from === event.from &&
                    oldEvent.to === event.to;
            });
            if (index > -1) {
                this.deadletterQueue[identifier].splice(index, 1);
                if (this.deadletterQueue[identifier].length === 0) {
                    delete this.deadletterQueue[identifier];
                }
            }

        }
    }
}