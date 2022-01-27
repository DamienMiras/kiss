import Kiss from "../../modules/kiss.js";

export default class Dashboard extends Kiss {
    constructor(factory, parentKiss, element) {
        super(factory, parentKiss, element);

        this.axisIndex = 2;
        this.serieMap = {};
        this.serieData = {};
        this.isSerieLoaded = false;
        this.macdGroup = {};
        this.chart;

        this.last = 0;
        this.first = undefined;
        this.minDate = new Date().getMilliseconds() - 1000 * 60 * 60 * 24 * 30;
        this.maxDate = new Date().getMilliseconds();
        this.seriesMinDate = undefined;
        this.seriesMaxDate = undefined;

        this.chartOptions = {
            navigator: {},
            series: [],

            credits: {
                enabled: false
            },
            legend: {
                //enabled: true,
            },
            tooltip: {
                //enabled: false
                style: {
                    color: "#FFFFFF"
                }
            },
            chart: {
                height: 1300,
                margin: [0, 200, 0, 0],
                //plotBorderWidth: 1,
                borderWidth: 1,
                styledMode: false
            },
            title: {
                style: {
                    text: 'kraken XBTUSD 1m',
                    color: "#ffffff"
                }
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
                gridLineColor: '#ababab',
                gridLineWidth: 0.5,
                crossHairt: true,
                min: this.minDate,
                max: this.maxDate
            },
            yAxis: [
                {
                    gridLineColor: '#ababab',
                    gridLineWidth: 0.5,
                    tickWidth: 1,
                    tickColor: '#cd1400',

                    title: {
                        text: 'OHLC',
                        verticalAlign: 'top',
                        x: 35,
                        y: 5,
                        style: {
                            color: '#ffffff'
                        }
                    },
                    labels: {
                        align: 'right',
                        x: 35,
                        y: 10,
                        style: {
                            color: '#fffdfe'
                        }
                    },
                    height: '70%',
                    resize: {
                        enabled: false
                    }
                }, {
                    gridLineWidth: 0,
                    title: {
                        text: 'USD balance',
                        x: 60,
                        style: {
                            color: '#00880a'
                        }
                    },
                    labels: {
                        align: 'right',
                        x: 60,
                        style: {
                            color: '#00880a'
                        }
                    },
                    top: '0%',
                    height: '70%',
                    resize: {
                        enabled: true
                    }
                }, {
                    title: {
                        text: 'BTC balance',
                        x: 90,
                        style: {
                            color: '#bb9004'
                        }
                    },
                    gridLineWidth: 0,
                    labels: {
                        align: 'right',
                        x: 90,
                        style: {
                            color: '#bb9004'
                        }
                    },
                    top: '0%',
                    height: '70%',
                    resize: {
                        enabled: true
                    }
                },
                {
                    lineColor: '#ababab',
                    lineWidth: 0.5,
                    gridLineColor: '#ababab',
                    gridLineWidth: 0.5,
                    labels: {
                        align: 'right',
                        x: -500
                    },
                    title: {
                        text: 'MACD short',
                        style: {
                            color: '#ffffff'
                        }
                    },
                    offset: 0,
                    color: "#ffe57f",
                    height: '10%',
                    top: '70%',
                    marker: {
                        enabled: true
                    },
                    grouping: false,
                    resize: {
                        enabled: true
                    }
                }, {
                    lineColor: '#ababab',
                    lineWidth: 0.5,
                    gridLineColor: '#ababab',
                    gridLineWidth: 0.5,
                    title: {
                        text: 'MACD long',
                        style: {
                            color: '#ffffff'
                        }
                    },
                    offset: 0,
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
                }
                , {
                    lineColor: '#ababab',
                    lineWidth: 0.5,
                    gridLineColor: '#ababab',
                    gridLineWidth: 0.5,
                    title: {
                        text: 'Volume',
                        style: {
                            color: '#ffffff'
                        }
                    },
                    offset: 0,
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
        };

    }

    onLoaded() {

        this.chart = Highcharts.stockChart('stockChart', this.chartOptions);
        this.postMessage(this, "dashboard_menu", "status", "loaded");
    }


    onMessageReceived(e, meta) {
        super.onMessageReceived(e, meta);
        if (meta.type === "ohlc") {
            this.onOhlcRecieved(meta.data);
        }
    }

    onOhlcRecieved(result) {

        if (this.isSerieLoaded === false) {
            this.parseAllSeries(result);
            this.updateSeries();
            this.isSerieLoaded = true;
        }
        this.parseData(result);
        this.updateData();

    }


    parseAllSeries(result) {
        let metaIndicator = result.metaIndicator;
        let metaOhlc = result.metaOhlc;
        if (metaIndicator !== undefined && metaOhlc !== undefined) {
            let foundOrders = false;
            this.parseOneSerie("heikinashi", "ohlc", "ohlc");

            if (metaOhlc.vwap !== undefined) {
                this.parseOneSerie("vwap", "ohlc", "vwap");
            }
            if (metaOhlc.volume !== undefined) {
                this.parseOneSerie("volume", "ohlc", "volume");
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
                    this.parseOneSerie(name, group, type);
                }
            }
            if (foundOrders === true) {
                for (let key in orders) {
                    let order = orders[key];

                    this.parseOneSerie("", order.group, "orders");
                }
            }
        }
    }


    parseOneSerie(name, group, type) {
        //TODO replace the name startwith by the type, involve server compatibility
        if (type === "ohlc") {

            if (this.serieMap[type] === undefined) {
                this.serieData[type] = [];
                this.serieMap[type] = {
                    yAxis: 0,
                    type: 'heikinashi',
                    //type: 'candlestick',
                    name: name,
                    id: type,
                    data: this.serieData[type]
                }
            }

        }

        if (name.startsWith("ema")) {
            //ema
            if (this.serieMap[name] === undefined) {
                this.serieData[name] = [];
                this.serieMap[name] = {
                    yAxis: 0,
                    name: name,
                    id: name,
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
                    id: name,
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
                    id: name,
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
                    id: name,
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
                    id: usdBalance,
                    color: "#00880a",
                    data: this.serieData[usdBalance]
                }
            }

            if (this.serieMap[btcBalance] === undefined) {
                this.serieData[btcBalance] = [];
                this.serieMap[btcBalance] = {
                    yAxis: 2,
                    name: group + "BTC balance",
                    id: btcBalance,
                    color: "#bb9004",
                    data: this.serieData[btcBalance]
                }
            }

            if (this.serieMap[buyAndSellLine] === undefined) {
                this.serieData[buyAndSellLine] = [];
                this.serieMap[buyAndSellLine] = {
                    yAxis: 0,
                    id: buyAndSellLine,
                    name: group + "hidden placement serie",
                    color: "rgba(253,253,253,0.5)",
                    data: this.serieData[buyAndSellLine]
                }
            }

            let buyAndSellFlags = group + "buy And Sell flags";
            if (this.serieMap[buyAndSellFlags] === undefined) {
                this.serieData[buyAndSellFlags] = [];
                this.serieMap[buyAndSellFlags] = {
                    type: 'flags',
                    shape: 'circlepin',
                    enableMouseTracking: false,
                    width: 8,
                    height: 8,
                    y: -8,
                    x: -8,
                    onSeries: buyAndSellLine,
                    id: buyAndSellFlags,
                    color: "#a0ff31",
                    fillColor: "#a0ff31",
                    grouping: false,
                    lineColor: "rgba(3,3,3,1)",
                    data: this.serieData[buyAndSellFlags]
                }
            }


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
                        id: name,
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
                        id: name,
                        color: color,
                        data: this.serieData[name]
                    }
                }
            }
        }
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
        let OHLC = result.OHLC;
        for (let i = 0; i < OHLC.length; i++) {
            /*TODO perf improv load only 24h to the graph display by default only 8h
            //update the graph when navigator is moved or increased
            */
            let time = OHLC[i][0];

            //TODO optim : To change all data of a series use setData() use setdata https://api.highcharts.com/class-reference/Highcharts.Series#setData
            //TODO use update data
            //TODO only display buy and sell for the zoomed period
            this.parseIndicator(this.parsePointOf(OHLC[i], metaOhlc), time, "ohlc", "ohlc", "ohlc");

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

    parseIndicator(pointValue, time, name, group, type) {
        let point = [];
        if (type === "ohlc") {
            this.serieData[type].push(pointValue);
        }
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
            let buyAndSellFlags = group + "buy And Sell flags";

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


            if (this.serieData[buyAndSellFlags] !== undefined) {
                let color = "rgba(253,253,253,0)";
                let fillColor = "#a0ff31";
                let title = "?";
                if (pointValue.type === "b") {
                    color = "#314810";
                    fillColor = "#a0ff31";
                    title = "";
                }
                if (pointValue.type === "s") {
                    color = "#2f0017";
                    fillColor = "#ff0080";
                    title = "";
                }
                let orderPoint = {
                    x: time,
                    title: title,
                    text: pointValue.type + " " + pointValue.price,
                    color: color,
                    fillColor: fillColor
                };
                this.serieData[buyAndSellFlags].push(orderPoint);
            }

        } else if (name.startsWith("macd")) {
            let color = "#00ff00";
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


    updateSeries() {
        for (let key in this.serieMap) {
            this.chart.addSeries(this.serieMap[key]);
        }
        this.chart.redraw();
    }

    updateData() {

        let series = this.chart.series;
        for (let i in series) {
            let serie = series[i];
            let data = this.serieData[serie.options.id];
            if (data !== undefined) {
                serie.setData(data);
            }
        }

        this.minDate = this.first;
        this.maxDate = this.first + 1000 * 60 * 60 * 1;


        this.chart.xAxis[0].setExtremes(this.minDate, this.maxDate);

        console.log("this is a global object", context.global);
    }


}


