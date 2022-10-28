import Kiss from "../../modules/kiss.js"


window.onload = () => {

    console.log("------------------------------------Load KISS-----------------------------------------------------------------s")


    let kiss = new Kiss();
    kiss.configureBasePath("../samples/dashboard/")
    kiss.load().then( result => {
        console.log("Kiss started", result);
    }).catch(  err  =>  {
        console.error("Kiss not started ", err);
    });


}

