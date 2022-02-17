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
        this.range = 1000 * 60 * 60 * 72;
        this.maxRangeForFlags = 1000 * 60 * 60 * 24;
        let height = 1300;
        let navigatorTop = height - 119;
        this.chartOptions = {
            chart: {
                height: height,
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
            scrollbar: {
                liveRedraw: false
            },
            navigator: {
                top: navigatorTop,
                height: 40,
                series: {
                    color: 'rgb(121,255,55,0.5)',
                }
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
                    '<tr><td style="color: {series.color}">{series.name}  </td>' +
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
                    },
                    animation: false
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
                    id: "usdBalance",
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
                    id: "btcBalance",
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
                    top: '80%',
                    height: '20%',
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
        //after event onLoad the chart will postMessage asking data

    }


    onMessageReceived(e, meta) {
        super.onMessageReceived(e, meta);
        if (meta.type === "ohlc") {
            this.onOhlcRecieved(meta.data);
        }
        if (meta.type === "rangeSelect") {
            this.selectRange(meta.data);
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
            for (let index in metaIndicator) {
                /**
                 * group "bot1orders" or "bot2orders"
                 * type  "order"
                 * name  "quantity"
                 * ror each group we create an order indexed by group value
                 */
                let group = metaIndicator[index].group;
                let type = metaIndicator[index].type;
                let name = metaIndicator[index].name;
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
                    lineWidth: 1,
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
                    lineWidth: 1,
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
                    lineWidth: 1,
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
                    lineWidth: 1,
                    color: "#7b66fc",
                    data: this.serieData[name]
                }
            }

        } else if (type === "orders") {
            let usdBalance = group + " usdBalance";
            let btcBalance = group + " btcBalance";
            let buyAndSellLine = group + " buy And Sell Line";

            if (this.serieMap[usdBalance] === undefined) {
                this.serieData[usdBalance] = [];
                this.serieMap[usdBalance] = {
                    yAxis: 1,
                    name: "[" + group + "] USD balance",
                    id: usdBalance,
                    lineWidth: 1.5,
                    dashStyle: 'LongDash',
                    color: this.global.getGreen(),//"#00880a",
                    data: this.serieData[usdBalance]
                }
            }

            if (this.serieMap[btcBalance] === undefined) {
                this.serieData[btcBalance] = [];
                this.serieMap[btcBalance] = {
                    yAxis: 2,
                    name: "[" + group + "]  BTC balance",
                    id: btcBalance,
                    lineWidth: 1.5,
                    dashStyle: 'LongDashDotDot',
                    //color:"#bb9004",
                    color: this.global.getYello(),
                    data: this.serieData[btcBalance]
                }
            }

            if (this.serieMap[buyAndSellLine] === undefined) {
                this.serieData[buyAndSellLine] = [];
                this.serieMap[buyAndSellLine] = {
                    yAxis: 0,
                    id: buyAndSellLine,
                    name: "[" + group + "]  buy and sell line",
                    //color: "rgb(135,36,255)",
                    color: this.global.getLavanda(),
                    lineWidth: 1,
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
                    name: "[" + group + "] buy and sell orders",
                    //     color: "#a0ff31",
                    //     fillColor: "#a0ff31",
                    grouping: false,
                    lineColor: "rgba(3,3,3,0)",
                    data: []
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
                        lineWidth: 1,
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
        this.l("highchart LOAD", this, event);
        this.postMessage(this, "dashboard_menu", "status", "loaded");
    }

    onChartRedraw(event) {
        //console.error("highchart REDRAW", this, event);
    }

    onChartRender(event) {
        //console.info("highchart RENDER", this, event);
    }

    onSerieSetExtremes(event) {

        if (event.userMax === undefined || event.userMin === undefined) {
            return;
        }
        this.debounce(() => {

            let range = event.userMax - event.userMin;

            let series = this.chart.series;
            for (let i in series) {
                let serie = series[i];
                if (serie.options.type === "flags") {
                    this.manageFlags(event.userMin, event.userMax, serie);
                }
                if (serie.options.id.endsWith(" buy And Sell Line")) {
                    if (range <= this.maxRangeForFlags) {
                        //.visible = true/false doesnt works of course
                        serie.opacity = 1;
                    } else {
                        serie.opacity = 0;
                    }
                }
            }
            this.chart.redraw();
        }, 400)();


    }

    manageFlags(min, max, serie) {
        let range = max - min;
        if (range <= this.maxRangeForFlags) {
            let data = this.serieData[serie.options.id];
            if (data !== undefined) {
                let chunkedData = data.filter((point) => {
                    return point.x >= min && point.x <= max;
                }).sort((pa, pb) => {
                    return pa.x - pb.x
                });
                console.info("display flags");
                serie.setData(chunkedData, false, false);
            }
        } else {
            serie.setData([], false, false);
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
                /*
                "metaIndicator": {<---------------------metaIndicator
                    "0": {<-----------------------------metaIndicator[index]
                        "key": "cheat v1 price",
                        "name": "price",
                        "group": "cheat v1",<-----------metaIndicator[index].group
                        "type": "order"<----------------metaIndicator[index].type
                    },
                    "1": {
                        "key": "cheat v1 quantity",
                        "name": "quantity",
                        "group": "cheat v1",
                        "type": "order"
                    },
                 */
                /*
                "OHLC": [
                    [<----------------------------------OHLC[i]
                        1638001680000,<-----------------time
                        55152.6,
                        {<------------------------------values = OHLC[i][metaOhlc.indicators.index];
                            "0": "55152.6",
                            "1"<------------------------metaOhlc.indicators.index
                            "2": "b",<------------------values[index];
                            "3": "9999.99918426"<-------values[3];
                        }
                 */
                let values = OHLC[i][metaOhlc.indicators.index];
                let groupMap = {};
                for (let index in values) {
                    let groupName = metaIndicator[index].group;
                    let type = metaIndicator[index].type;
                    let name = metaIndicator[index].name;
                    let value = values[index];
                    if (groupName && type === "order") {
                        if (!groupMap[groupName]) {
                            //init a group obj per groupName
                            groupMap[groupName] = {};
                        }
                        let group = groupMap[groupName];

                        group[name] = value
                        groupMap[groupName] = group;

                    } else {
                        this.parseIndicator(value, time, name, groupName);
                    }
                }
                for (let groupName in groupMap) {
                    let group = groupMap[groupName];
                    this.parseIndicator(group, time, groupName, groupName, "order");
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

    /**
     *
     * @param pointValue
     * @param time
     * @param nameF
     * @param group
     * @param type
     */
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

            let usdBalanceGroup = group + " usdBalance";
            let btcBalanceGroup = group + " btcBalance";
            let buyAndSellLine = group + " buy And Sell Line";
            let buyAndSellFlags = group + " buy And Sell flags";

            let quantity = parseFloat(pointValue.quantity);
            let price = parseFloat(pointValue.price);

            if (pointValue.type === "s") {
                let quantity = parseFloat(pointValue.usdBalance);
                point = [];
                point.push(time);
                point.push(quantity);
                this.serieData[usdBalanceGroup].push(point);
            }

            if (pointValue.type === "b") {
                let quantity = parseFloat(pointValue.btcBalance);
                point = [];
                point.push(time);
                point.push(quantity);
                this.serieData[btcBalanceGroup].push(point);
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
                    color = "#ffffff";
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
        this.minDate = this.first;
        this.maxDate = this.first + this.range;

        let series = this.chart.series;
        for (let i in series) {
            let serie = series[i];
            let data = this.serieData[serie.options.id];
            if (data !== undefined) {
                if (serie.options.type !== "flags") {
                    serie.setData(data, false, false);
                    //flags are displayed only when range changes after setExtrem
                }
            }
        }
        // this.chart.xAxis[0].setExtremes(this.minDate, this.maxDate, false);
        this.chart.redraw();


        // console.log("this is a global object", context.global);
    }

    updateSelectedRange() {
        this.chart.xAxis[0].setExtremes(this.minDate, this.maxDate, false, true);
        this.chart.redraw();
    }

    selectRange(data) {
        this.range = 1000 * 60 * 60 * data.range;
        this.maxDate = this.minDate + this.range;
        this.updateSelectedRange();

    }

}


