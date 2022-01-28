import Kiss from "../../modules/kiss.js";

export default class Dashboard extends Kiss {
    constructor(factory, parentKiss, element) {
        super(factory, parentKiss, element);
        //TODO move the tooltips
        //TODO sometimes graph does not expands
        //TODO load only the flag for 4 hours
        this.axisIndex = 2;
        this.serieMap = {};
        this.serieData = {};
        this.isSerieLoaded = false;
        this.macdGroup = {};
        this.chart;

        this.last = 0;
        this.first = undefined;
        this.minDate = undefined //new Date().getMilliseconds() - 1000 * 60 * 60 * 24 * 30;
        this.maxDate = undefined // new Date().getMilliseconds();
        this.seriesMinDate = undefined;
        this.seriesMaxDate = undefined;

        this.chartOptions = {

            navigator: {
                top: 1181,
                height: 40,
                series: {
                    color: 'rgb(121,255,55,0.5)',
                    //lineWidth: 0.5
                }
                //adaptToUpdatedData: false,
            },
            rangeSelector: {
                enabled: false
            },
            series: [],
            credits: {
                enabled: false
            },
            legend: {
                enabled: true,
                floating: true,
                align: 'left',
                x: 0,
                y: 0
            },

            tooltip: {
                //enabled: false
                style: {
                    color: "#FFFFFF"
                },
                split: false,
                shared: true,
                borderRadius: 0,

                positioner: function () {
                    return {x: 7, y: 7};
                },
                //TODO see https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/tooltip/formatter-split/
                useHTML: true,
                headerFormat: '<table><tr><th colspan="3">{point.key}</th></tr>',
                pointFormat:
                    '<tr><td style="color: {series.color}">{series.name}  {series.color} </td>' +
                    '<td style="color: {series.color};text-align: right;">' +
                    'open <b>{point.open}</b> high <b>{point.high}</b>  low <b>{point.low}</b>  close <b>{point.close}</b> ' +
                    '</td>' +
                    '<td style="text-align: right"><b>{point.y}</b></td></tr>',
                footerFormat: '</table>',
                /*formatter: function () {
                    // The first returned item is the header, subsequent items are the
                    // points
                    return ['<b>' + this.x + '</b>'].concat(
                        this.points ?
                            this.points.map(function (point) {
                                console.log(point);
                                return point.series.name + ': ' + point.y + 'm ';
                            }) : []
                    );
                },*/
                valueDecimals: 2
            },
            chart: {
                height: 1300,
                margin: [0, 200, 40, 0],
                borderWidth: 0.5,
                borderColor: "rgba(255,255,255,0.50)",
                styledMode: false,
                events: {
                    load: this.onChartLoad.bind(this),
                    redraw: this.onChartRedraw.bind(this),
                    render: this.onChartRender.bind(this)
                },
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
                    },
                    point: {
                        events: {
                            mouseOver: this.onSeriesMouseOver.bind(this)
                        }
                    }
                }
            },
            xAxis: {
                gridLineColor: 'rgba(171,171,171,0.5)',
                gridLineWidth: 0.5,
                min: this.minDate,
                max: this.maxDate,
                crosshair: true,
                labels: {
                    style: {
                        color: '#fffdfe'
                    }
                },
                events: {
                    afterSetExtremes: this.onSerieSetExtremes.bind(this)
                }
            },
            yAxis: [
                {
                    crosshair: {
                        snap: false,
                        color: "rgba(255,0,115,0.58)"
                    },
                    gridLineColor: 'rgba(171,171,171,0.51)',
                    gridLineWidth: 0.5,
                    lineColor: '#ffffff',
                    lineWidth: 0.5,
                    title: {
                        text: 'OHLC',
                        align: 'high',
                        x: 35,
                        y: 0,
                        style: {
                            color: '#ffffff'
                        }
                    },
                    labels: {
                        align: 'right',
                        x: 36,
                        y: 5,
                        style: {
                            color: '#fffdfe'
                        }
                    },
                    height: '70%',
                    resize: {
                        enabled: false
                        //Axis.resize.lineDashStyle: Dash style of the control line.
                    }
                }, {
                    gridLineWidth: 0,
                    title: {
                        text: 'USD bal.',
                        align: 'high',
                        x: 70,
                        y: 0,
                        style: {
                            color: '#00880a'
                        }
                    },
                    labels: {
                        align: 'right',
                        x: 72,
                        y: 5,
                        style: {
                            color: '#00880a'
                        }
                    },
                    top: '0%',
                    height: '70%',
                    resize: {
                        enabled: false
                    }
                }, {

                    gridLineWidth: 0,
                    title: {
                        text: 'BTC bal.',
                        align: 'high',
                        x: 105,
                        y: 0,
                        style: {
                            color: '#bb9004'
                        }
                    },
                    labels: {
                        align: 'right',
                        x: 108,
                        y: 5,
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
                    title: {
                        align: 'high',
                        y: 10,
                        x: 35,
                        text: 'MACD short',
                        style: {
                            color: '#ffffff'
                        }
                    },
                    labels: {
                        align: 'right',
                        x: 36,
                        y: 5,
                        style: {
                            color: '#bb9004'
                        }
                    },
                    offset: 0,
                    color: "#ffe57f",
                    top: '70%',
                    height: '10%',
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
                        align: 'high',
                        y: 10,
                        x: 35,
                        text: 'MACD long',
                        style: {
                            color: '#ffffff'
                        }
                    },
                    labels: {
                        align: 'right',
                        x: 36,
                        y: 5,
                        style: {
                            color: '#ffffff'
                        }
                    },
                    offset: 0,
                    color: "#ffe57f",
                    top: '80%',
                    height: '5%',
                    marker: {
                        enabled: true
                    },
                    grouping: false,
                    resize: {
                        enabled: true
                    }
                },
                {
                    lineColor: '#ababab',
                    lineWidth: 0.5,
                    gridLineColor: '#ababab',
                    gridLineWidth: 0.5,
                    title: {
                        align: 'high',
                        y: 10,
                        x: 35,
                        text: 'Volume',
                        style: {
                            color: '#ffffff'
                        }
                    },
                    labels: {
                        align: 'right',
                        x: 36,
                        y: 5,
                        style: {
                            color: '#ffffff'
                        }
                    },
                    offset: 0,
                    color: "#ffe57f",
                    top: '85%',
                    height: '15%',
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
                    lineWidth: 0.5,
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
                    lineWidth: 0.5,
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
                    lineWidth: 0.5,
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
                    lineWidth: 0.5,
                    color: "#7b66fc",
                    data: this.serieData[name]
                }
            }

        } else if (type === "orders") {
            let usdBalance = group + " UsdBalance";
            let btcBalance = group + " btcBalance";
            let buyAndSellLine = group + " buy And Sell Line";

            if (this.serieMap[usdBalance] === undefined) {
                this.serieData[usdBalance] = [];
                this.serieMap[usdBalance] = {
                    yAxis: 1,
                    name: group + " USD balance",
                    id: usdBalance,
                    lineWidth: 0.5,
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
                    lineWidth: 0.5,
                    color: "#bb9004",
                    data: this.serieData[btcBalance]
                }
            }

            if (this.serieMap[buyAndSellLine] === undefined) {
                this.serieData[buyAndSellLine] = [];
                this.serieMap[buyAndSellLine] = {
                    yAxis: 0,
                    id: buyAndSellLine,
                    name: group + " buy and sell line",
                    color: "rgb(135,36,255)",
                    lineWidth: 0.5,
                    data: this.serieData[buyAndSellLine]
                }
            }

            let buyAndSellFlags = group + " buy And Sell flags";
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
                    name: group + "buy and sell orders",
                    //     color: "#a0ff31",
                    //     fillColor: "#a0ff31",
                    grouping: false,
                    lineColor: "rgba(3,3,3,0)",
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
                        lineWidth: 0.5,
                        data: this.serieData[name]
                    }
                }
            }
        }
    }

    onSeriesMouseOver(event) {
        //console.info("highchart series mouse over", this, event);
    }

    onChartLoad(event) {
        console.error("highchart LOAD", this, event);
    }

    onChartRedraw(event) {
        //console.error("highchart REDRAW", this, event);
    }

    onChartRender(event) {
        //console.info("highchart RENDER", this, event);
    }

    onSerieSetExtremes(event) {
        console.info("highchart SET EXTREME", this, event);
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
            let buyAndSellLine = group + " buy And Sell Line";
            let buyAndSellFlags = group + " buy And Sell flags";

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
                    color = "#000000";
                    fillColor = "#a0ff31";
                    title = "B";
                } else {
                    color = "#ff002f";
                    fillColor = "#ff0080";
                    title = "S";
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
            this.chart.addSeries(this.serieMap[key], false);
        }
        this.chart.redraw();
    }

    updateData() {
        let range = 1000 * 60 * 60 * 4;
        this.minDate = this.first;
        this.maxDate = this.first + range;


        let series = this.chart.series;
        for (let i in series) {
            let serie = series[i];

            let data = this.serieData[serie.options.id];
            if (data !== undefined) {
                if (serie.options.type !== "flags") {
                    serie.setData(data, false, false);
                } else {
                    if (range <= 1000 * 60 * 60 * 1) {
                        //TODO remove point
                        //https://api.highcharts.com/class-reference/Highcharts.Series%23setData#removePoint
                    }
                }
            }
        }
        this.chart.xAxis[0].setExtremes(this.minDate, this.maxDate, false);
        this.chart.redraw();


        console.log("this is a global object", context.global);
    }

    updateAxis() {
        this.chart.xAxis[0].setExtremes(this.minDate, this.maxDate, false, true);
        this.chart.redraw();
    }


}


