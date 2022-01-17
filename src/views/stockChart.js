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
import Watch from "../lib/watch.js";

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
        this.pauseLoading = false;
        this.pauseMoveWhileLoading = false;

        this.serieMap = {};
        this.serieData = {};
        this.last = 0;
        this.first = undefined;
        this.minDate = undefined;
        this.maxDate = undefined;
        this.seriesMinDate = undefined;
        this.seriesMaxDate = undefined;
        this.watchUpdateSeries = new Watch("update series", "#7FFFFF");
        this.watchParseData = new Watch("parse data", "#FF7FFF");

        this.state = {
            chartOptions: {
                navigator: {},
                chart: {
                    height: 1300,
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

    updateSeries() {
        let options = {
            chartOptions: {
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

        for (let key in this.serieMap) {
            options.chartOptions.series.push(this.serieMap[key]);
        }
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
                        id: 'hikinashiId',
                        data: this.data
                    }
                ]
            }
        }
        //console.log(this.serieMap);
        for (let key in this.serieMap) {
            options.chartOptions.series.push(this.serieMap[key]);
        }
        //  console.log(options);


        this.watchUpdateSeries.start();
        this.setState(options);
        this.watchUpdateSeries.stop().log();

    }

    componentDidUpdate(prevProps, prevState, snapshot) {

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

    parseSeries(name, group, type) {
        //TODO replace the name startwith by the type, involve server compatibility
        if (name.startsWith("ema")) {
            //ema
            if (this.serieMap[name] === undefined) {
                this.serieData[name] = [];
                this.serieMap[name] = {
                    yAxis: 0,
                    name: name,
                    color: "#c2ff00",
                    data: this.serieData[name]
                }
            }

        } else if (name.startsWith("vwap")) {
            //sma
            if (this.serieMap[name] === undefined) {
                this.serieData[name] = [];
                this.serieMap[name] = {
                    yAxis: 0,
                    name: name,
                    color: "#00ffff",
                    data: this.serieData[name]
                }
            }

        } else if (name.startsWith("volume")) {
            //sma
            if (this.serieMap[name] === undefined) {
                this.serieData[name] = [];
                this.serieMap[name] = {
                    yAxis: 5,
                    name: name,
                    type: 'column',
                    color: "#79ff37",
                    data: this.serieData[name]
                }
            }

        } else if (name.startsWith("sma")) {
            //sma
            if (this.serieMap[name] === undefined) {
                this.serieData[name] = [];
                this.serieMap[name] = {
                    yAxis: 0,
                    name: name,
                    color: "#7b66fc",
                    data: this.serieData[name]
                }
            }

        } else if (type === "orders") {
            let usdBalance = group + " UsdBalance";
            let btcBalance = group + " btcBalance";
            let buyAndSellLine = group + "buy And Sell Line";
            if (this.serieMap[usdBalance] === undefined) {
                this.serieData[usdBalance] = [];
                this.serieMap[usdBalance] = {
                    yAxis: 1,
                    name: group + " USD balance",
                    color: "#00880a",
                    data: this.serieData[usdBalance]
                }
            }

            if (this.serieMap[btcBalance] === undefined) {
                this.serieData[btcBalance] = [];
                this.serieMap[btcBalance] = {
                    yAxis: 2,
                    name: group + "BTC balance",
                    color: "#bb9004",
                    data: this.serieData[btcBalance]
                }
            }

            if (this.serieMap[buyAndSellLine] === undefined) {
                this.serieData[buyAndSellLine] = [];
                this.serieMap[buyAndSellLine] = {
                    yAxis: 0,
                    id: "ordersLine",
                    name: group + "hidden placement serie",
                    color: "rgba(253,253,253,1)",
                    data: this.serieData[buyAndSellLine]
                }
            }


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
                        color: "#00ff00",
                        type: 'column',
                        data: this.serieData[name]
                    }
                }
            } else {
                //the other lines
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
            }
        }
    }

    parseIndicator(pointValue, time, name, group, type) {
        let point = [];
        if (name.startsWith("ema")) {

            point = [];
            point.push(time);
            point.push(pointValue);
            this.serieData[name].push(point);

        } else if (name.startsWith("vwap")) {

            point = [];
            point.push(time);
            point.push(pointValue);
            this.serieData[name].push(point);

        } else if (name.startsWith("volume")) {

            point = [];
            point.push(time);
            point.push(pointValue);
            this.serieData[name].push(point);

        } else if (name.startsWith("sma")) {

            point = [];
            point.push(time);
            point.push(pointValue);
            this.serieData[name].push(point);

        } else if (type === "order") {

            let usdBalance = group + " UsdBalance";
            let btcBalance = group + " btcBalance";
            let buyAndSellLine = group + "buy And Sell Line";

            let quantity = parseFloat(pointValue.quantity);
            let price = parseFloat(pointValue.price);

            if (pointValue.type === "s") {
                point = [];
                point.push(time);
                point.push(quantity);
                this.serieData[usdBalance].push(point);
            }

            if (pointValue.type === "b") {
                point = [];
                point.push(time);
                point.push(quantity);
                this.serieData[btcBalance].push(point);
            }


            point = [];
            point.push(time);
            point.push(price);
            this.serieData[buyAndSellLine].push(point);
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
                //handles the slow line AND the signal line
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

        this.first = result.first;
        this.last = result.last;
        if (this.seriesMinDate === undefined) {
            this.seriesMinDate = this.first;
        }
        if (this.seriesMaxDate === undefined) {
            this.seriesMaxDate = this.last;
        }
        if (this.seriesMaxDate < this.last) {
            this.seriesMaxDate = this.last;
        }
        if (this.minDate === undefined) {
            this.minDate = this.first;
        }

        if (this.maxDate === undefined) {
            this.maxDate = this.last;
        }

        let metaIndicator = result.metaIndicator;
        let metaOhlc = result.metaOhlc;
        if (metaIndicator !== undefined && metaOhlc !== undefined) {
            let foundOrders = false;

            if (metaOhlc.vwap !== undefined) {
                this.parseSeries("vwap", "ohlc");
            }
            if (metaOhlc.volume !== undefined) {
                this.parseSeries("volume", "volume");
            }

            let orders = {};
            for (let key in metaIndicator) {
                /**
                 * group "bot1orders" or "bot2orders"
                 * type  "order"
                 * name  "quantity"
                 * ror each group we create an order indexed by group value
                 */
                let group = metaIndicator[key].group;
                let type = metaIndicator[key].type;
                let name = metaIndicator[key].name;
                if (name !== undefined && group !== undefined && type !== undefined && type === "order") {
                    if (orders.group === undefined) {
                        orders[group] = {name: "", group: ""};
                    }
                    orders[group].name = name;
                    orders[group].group = group;
                    foundOrders = true;

                } else {
                    this.parseSeries(name, group, type);
                }
            }
            if (foundOrders === true) {
                for (let key in orders) {
                    let order = orders[key];

                    this.parseSeries("", order.group, "orders");
                }
            }
        }
        this.updateSeries();
        console.log(this.serieMap);


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

                        } else {
                            this.parseIndicator(metaIndicatorValues[key], time, metaIndicator[key].name, group);
                        }
                    }
                    if (foundOrders === true) {
                        //FIXME order prices are not equals to the time price or shifted(linked to BigDecimal prices)
                        this.parseIndicator(order, time, "", "orders", "order");
                    }
                }

            }
            if (this.pauseMoveWhileLoading === false) {
                if ((this.last - this.first) < 1000 * 60 * 60 * 8) {
                    this.minDate = this.last - 1000 * 60 * 60 * 8;
                    this.maxDate = this.last;
                } else {
                    this.minDate = this.first - 1000 * 60 * 60 * 48;
                    this.maxDate = this.last - 1000 * 60 * 60 * 48;
                    //this.minDate = this.first;
                    //sthis.maxDate = this.first + 1000 * 60 * 60 * 2;
                }
            }
            this.updateChart();

        } else {
            console.error("meta.OHLC undefined");
        }

    }


    fetchData() {
        if (this.pauseLoading === true) {
            return;
        }

        let url = "/api/getOHLC";
        if (this.last !== undefined) {
            url += "?last=" + this.last;
            //3days
            url += "&limit=4320";
        }

        fetch(url)
            .then(response => response.json())
            .then(result => {
                if (this.pauseLoading === true) {
                    return;
                }


                if (result.last > this.last) {
                    console.log("last result has changed, new data to parse");
                    this.parseData(result);

                    /*
                    if (this.synchronizedYet === false && this.firstBatch === false) {
                        //pace down every minute
                        console.log("request synchronized pacedown the timer")
                        clearInterval(this.timer);
                        this.timer = setInterval(() => this.fetchData(), 1000);
                        this.synchronizedYet = true;
                    }
*/
                    if (this.firstBatch === true) {
                        //dont use timer , because there is no garantie that the answer comes in the right order
                        this.fetchData();
                    }
                } else if (this.last === result.last) {

                    if (this.firstBatch === true) {
                        console.log("first batch all done, launch the timer");
                        this.watchParseData.resetTotal();
                        this.watchUpdateSeries.resetTotal()
                        clearInterval(this.timer);
                        this.timer = setInterval(() => this.fetchData(), 1000 * 60);
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

    playPauseLoading() {
        this.pauseLoading = !this.pauseLoading;
        if (this.pauseLoading === true) {
            console.log("pause loading");
            clearInterval(this.timer);
        } else {
            console.log("play loading");
            this.fetchData();
        }

    }

    moveNav() {
        console.log(this);
        let byIncrement = 1000 * 60 * 60 * 1;
        this.minDate = this.minDate + byIncrement;
        this.maxDate = this.maxDate + byIncrement;
        if (this.maxDate > this.seriesMaxDate) {
            this.maxDate = this.seriesMaxDate;
            this.minDate = this.seriesMaxDate - byIncrement;
            clearInterval(this.timerNavigator);
        }
        console.log(this.minDate + " " + this.maxDate);
        this.updateNavigator();
    }

    move() {

        console.log("move");
        this.minDate = this.seriesMinDate;
        this.maxDate = this.seriesMinDate + 1000 * 60 * 60 * 8;
        console.log(this.seriesMinDate + " " + this.minDate + " " + this.maxDate);
        this.pauseMoveWhileLoading = true;
        clearInterval(this.timerNavigator);
        this.timerNavigator = setInterval(() => this.moveNav(), 1000);

    }

    componentDidMount() {


        this.synchronizedYet = false;
        this.last = 0;
        this.firstBatch = true;
        console.log("componentDiMount")
        this.fetchData();


    }

    componentWillUnmount() {
        clearInterval(this.timerNavigator);
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
                <button onClick={this.move.bind(this)}>move navigator</button>
                <button onClick={this.playPauseLoading.bind(this)}>playPause loading</button>
            </div>


        )
    }
}

export default StockChart