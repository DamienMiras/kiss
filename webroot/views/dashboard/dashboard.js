import Kiss from "../../modules/kiss.js";

export default class Dashboard extends Kiss {
    constructor(factory, parentKiss, element) {
        super(factory, parentKiss, element);

        this.serieMap = {};
        this.serieData = {};
        this.isSerieLoaded = false;
        this.macdGroup = {}

        this.chartOptions = {
            navigator: {},
            series: [],
            legend: {
                // enabled: false,
            },
            tooltip: {
                //enabled: false
            },
            chart: {
                height: 500,
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
        };

    }

    onLoaded() {
        this.chart = Highcharts.stockChart('stockChart', this.chartOptions);
    }


    onMessageReceived(e, meta) {
        super.onMessageReceived(e, meta);
        if (meta.type === "ohlc") {
            this.onOhlcRecieved(meta.data)
        }
    }

    onOhlcRecieved(result) {

        if (!this.isSerieLoaded) {
            this.parseSeries(result);
            this.updateSeries();
            this.isSerieLoaded = true;
        }
        this.parseData(result);

    }

    parseData(result) {
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


    parseSerie(name, group, type) {
        //TODO replace the name startwith by the type, involve server compatibility
        if (type === "ohlc") {

            if (this.serieMap[type] === undefined) {
                this.serieData[type] = [];
                this.serieMap[type] = {
                    yAxis: 0,
                    type: 'heikinashi',
                    //type: 'candlestick',
                    name: name,
                    id: 'hikinashiId',
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
                                onSeries: 'ordersLine',
                                color: "#a0ff31",
                                fillColor: "#a0ff31",
                                grouping: true,
                                lineColor: "rgba(3,3,3,1)",
                                data: this.serieData[buyAndSellFlags]
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


    parseSeries(result) {
        let metaIndicator = result.metaIndicator;
        let metaOhlc = result.metaOhlc;
        if (metaIndicator !== undefined && metaOhlc !== undefined) {
            let foundOrders = false;
            this.parseSerie("heikinashi", "ohlc", "ohlc");

            if (metaOhlc.vwap !== undefined) {
                this.parseSerie("vwap", "ohlc", "vwap");
            }
            if (metaOhlc.volume !== undefined) {
                this.parseSerie("volume", "ohlc", "volume");
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
                    this.parseSerie(name, group, type);
                }
            }
            if (foundOrders === true) {
                for (let key in orders) {
                    let order = orders[key];

                    this.parseSerie("", order.group, "orders");
                }
            }
        }
    }

    updateSeries() {
        let series = []
        for (let key in this.serieMap) {
            series.push(this.serieMap[key]);
        }
        this.chart.addSeries(series);
        this.chart.redraw();
    }


}


