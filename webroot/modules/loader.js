let bus = $("app");
export default class Loader {
    //TODO 1 replace id view by tag
    //TODO make a factory for components
    //TODO manage component without html files
    //TODO 2 makes the app be also a kiss
    //TODO 3 make no rendering component that also load
    //TODO make templating (use google lib or other)
    constructor() {

        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                // console.log("mutation", mutation);
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    // element added to DOM
                    var hasClass = [].some.call(mutation.addedNodes, function (el) {
                        if (el !== undefined && el.classList !== undefined) {

                            let contains = el.classList.contains('view');
                            console.log("contains ", contains, el);
                            if (contains == true) {
                                console.log("fire event", el);
                                bus.trigger('view.added', {view: el});
                            }
                            return contains;

                        }

                    });
                    if (hasClass) {
                        // element has class `MyClass`
                        console.log('element "view" added');
                    }
                }
            });
        });

        var config = {
            attributes: true,
            // childList: true,
            characterData: true,
            subtree: true
        };
        observer.observe(document.body, config);
    }

    load(element, instance, onloaded, onFailed, parent) {
        let htmlUri = "../views/" + element + "/" + element + ".html";

        //take the id of the #element then load file in it
        $("#" + element).load(htmlUri,
            function (responseText, textStatus, req) {
                if (textStatus == "error") {
                    if (onFailed) {
                        console.error("html load fails : " + element)
                        onFailed();
                    }
                } else {

                    if (instance) {
                        instance.onLoaded($("#" + element)[0], parent);
                    } else {
                        console.info('it is fine to only load html, but instance of module could be provided: "loader.load("navigation",  new Navigation());" ');
                    }
                    if (onloaded) {
                        onloaded();
                    }
                    bus.trigger('com.miras.loader.view.added', {

                        view: element,
                        el: $("#" + element)[0]

                    });
                    console.log("html views loaded : " + element);
                }
            }
        );

        if (!document.getElementById(element + "link")) {
            let cssUri = "views/" + element + "/" + element + ".css";
            fetch(cssUri).then(response => {
                    if (response.ok) {
                        let link = document.createElement('link');
                        link.id = element + "link";
                        link.rel = "stylesheet";
                        // link.type = "text/css";
                        link.href = cssUri;
                        let child = document.head.appendChild(link);
                        console.log("css views loaded : " + element, child);
                    }
                }
            ).catch(function (err) {
                //
            });
        }
    }
}



