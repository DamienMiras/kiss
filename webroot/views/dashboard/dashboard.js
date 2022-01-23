import Kiss from "../../modules/kiss.js";

import Chart from 'https://code.highcharts.com/es-modules/Core/Chart/Chart.js';
import LineSeries from 'https://code.highcharts.com/es-modules/Series/Line/LineSeries.js';


//TODO front use loadash
export default class Dashboard extends Kiss {
    constructor(factory, parentKiss, element) {
        super(factory, parentKiss, element);

        this.bus.on('com.miras.loader.view.added', function (e, data) {
            console.log('%c YEEEES yes yes ' + this.id + ' received the message', "color :rgb(127,127,0)", data, e);
        });
    }

    onLoaded() {

        LineSeries;
        new Chart('stockChart', {series: [{data: [1, 2, 3]}]});
    }

}


