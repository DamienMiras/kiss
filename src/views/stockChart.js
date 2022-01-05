import React, {Component} from 'react';


import HighchartsReact from 'highcharts-react-official';
import Highcharts from "highcharts/highstock";
import HighchartsHeikinashi from "highcharts/modules/heikinashi";
import Indicators from "highcharts/indicators/indicators-all.js";
import DragPanes from "highcharts/modules/drag-panes.js";
import AnnotationsAdvanced from "highcharts/modules/annotations-advanced.js";
import PriceIndicator from "highcharts/modules/price-indicator.js";
import FullScreen from "highcharts/modules/full-screen.js";
import StockTools from "highcharts/modules/stock-tools.js";

StockTools(Highcharts);
Indicators(Highcharts);
DragPanes(Highcharts);
AnnotationsAdvanced(Highcharts);
PriceIndicator(Highcharts);
FullScreen(Highcharts);
HighchartsHeikinashi(Highcharts);

class StockChart extends Component {

    constructor(props) {
        super(props);

        this.axisIndex = 0;
        this.data = [];
        this.macdGroup = {};

        this.serieMap = {};
        this.serieData = {};
        this.options = {
            chartOptions: {
                series: [
                    {
                        yAxis: 0,
                        type: 'heikinashi',
                        name: 'Heikin Ashi',
                        data: this.data,
                        id: 'hikinashiId'
                    }
                ]
            }
        };

        this.state = {
            chartOptions: {
                navigator: {},
                chart: {
                    height: 1500,
                },
                title: {
                    text: 'kraken XBTUSD 1m'
                },
                plotOptions: {
                    series: {
                        turboThreshold: 99999,
                        pointPadding: -0.1
                    }
                },
                yAxis: [
                    {
                        title: {
                            text: 'OHLC'
                        },
                        height: '80%',
                        resize: {
                            enabled: true
                        }
                    },
                    {
                        title: {
                            text: 'MACD 1'
                        },
                        color: "#ffe57f",
                        height: '10%',
                        top: '80%',
                        marker: {
                            enabled: true
                        },
                        grouping: false,
                        resize: {
                            enabled: true
                        }
                    }, {
                        title: {
                            text: 'MACD 2'
                        },
                        color: "#ffe57f",
                        height: '10%',
                        top: '90%',
                        marker: {
                            enabled: true
                        },
                        grouping: false,
                        resize: {
                            enabled: true
                        }
                    }
                ]
            }
        };

    }

    updateChart(serie) {

        //TODO display flags
        //https://www.highcharts.com/docs/stock/flag-series
        //https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/stock/demo/flags-general
        //TODO try dark unica theme
        //TODO default macd https://www.highcharts.com/demo/stock/macd-pivot-points/dark-unica

        let options = {
            chartOptions: {
                series: [
                    {
                        yAxis: 0,
                        type: 'heikinashi',
                        name: 'Heikin Ashi',
                        data: this.data,
                        id: 'hikinashiId'
                    },
                    this.serieMap["m260c120h90"],
                    this.serieMap["m260c120_90"],
                    this.serieMap["m260c120s90"],
                    this.serieMap["m26c12h9"],
                    this.serieMap["m26c12_9"],
                    this.serieMap["m26c12s9"],
                    this.serieMap["e200c"],
                    this.serieMap["e1000c"],
                    this.serieMap["e5000c"]

                ]
            }
        };
        this.setState(options);
    }



    parseIndicator(key, pointValue, time) {
        let color = "#c2ff00";
        let name = key;
        let point = [];
        if (key.startsWith("e")) {
            //ema
            if (this.serieMap[key] === undefined) {
                name = "ema" + key.substr(1, key.length - 1) + this.getPriceType(key.charAt(key.length - 1));
                color = "#c2ff00";
                this.serieData[key] = [];
                this.serieMap[key] = {
                    yAxis: 0,
                    name: name,
                    color: color,
                    data: this.serieData[key]
                }
            } else {
                point.push(time);
                point.push(pointValue);
                this.serieData[key].push(point);
            }
        } else if (key.startsWith("s")) {
            //sma
            if (this.serieMap[key] === undefined) {
                name = "sma" + key.substr(1, key.length - 1) + this.getPriceType(key.charAt(key.length - 1));
                color = "#7b66fc";
                this.serieData[key] = [];
                this.serieMap[key] = {
                    yAxis: 0,
                    name: name,
                    color: color,
                    data: this.serieData[key]
                }
            } else {
                point.push(time);
                point.push(pointValue);
                this.serieData[key].push(point);
            }
        } else if (key.startsWith("m")) {
            //macd
            let macdGroupKey = key.replace(/[A-Za-z]/g, ' ').replace('_', ' ') + this.getPriceType(key.charAt(1))
            if (this.macdGroup[macdGroupKey] === undefined) {
                this.macdGroup[macdGroupKey] = this.axisIndex++;
            }
            if (key.replace(/[0-9]/g, '').charAt(2) === "h") {
                if (this.serieMap[key] === undefined) {
                    color = "#03ff03";
                    this.serieData[key] = [];
                    this.serieMap[key] = {
                        yAxis: this.axisIndex,
                        name: "macd " + macdGroupKey,
                        color: color,
                        type: 'column',
                        data: this.serieData[key]
                    }
                } else {
                    let color = "#00ff00";
                    if (pointValue < 0) {
                        color = "#fd007f";
                    }
                    point = {
                        x: time,
                        y: pointValue,
                        color: color
                    }
                    this.serieData[key].push(point);
                }
            } else {
                if (key.replace(/[0-9]/g, '').charAt(2) === "_") {
                    name = "macd " + macdGroupKey + " normalised";
                    color = "#937d00";
                } else {
                    name = "macd " + macdGroupKey + " signal";
                    color = "#00c1ee";
                }
                if (this.serieMap[key] === undefined) {

                    this.serieData[key] = [];
                    this.serieMap[key] = {
                        yAxis: this.axisIndex,
                        name: name,
                        color: color,
                        data: this.serieData[key]
                    }
                } else {
                    point.push(time);
                    point.push(pointValue);
                    this.serieData[key].push(point);
                }
            }
        }
    }


    parsePointOf(array, from, to) {
        let point = [];
        if (to > array.length) {
            to = array.length;
        }
        for (let i = from; i <= to; i++) {
            point.push(array[i]);
        }
        return point;
    }

    getPriceType(char) {
        let name = "";
        if (char === "c") {
            name += " close";
        }
        if (char === "o") {
            name += " open";
        }
        if (char === "h") {
            name += " high";
        }
        if (char === "l") {
            name += " low";
        }
        return name;
    }


    fetchData() {

        let url = "/api/getOHLC";
        if (this.last !== undefined) {
            url += "?last=" + this.last;
            url += "&limit=50000";
        }

        fetch(url)
            .then(response => response.json())
            .then(result => {

                if (this.last === result.last) {
                    this.last = result.last;

                    if (this.firstBatch === true) {
                        console.log("first batch all done, launch the timer")
                        clearInterval(this.timer);

                        this.timer = setInterval(() => this.fetchData(), 1000);

                    }
                    this.firstBatch = false;
                } else {


                    this.last = result.last;
                    if (result.OHLC !== undefined) {
                        let OHLC = result.OHLC;
                        for (let i = 0; i < OHLC.length; i++) {

                            this.data.push(this.parsePointOf(OHLC[i], 0, 4));
                            if (OHLC[i].length === 6) {
                                let time = OHLC[i][0];
                                let indicators = OHLC[i][5];
                                for (let key in indicators) {
                                    this.parseIndicator(key, indicators[key], time);
                                }
                            }
                        }

                    } else {
                        console.error("meta.OHLC undefined");
                    }
                    /*

                    26m12c9
                    26m12c9h
                    26m12c9s
                    e12c
                    e200c
                    e26c
                    s200c
                     */


                    this.updateChart();
                    if (this.synchronizedYet === false && this.firstBatch === false) {
                        //pace down every minute
                        console.log("request synchronized pacedown the timer")
                        clearInterval(this.timer);
                        this.timer = setInterval(() => this.fetchData(), 1000 * 60);
                        this.synchronizedYet = true;
                    }

                    if (this.firstBatch === true) {
                        //dont use timer , because there is no garantie that the answer comes in the right order
                        this.fetchData();
                    }

                }


            })
            .catch((e) => {
                console.log(e);
                clearInterval(this.timer);
                this.timer = setInterval(() => this.fetchData(), 3000);
            });
    }

    componentDidMount() {
        this.synchronizedYet = false;
        this.last = 0;
        this.firstBatch = true;
        console.log("componentDiMount")
        this.fetchData();


    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    render() {
        //const {chartOptions} = this.state;

        return (
            <div className='stockChart'>

                <HighchartsReact
                    allowChartUpdate={true}
                    options={this.state.chartOptions}
                    immutable={false}
                    highcharts={Highcharts}
                    constructorType={"stockChart"}
                />
            </div>

        )
    }
}

export default StockChart