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
        this.last = undefined;
        this.first = undefined;
        this.minDate = undefined;
        this.maxDate = undefined;
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
                        height: '60%',
                        resize: {
                            enabled: true
                        }
                    },
                    {
                        title: {
                            text: 'MACD short'
                        },
                        color: "#ffe57f",
                        height: '20%',
                        top: '60%',
                        marker: {
                            enabled: true
                        },
                        grouping: false,
                        resize: {
                            enabled: true
                        }
                    }, {
                        title: {
                            text: 'MACD long'
                        },
                        color: "#ffe57f",
                        height: '15%',
                        top: '80%',
                        marker: {
                            enabled: true
                        },
                        grouping: false,
                        resize: {
                            enabled: true
                        }
                    }
                    , {
                        title: {
                            text: 'Volume'
                        },
                        color: "#ffe57f",
                        height: '5%',
                        top: '95%',
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

    convertDateToUTC(date) {
        return new Date(date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            date.getUTCHours(),
            date.getUTCMinutes(),
            date.getUTCSeconds()
        );
    }

    updateChart() {

        //TODO display flags
        //https://www.highcharts.com/docs/stock/flag-series
        //https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/stock/demo/flags-general
        //TODO try dark unica theme
        //TODO default macd https://www.highcharts.com/demo/stock/macd-pivot-points/dark-unica

        let options = {
            chartOptions: {
                xAxis: {
                    min: this.minDate,
                    max: this.maxDate
                },
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
        }
        for (let key in this.serieMap) {
            options.chartOptions.series.push(this.serieMap[key]);
        }
        this.setState(options);
    }

    parseIndicator(pointValue, time, name, group) {
        let color = "#c2ff00";
        let point = [];
        if (name.startsWith("ema")) {
            //ema
            if (this.serieMap[name] === undefined) {
                color = "#c2ff00";
                this.serieData[name] = [];
                this.serieMap[name] = {
                    yAxis: 0,
                    name: name,
                    color: color,
                    data: this.serieData[name]
                }
            } else {
                point.push(time);
                point.push(pointValue);
                this.serieData[name].push(point);
            }
        } else if (name.startsWith("vwap")) {
            //sma
            if (this.serieMap[name] === undefined) {
                color = "#00ffff";
                this.serieData[name] = [];
                this.serieMap[name] = {
                    yAxis: 0,
                    name: name,
                    color: color,
                    data: this.serieData[name]
                }
            } else {
                point.push(time);
                point.push(pointValue);
                this.serieData[name].push(point);
            }
        } else if (name.startsWith("volume")) {
            //sma
            if (this.serieMap[name] === undefined) {
                color = "#79ff37";
                this.serieData[name] = [];
                this.serieMap[name] = {
                    yAxis: 3,
                    name: name,
                    type: 'column',
                    color: color,
                    data: this.serieData[name]
                }
            } else {
                point.push(time);
                point.push(pointValue);
                this.serieData[name].push(point);
            }
        } else if (name.startsWith("sma")) {
            //sma
            if (this.serieMap[name] === undefined) {
                color = "#7b66fc";
                this.serieData[name] = [];
                this.serieMap[name] = {
                    yAxis: 0,
                    name: name,
                    color: color,
                    data: this.serieData[name]
                }
            } else {
                point.push(time);
                point.push(pointValue);
                this.serieData[name].push(point);
            }
        } else if (name.startsWith("macd")) {
            //macd
            if (this.macdGroup[group] === undefined) {
                this.macdGroup[group] = this.axisIndex++;
            }
            if (name.endsWith("histogram")) {
                if (this.serieMap[name] === undefined) {
                    color = "#03ff03";
                    this.serieData[name] = [];
                    this.serieMap[name] = {
                        yAxis: this.axisIndex,
                        name: "macd " + group,
                        color: color,
                        type: 'column',
                        data: this.serieData[name]
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
                    this.serieData[name].push(point);
                }
            } else {
                if (name.endsWith("slow")) {
                    color = "#937d00";
                } else {
                    color = "#a1c4cc";
                }
                if (this.serieMap[name] === undefined) {

                    this.serieData[name] = [];
                    this.serieMap[name] = {
                        yAxis: this.axisIndex,
                        name: name,
                        color: color,
                        data: this.serieData[name]
                    }
                } else {
                    point.push(time);
                    point.push(pointValue);
                    this.serieData[name].push(point);
                }
            }
        }
    }


    parsePointOf(array, metaOhlc) {
        let point = [];
        point.push(array[0]);//always time
        point.push(array[metaOhlc.open.index]);
        point.push(array[metaOhlc.high.index]);
        point.push(array[metaOhlc.low.index]);
        point.push(array[metaOhlc.close.index]);

        return point;
    }


    fetchData() {

        let url = "/api/getOHLC";
        if (this.last !== undefined) {
            url += "?last=" + this.last;
            url += "&limit=5000";
        }

        fetch(url)
            .then(response => response.json())
            .then(result => {


                if (this.last === result.last) {
                    this.last = result.last;

                    if (this.firstBatch === true) {
                        console.log("first batch all done, launch the timer")
                        clearInterval(this.timer);
                        this.timer = setInterval(() => this.fetchData(), 100);
                        this.firstBatch = false;
                    }

                } else {

                    console.log("last result is changed, new data to parse");
                    this.last = result.last;
                    this.first = result.first;
                    let metaIndicator = result.metaIndicator;
                    let metaOhlc = result.metaOhlc;
                    if (result.OHLC !== undefined) {
                        let OHLC = result.OHLC;
                        for (let i = 0; i < OHLC.length; i++) {
                            let time = OHLC[i][0];
                            this.data.push(this.parsePointOf(OHLC[i], metaOhlc));
                            if (metaOhlc.vwap !== undefined) {
                                this.parseIndicator(OHLC[i][metaOhlc.vwap.index], time, "vwap", "ohlc");
                            }
                            if (metaOhlc.volume !== undefined) {
                                this.parseIndicator(OHLC[i][metaOhlc.volume.index], time, "volume", "volume");
                            }

                            if (metaOhlc.indicators !== undefined) {

                                let indicators = OHLC[i][metaOhlc.indicators.index];
                                for (let key in indicators) {
                                    this.parseIndicator(indicators[key], time, metaIndicator[key].name, metaIndicator[key].group);
                                }
                            }
                        }

                    } else {
                        console.error("meta.OHLC undefined");
                    }

                    //
                    //this.maxDate = this.first;
                    if (this.last - this.first < 1000 * 60 * 60 * 8) {
                        this.minDate = this.last - 1000 * 60 * 60 * 8;
                    } else {
                        this.minDate = this.first;
                    }
                    this.maxDate = this.last;
                    console.log("chunk periode : " + new Date(this.first) + " " + new Date(this.last));
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