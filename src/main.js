$(function() {
    var data = {};
    var columns = ['pos', 'comp', 'date', 'match', 'score', 'goalscorer', 'goalkeeper', 'min', 'part']; // csv data columns

    /*
     * Loads csv data from file and invokes callback function.
     */
    var loadData = function(team, callback) {
        var csv = 'assets/data/' + team + '-goals.csv';
        if(data[team]) callback(data[team]); // check cache
        else {
            d3.text(csv, function(datasetText) {
                var dt = d3.csv.parseRows(datasetText);
                var header = dt.splice(0, 1);
                dt.forEach(function(row) {
                    // there must be a less verbose way of applying these functions
                    row[columnIndex('pos')] = parseInt(row[columnIndex('pos')]);
                    row[columnIndex('date')] = Date.parse(row[columnIndex('date')]);
                    row[columnIndex('min')] = parseInt(row[columnIndex('min')]);
                });
                data[team] = dt; // cache data
                callback(dt);
            });
        }
    }

    // Returns the index for a column name
    function columnIndex(column) {
        return _.indexOf(columns, column);
    }

    _.mixin({
        dataInYearRange: function (data, from, to) {
            return _.filter(data, function(row) {
                var year = parseInt(row[columnIndex('date')].toString('yyyy'));
                return (year >= from && year <= to);
            });
        },
        dataInMinuteRange: function (data, from, to) {
            return _.filter(data, function(row) {
                var month = row[columnIndex('min')];
                return (month >= from && month <= to);
            });
        },
        yearlyData: function (data) {
            return _.groupBy(data, function(row) {
                return row[columnIndex('date')].toString('yyyy');
            });
        },
        minutelyData: function (data, from, to) {
            return _.groupBy(data, function(row) {
                return 10*(Math.floor(row[columnIndex('min')]/10)+1);
            });
        },
        maxGoals: function (data) {
            return _.max(data, function(d) {
                return d.length;
            }).length;
        }
    });

    function updateMinutelyGraph(mindata, maxy, align) {
        var svg = d3.select('#graph svg');
        var width = $('#graph svg').width();
        var xunit = width/88;
        var height = $('#graph svg').height();
        var barheight_factor = height*0.9/maxy;
        var data = _.range(10, 110, 10);
        svg.selectAll('rect.'+align)
            .data(data)
            .enter()
            .append('rect').attr('class', align)
            .attr('x', function(d, i) {
                if(align=='left') return 9*i*xunit;
                else return (9*i+4)*xunit;
            })
            .attr('y', function(d, i) {
                if(mindata[d]) return height - mindata[d].length*barheight_factor;
                return height;
            })
            .attr('width', 4*xunit)
            .attr('height', function(d, i) {
                if(mindata[d]) return mindata[d].length*barheight_factor;
                else return 0;
            });
            // x axis
            svg.selectAll('text.x')
            .data(data)
            .enter()
            .append('text').attr('class', 'x')
            .text(function(d, i) {
                return d-10 + 'm - ' + d + 'm';
            })
            .attr('x', function(d, i) {
                return (9*i+2)*xunit
            })
            .attr('y', height+10);
            // y labels
            svg.selectAll('text.y'+align)
            .data(data)
            .enter()
            .append('text').attr('class', 'y'+align)
            .text(function(d, i) {
                return mindata[d].length;
            })
            .attr('x', function(d, i) {
                if(align=='left') return (9*i+1)*xunit;
                else return (9*i+5)*xunit;
            })
            .attr('y', function(d, i) {
                if(mindata[d]) return height + 10 - mindata[d].length*barheight_factor;
                return height;
            })
    }

    function initMinutelyData(team, fromYear, toYear, fromMin, toMin, callback) {
        loadData(team, function(data) {
            var mindata = _.chain(data)
                        .dataInYearRange(fromYear, toYear)
                        .dataInMinuteRange(fromMin, toMin)
                        .minutelyData().value();
            callback(mindata);
        });
    } 

    function initCompare(teamA, teamB, fromYear, toYear, fromMin, toMin) {
        fromYear = fromYear || 1900;
        toYear = toYear || 2000;
        fromMin = fromMin || 0
        toMin = toMin || 100;
        initMinutelyData(teamA, fromYear, toYear, fromMin, toMin, 
                function(dA) {
                    initMinutelyData(teamB, fromYear, toYear, fromMin, toMin, 
                        function(dB) {
                            console.log(dA);
                            console.log(dB);
                            var maxy = Math.max(_.maxGoals(dA), _.maxGoals(dB));
                            updateMinutelyGraph(dA, maxy, 'left', fromMin, toMin);
                            updateMinutelyGraph(dB, maxy, 'right', fromMin, toMin);
                    });
                });
    }

    initCompare('juve', 'milan');
});
