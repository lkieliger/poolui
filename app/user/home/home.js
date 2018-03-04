'use strict';

app.controller('HomeCtrl', function($scope, $route, dataService, timerService) {

    function ticker() {
        dataService.getData("/pool/chart/hashrate/pplns", function(data){
            data = _.forEach(data, function(element) {
                element.ts = new Date(element.ts);
                element.hs = element.hs/1000000;
            });

            $scope.poolHashrateChart = {
                datasets: { global: data },
                options: {
                    /*				    scales: {
                                            yAxes: [{
                                                ticks: {
                                                    suggestedMin: 50,
                                                    suggestedMax: 10000000
                                                }
                                            }]
                                        },
                                        tooltips: {
                                            enabled: true,
                                            mode: 'single',
                                            callbacks: {
                                                label: function(tooltipItems, data) {
                                                return tooltipItems.yLabel + ' €';
                                                }
                                            }
                                        },*/
                    series: [
                        {"axis":"y",
                            "id":"global",
                            "dataset":"global",
                            "label":"Total Pool Hashrate",
                            "key":"hs",
                            "color":"red",
                            "type":["line","area"]}
                    ],
                    allSeries: [],
                    axes: {
                        x: {
                            key: "ts",
                            type: "date"
                        }
                    }
                }
            }
        });
    }


    function ticker2() {
        dataService.getData("/pool/blocks", function(data){
	    var i = 25;
            data = _.forEach(data, function(element) {
//                element.ts = new Date(element.ts);
		element.value = element.shares/(element.diff/100)
		element.ts = i;
		i-=1;
            });

            $scope.poolEffortChart = {
                datasets: { global: data },
                options: {
                    series: [
                        {"axis":"y","id":"global","dataset":"global","label":"Effort","interpolation":{mode: "bundle", tension: 1},"key":"value","color":"green","type":["line"]},
			{"axis":"y","id":"global1","dataset":"global","label":"Effort","key":"value","color":"green","type":["dot"]}
                    ],
                    allSeries: [],
                    axes: {
                        x: {
                            key: "ts"
//                            type: "date"
                        }
                    }
                }
            }
        });
    }

    dataService.getData("/pool/blocks?limit=100", function(blocksData) {
        var i = 25;

        var color = "steelblue";

// Generate a 1000 data points using normal distribution with mean=20, deviation=5
        var values = blocksData.map(function(block) {return block.shares/(block.diff/100)});

// A formatter for counts.
        var formatCount = d3.format(",.0f");

        var margin = {top: 15, right: 30, bottom: 20, left: 30},
            width = 500 - margin.left - margin.right,
            height = 150 - margin.top - margin.bottom;

        var max = d3.max(values);
        var min = d3.min(values);
        var x = d3.scale.linear()
            .domain([min, max])
            .range([0, width]);

// Generate a histogram using twenty uniformly-spaced bins.
        var data = d3.layout.histogram()
            .bins(x.ticks(30))
            (values);

        var yMax = d3.max(data, function (d) {
            return d.length
        });
        var yMin = d3.min(data, function (d) {
            return d.length
        });
        var colorScale = d3.scale.linear()
            .domain([yMin, yMax])
            .range([d3.rgb(color).brighter(), d3.rgb(color).darker()]);

        var y = d3.scale.linear()
            .domain([0, yMax])
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var svg = d3.select("#distributionContainer").append("svg")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 750 150")
            .classed("chartcontainer-pool-d3-content", true)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var bar = svg.selectAll(".bar")
            .data(data)
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function (d) {
                return "translate(" + x(d.x) + "," + y(d.y) + ")";
            });

        bar.append("rect")
            .attr("x", 1)
            .attr("width", (x(data[0].dx) - x(0)) - 1)
            .attr("height", function (d) {
                return height - y(d.y);
            })
            .attr("fill", function (d) {
                return colorScale(d.y)
            });

        bar.append("text")
            .attr("dy", ".75em")
            .attr("y", -12)
            .attr("x", (x(data[0].dx) - x(0)) / 2)
            .attr("text-anchor", "middle")
            .text(function (d) {
                if(d != 0) {
                    return formatCount(d.y);
                } else {
                    return '';
                }
            });

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
    });

    function ticker3() {
        dataService.getData("/pool/chart/miners", function(data){

            data = _.forEach(data, function(element) {
                element.ts = new Date(element.ts);
            });

            $scope.poolMinersChart = {
                datasets: { global: data },
                options: {
                    series: [
                        {"axis":"y","id":"global","dataset":"global","label":"Total Pool Miners","key":"cn","color":"green","type":["line","area"]}
                    ],
                    allSeries: [],
                    axes: {
                        x: {
                            key: "ts",
                            type: "date"
                        }
                    }
                }
            }
        });
    }

    timerService.register(ticker, 'poolHashrateChart');
    ticker();

    timerService.register(ticker2, 'poolMinersChart');
    ticker2();

    timerService.register(ticker3, 'poolEffortChart');
    ticker3();

    $scope.$on("$routeChangeStart", function () {
        timerService.remove("poolHashrateChart");
    });

    $scope.$on("$routeChangeStart", function () {
        timerService.remove("poolMinersChart");
    });

    $scope.$on("$routeChangeStart", function () {
        timerService.remove("poolEffortChart");
    });
});
