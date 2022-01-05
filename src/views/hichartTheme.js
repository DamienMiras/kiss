Highcharts.theme = {
    colors: [
       "#5e72e4",
       "#5603ad",
       "#8965e0",
       "#f3a4b5",
       "#f5365c",
       "#fb6340",
       "#ffd600",
       "#2dce89",
       "#11cdef",
       "#2bffc6"
    ],
    chart: {
        backgroundColor: {
            linearGradient: [0, 0, 500, 500],
            stops: [
                [0, 'rgb(0, 0, 0,0.1)'],
                [1, 'rgb(10, 10, 10,0.2)']
            ]
        },
    },
    title: {
        style: {
            color: '#5e5e5e',
            font: 'bold 16px "Trebuchet MS", Verdana, sans-serif'
        }
    },
    subtitle: {
        style: {
            color: '#545454',
            font: 'bold 12px "Trebuchet MS", Verdana, sans-serif'
        }
    },
    legend: {
        itemStyle: {
            font: '9pt Trebuchet MS, Verdana, sans-serif',
            color: 'black'
        },
        itemHoverStyle: {
            color: '#575757'
        }
    }
};
// Apply the theme
Highcharts.setOptions(Highcharts.theme);