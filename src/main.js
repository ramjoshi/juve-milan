$(function() {
    var columns = ['pos', 'comp', 'date', 'match', 'score', 'goalscorer', 'goalkeeper', 'min', 'part']; // csv data columns

    /*
     * Loads csv data from file and invokes callback function.
     */
    var loadData = function(team, callback) {
        var csv = 'assets/data/' + team + '-goals.csv';
        var data;
        d3.text(csv, function(datasetText) {
            data = d3.csv.parseRows(datasetText);
            var header = data.splice(0, 1);
            data.forEach(function(row) {
                // there must be a less verbose way of applying these functions
                row[columnIndex('pos')] = parseInt(row[columnIndex('pos')]);
                row[columnIndex('date')] = Date.parse(row[columnIndex('date')]);
                row[columnIndex('min')] = parseInt(row[columnIndex('min')]);
            });
            callback(data);
        });
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
                return row[columnIndex('min')];
            });
        },
        maxGoals: function (data) {
            return _.max(data, function(d) {
                return d.length;
            }).length;
        }
    });

    function updateMinutelyGraph(mindata, maxy, align, from, to) {
        from = from || 0;
        to = (to+1) || 101;
        var svg = d3.select("#graph svg");
        var width = $('#graph svg').width();
        var barwidth = width/(3*(2*(to-from)-1));
        var height = $('#graph svg').height();
        var barheight_factor = height*0.9/maxy;
        svg.selectAll('rect.'+align)
            .data(_.range(from, to))
            .enter()
            .append("rect").attr('class', align)
            .attr("x", function(d, i) {
                if(align=='left') return 6*i*barwidth;
                else return (2+6*i)*barwidth;
            })
            .attr("y", function(d, i) {
                if(mindata[d]) return height - mindata[d].length*barheight_factor;
                return height;
            })
            .attr("width", barwidth)
            .attr("height", function(d, i) {
                if(mindata[d]) return mindata[d].length*barheight_factor;
                else return 0;
            });
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
        fromMin = fromMin || 0;
        toMin = toMin || 100;
        initMinutelyData(teamA, fromYear, toYear, fromMin, toMin, 
                function(dA) {
                    initMinutelyData(teamB, fromYear, toYear, fromMin, toMin, 
                        function(dB) {
                            var maxy = Math.max(_.maxGoals(dA), _.maxGoals(dB));
                            updateMinutelyGraph(dA, maxy, 'left', fromMin, toMin);
                            updateMinutelyGraph(dB, maxy, 'right', fromMin, toMin);
                    });
                });
    }

    initCompare('juve', 'milan', 1900, 2000, 10, 50);
});
