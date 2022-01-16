import React, {Component} from 'react';


import HighchartsReact from 'highcharts-react-official';
import Highcharts from "highcharts/highstock.src.js";
import HighchartsHeikinashi from "highcharts/modules/heikinashi.src";
import Indicators from "highcharts/indicators/indicators-all.js";
import DragPanes from "highcharts/modules/drag-panes.js";
import AnnotationsAdvanced from "highcharts/modules/annotations-advanced.src.js";
import PriceIndicator from "highcharts/modules/price-indicator.src.js";
import FullScreen from "highcharts/modules/full-screen.src.js";
import StockTools from "highcharts/modules/stock-tools.src.js";

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

        this.axisIndex = 2;
        this.data = [];
        this.macdGroup = {};

        this.serieMap = {};
        this.serieData = {};
        this.last = undefined;
        this.first = undefined;
        this.minDate = undefined;
        this.maxDate = undefined;

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
                        pointPadding: -0.1,
                        states: {
                            inactive: {
                                enabled: false,
                                opacity: 1
                            }
                        }
                    }
                },
                xAxis: {
                    gridLineWidth: 1
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
                    }, {
                        title: {
                            text: 'USD balance'
                        },
                        top: '0%',
                        height: '60%',
                        resize: {
                            enabled: true
                        }
                    }, {
                        title: {
                            text: 'BTC balance'
                        },
                        top: '0%',
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
                        height: '10%',
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
                        height: '5%',
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

    updateNavigator() {
        let options = {
            chartOptions: {
                xAxis: {
                    min: this.minDate,
                    max: this.maxDate
                }
            }
        }

        this.setState(options);
    }

    updateChart() {


        //console.log("chunk periode : " + new Date(this.first) + " " + new Date(this.last));
        //TODO display flags
        //https://www.highcharts.com/docs/stock/flag-series
        //https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/stock/demo/flags-general
        //TODO try dark unica theme
        //TODO default macd https://www.highcharts.com/demo/stock/macd-pivot-points/dark-unica

        let options = {
            chartOptions: {
                xAxis: {
                    min: this.minDate,
                    max: this.maxDate,
                },
                series: [
                    {
                        yAxis: 0,
                        type: 'heikinashi',
                        //type: 'candlestick',
                        name: 'Heikin Ashi',
                        data: this.data,
                        id: 'hikinashiId'
                    }
                ]
            }
        }
        //console.log(this.serieMap);
        for (let key in this.serieMap) {
            options.chartOptions.series.push(this.serieMap[key]);
        }
        //  console.log(options);


        this.setState(options);


    }

    parseOrder(order) {
        let color = "rgba(253,253,253,1)";
        let name = "buy and sell orders";

        let point = [];
        if (this.serieMap.bs === undefined) {

            this.serieData.bs = [];
            this.serieMap.bs = {
                yAxis: 0,
                id: "ordersLine",
                name: "hiiden placement serie",
                color: color,
                data: this.serieData.bs
            }
        } else {
            point.push(order.t);
            point.push(order.p);
            this.serieData.bs.push(point);
        }

        name = "orders";
        if (this.serieMap[name] === undefined) {
            this.serieData[name] = [];
            this.serieMap[name] = {
                type: 'flags',
                shape: 'circlepin',
                width: 8,
                height: 8,
                y: -8,
                x: -8,
                onSeries: 'ordersLine',
                color: "#a0ff31",
                fillColor: "#a0ff31",
                grouping: true,
                lineColor: "rgba(3,3,3,0)",
                states: {
                    inactive: {
                        enabled: false,
                        opacity: 1
                    }
                },
                data: this.serieData[name]
            }
        } else {
            let color = "rgba(253,253,253,0)";
            let fillColor = "#a0ff31";
            let title = "?";
            if (order.ty === "buy") {
                color = "#a0ff31";
                fillColor = "#a0ff31";
                title = "B";
            }
            if (order.ty === "sell") {
                color = "#ff0080";
                fillColor = "#ff0080";
                title = "S";
            }
            let orderPoint = {
                x: order.t,
                selected: true,
                title: title,
                text: order.ty + " " + order.p,
                color: color,
                fillColor: fillColor
            }
            this.serieData[name].push(orderPoint)
        }
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
            }
            point = [];
            point.push(time);
            point.push(pointValue);
            this.serieData[name].push(point);

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
            }
            point = [];
            point.push(time);
            point.push(pointValue);
            this.serieData[name].push(point);

        } else if (name.startsWith("volume")) {
            //sma
            if (this.serieMap[name] === undefined) {
                color = "#79ff37";
                this.serieData[name] = [];
                this.serieMap[name] = {
                    yAxis: 5,
                    name: name,
                    type: 'column',
                    color: color,
                    data: this.serieData[name]
                }
            }
            point = [];
            point.push(time);
            point.push(pointValue);
            this.serieData[name].push(point);

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
            }
            point = [];
            point.push(time);
            point.push(pointValue);
            this.serieData[name].push(point);

        } else if (group.startsWith("orders")) {

            let quantity = parseFloat(pointValue.quantity);
            let price = parseFloat(pointValue.price);
            if (this.serieMap.usdBalance === undefined) {

                this.serieData.usdBalance = [];
                this.serieMap.usdBalance = {
                    yAxis: 1,
                    name: "USD balance",
                    color: "#00880a",
                    data: this.serieData.usdBalance
                }
            }
            if (pointValue.type === "s") {
                point = [];
                point.push(time);
                point.push(quantity);
                this.serieData.usdBalance.push(point);
            }

            if (this.serieMap.btcBalance === undefined) {

                this.serieData.btcBalance = [];
                this.serieMap.btcBalance = {
                    yAxis: 2,
                    name: "BTC balance",
                    color: "#bb9004",
                    data: this.serieData.btcBalance
                }
            }
            if (pointValue.type === "b") {
                point = [];
                point.push(time);
                point.push(quantity);
                this.serieData.btcBalance.push(point);
            }


            let color = "rgba(253,253,253,1)";
            if (this.serieMap.bs === undefined) {

                this.serieData.bs = [];
                this.serieMap.bs = {
                    yAxis: 0,
                    id: "ordersLine",
                    name: "hidden placement serie",

                    color: color,
                    data: this.serieData.bs
                }
            }
            point = [];
            point.push(time);
            point.push(price);
            this.serieData.bs.push(point);
            /*
                        let nameOfbuySell = group+ "A";
                        if (this.serieMap[nameOfbuySell] === undefined) {
                            this.serieData[nameOfbuySell] = [];
                            this.serieMap[nameOfbuySell] = {
                                type: 'flags',
                                shape: 'circlepin',
                                width: 8,
                                height: 8,
                                y: -8,
                                x: -8,
                                onSeries: 'ordersLine',
                                color: "#a0ff31",
                                fillColor: "#a0ff31",
                                grouping: true,
                                lineColor: "rgba(3,3,3,0)",
                                states: {
                                    inactive: {
                                        enabled: false,
                                        opacity: 1
                                    }
                                },
                                data: this.serieData[nameOfbuySell]
                            }
                        }
                        point = [];
                        point.push(time);
                        point.push(pointValue.price);
                        //this.serieData[nameOfbuySell].push(point);
                        */


        } else if (name.startsWith("macd")) {
            //macd
            let color = "#00ff00";
            if (this.macdGroup[group] === undefined) {
                this.macdGroup[group] = this.axisIndex++;
            }
            if (name.endsWith("histogram")) {
                if (this.serieMap[name] === undefined) {
                    this.serieData[name] = [];
                    this.serieMap[name] = {
                        yAxis: this.axisIndex,
                        name: "macd " + group,
                        color: color,
                        type: 'column',
                        data: this.serieData[name]
                    }
                }

                if (pointValue < 0) {
                    color = "#fd007f";
                }
                point = {
                    x: time,
                    y: pointValue,
                    color: color
                }
                this.serieData[name].push(point);

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
                }
                point.push(time);
                point.push(pointValue);
                this.serieData[name].push(point);

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

    parseData(result) {

        this.last = result.last;
        this.first = result.first;
        let metaIndicator = result.metaIndicator;
        let metaOhlc = result.metaOhlc;
        /*

        */
        if (result.OHLC !== undefined) {
            let OHLC = result.OHLC;
            for (let i = 0; i < OHLC.length; i++) {
                /*TODO perf improv load only 24h to the graph display by default only 8h
                //update the graph when navigator is moved or increased
                */
                let time = OHLC[i][0];

                //TODO optim : To change all data of a series use setData() use setdata https://api.highcharts.com/class-reference/Highcharts.Series#setData
                //TODO use update data
                //TODO only display buy and sell for the zoomed period
                this.data.push(this.parsePointOf(OHLC[i], metaOhlc));
                if (metaOhlc.vwap !== undefined) {
                    this.parseIndicator(OHLC[i][metaOhlc.vwap.index], time, "vwap", "ohlc");
                }
                if (metaOhlc.volume !== undefined) {
                    this.parseIndicator(OHLC[i][metaOhlc.volume.index], time, "volume", "volume");
                }

                if (metaOhlc.indicators !== undefined) {

                    //return the values of ohlc at the inidcator index
                    let metaIndicatorValues = OHLC[i][metaOhlc.indicators.index];
                    let order = {};
                    let foundOrders = false;
                    for (let key in metaIndicatorValues) {
                        let group = metaIndicator[key].group;
                        if (group !== undefined && group === "orders") {
                            foundOrders = true;
                            order[metaIndicator[key].key] = metaIndicatorValues[key];
                            if (metaIndicator[key].key === "price" && metaIndicatorValues[key] !== OHLC[i][1]) {
                                console.log("price different");
                                console.log(OHLC[i]);
                                console.log(metaIndicator[key]);
                                console.log(metaIndicator);
                                debugger;
                            }
                        } else {
                            this.parseIndicator(metaIndicatorValues[key], time, metaIndicator[key].name, group);
                        }
                    }
                    if (foundOrders === true) {
                        this.parseIndicator(order, time, "", "orders");
                    }
                }

            }

            if (this.last - this.first < 1000 * 60 * 60 * 8) {
                this.minDate = this.last - 1000 * 60 * 60 * 8;
                this.maxDate = this.last;
            } else {
                this.minDate = this.first - 1000 * 60 * 60 * 48;
                this.maxDate = this.last - 1000 * 60 * 60 * 48;
                //this.minDate = this.first;
                //sthis.maxDate = this.first + 1000 * 60 * 60 * 2;
            }
            this.updateChart();

        } else {
            console.error("meta.OHLC undefined");
        }

    }

    fetchData() {

        let url = "/api/getOHLC";
        if (this.last !== undefined) {
            url += "?last=" + this.last;
            //3days
            url += "&limit=4320";
        }

        fetch(url)
            .then(response => response.json())
            .then(result => {

                if (result.last > this.last) {
                    console.log("last result is changed, new data to parse");
                    this.parseData(result);

                    if (this.synchronizedYet === false && this.firstBatch === false) {
                        //pace down every minute
                        console.log("request synchronized pacedown the timer")
                        clearInterval(this.timer);
                        this.timer = setInterval(() => this.fetchData(), 1000);
                        this.synchronizedYet = true;
                    }

                    if (this.firstBatch === true) {
                        //dont use timer , because there is no garantie that the answer comes in the right order
                        //this.fetchData();
                    }
                }

                if (this.last === result.last) {
                    this.last = result.last;

                    if (this.firstBatch === true) {
                        console.log("first batch all done, launch the timer")
                        clearInterval(this.timer);
                        this.timer = setInterval(() => this.fetchData(), 100);
                        this.firstBatch = false;
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