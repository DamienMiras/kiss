import Kiss from "../../modules/kiss.js";

import Chart from 'https://code.highcharts.com/es-modules/Core/Chart/Chart.js';

//TODO front use loadash
export default class Dashboard extends Kiss {
    constructor() {
        super();

        this.bus.on('com.miras.loader.view.added', function (e, data) {
            console.log('%c YEEEES yes yes ' + this.id + ' received the message', "color :rgb(127,127,0)", data, e);
        });
    }

    onLoaded(element) {
        super.onLoaded(element);

        // Example to create a simple line chart in a div#container:
        new Chart('stockChart', {series: [{data: [1, 2, 3]}]});

    }

    /*
    render() {

            return '<h3>HTML string</h3>';
    }*/

}


