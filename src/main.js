$(function() {
    var teamdata = {};
    var teams = ['milan', 'juve'];
    var columns = ['pos', 'comp', 'date', 'match', 'score', 'goalscorer', 'goalkeeper', 'min', 'part']; // csv data columns
    var _year_range = [1900, 2012];
    var _min_range = [0, 100];
    function init(min_interval) {
        _min_interval = min_interval;
        data = _.range(_min_interval, 110, _min_interval);
        // graph structure 4 unit wide adjacent bars separated by a unit of space
        // |__4__|__4__|-1-|__4__|__4__|
        // which determines this unit of measure _x_factor
        _x_factor = 9*(_min_range[1]/_min_interval)-1;
    }
    init(10); // initialize with a minute interval of 10

    /*
     * Loads csv data from file and invokes callback function.
     */
    var loadData = function(team, callback) {
        var csv = 'assets/data/' + team + '-goals.csv';
        if(teamdata[team]) callback(teamdata[team]); // check cache
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
                teamdata[team] = dt; // cache data
                callback(dt);
            });
        }
    }

    // Returns the index for a column name
    function columnIndex(column) {
        return _.indexOf(columns, column);
    }

    // functions for processing data
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
                return _min_interval*(Math.floor(row[columnIndex('min')]/_min_interval)+1);
            });
        },
        maxGoals: function (data) {
            return _.max(data, function(d) {
                return d.length;
            }).length;
        }
    });

    function barGraph(svg, mindata, align, barheight_factor) {
        var width = $('#graph svg').width();
        var xunit = width/_x_factor;
        var height = $('#graph svg').height();
        svg.selectAll('rect.'+ align)
            .data(data)
            .transition()
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
        // y labels
        svg.selectAll('text.y'+align)
            .data(data)
            .transition()
            .text(function(d, i) {
                if(mindata[d]) return mindata[d].length;
                else return '';
            })
            .attr('x', function(d, i) {
                if(align=='left') return (9*i+1)*xunit;
                else return (9*i+5)*xunit;
            })
            .attr('y', function(d, i) {
                if(mindata[d]) {
                    var y = height + 10 - mindata[d].length*barheight_factor;
                    if(y < height) return y;
                    else return y - 10;
                }
                else return height;
            });
        // x axis
        svg.selectAll('text.x')
            .data(data)
            .transition()
            .text(function(d, i) {
                if(mindata[d]) return d-_min_interval + 'm - ' + d + 'm';
                else return '';
            })
            .attr('x', function(d, i) {
                return (9*i+3)*xunit
            })
            .attr('y', height+10);
    }

    // draw the initial graph
    function draw(mindata, maxy, align) {
        var svg = d3.select('#graph svg');
        var height = $('#graph svg').height();
        var barheight_factor = height*0.9/maxy;
        svg.selectAll('rect.'+align)
            .data(data)
            .enter()
            .append('rect').attr('class', align)
        // y labels
        svg.selectAll('text.y'+align)
            .data(data)
            .enter()
            .append('text').attr('class', 'y'+align)
        // x axis
        svg.selectAll('text.x')
            .data(data)
            .enter()
            .append('text').attr('class', 'x');
        barGraph(svg, mindata, align, barheight_factor);
    }

    // interactively redraw the graph
    function redraw(mindata, align) {
        var svg = d3.select('#graph svg');
        var height = $('#graph svg').height();
        var barheight_factor = height*0.9/_maxy;
        barGraph(svg, mindata, align, barheight_factor);
    }

    // make those graphs work
    function processData(data, fromYear, toYear, fromMin, toMin) {
        return _.chain(data)
                .dataInYearRange(fromYear, toYear)
                .dataInMinuteRange(fromMin, toMin)
                .minutelyData().value();
    }

    //var _minutelyData = {}; // a global var to store current data
    function initMinutelyData(team, fromYear, toYear, fromMin, toMin, callback) {
        loadData(team, function(data) {
            var mindata = processData(data, fromYear, toYear, fromMin, toMin);
            //_minutelyData[team] = mindata;
            callback(mindata);
        });
    } 


    function compare(teamA, teamB, fromYear, toYear, fromMin, toMin) {
        _fromYear = fromYear || _year_range[0];
        _toYear = toYear || _year_range[1];
        _fromMin = fromMin || _min_range[0];
        _toMin = toMin || _min_range[1];
        initMinutelyData(teamA, _fromYear, _toYear, _fromMin, _toMin, 
                function(dA) {
                    initMinutelyData(teamB, _fromYear, _toYear, _fromMin, _toMin, 
                        function(dB) {
                            _maxy = Math.max(_.maxGoals(dA), _.maxGoals(dB));
                            draw(dA, _maxy, 'left', fromMin, toMin);
                            draw(dB, _maxy, 'right', fromMin, toMin);
                        });
                });
    }

    function recompare(with_rescale) {
        var dA = processData(teamdata[teams[0]], _fromYear, _toYear, _fromMin, _toMin);
        var dB = processData(teamdata[teams[1]], _fromYear, _toYear, _fromMin, _toMin);
        if(with_rescale) {
            _maxy = Math.max(_.maxGoals(dA), _.maxGoals(dB));
        }
        redraw(dA, 'left');
        redraw(dB, 'right');
    }

    function update_min_interval(min_interval) {
        var empty = {};
        redraw(empty, 'left');
        redraw(empty, 'right');
        var svg = d3.select('#graph svg');
        svg.selectAll('text.x')
        .data(data)
        .transition()
        .text(function(d, i) {
            return '';
        })
        init(min_interval);
        var with_rescale = $('#autoscale').is(':checked');
        recompare(with_rescale);
    }

    // Interactive sliders
    // year
    $('#slider-year').slider({
        range: true,
        min: _year_range[0],
        max: _year_range[1],
        values: _year_range,
        slide: function(event, ui) {
            _fromYear = ui.values[0];
            _toYear = ui.values[1];
            $('#slider-year a.ui-slider-handle').eq(0).text('Year ' + _fromYear);
            $('#slider-year a.ui-slider-handle').eq(1).text('Year ' + _toYear);
            var with_rescale = $('#autoscale').is(':checked');
            recompare(with_rescale);
        }
    });
    $('#slider-year a.ui-slider-handle').eq(0)
        .text('Year ' + $('#slider-year').slider('values', 0));
    $('#slider-year a.ui-slider-handle').eq(1)
        .text('Year ' + $('#slider-year').slider('values', 1));

    // minute
    $('#slider-min').slider({
        range: true,
        min: _min_range[0],
        max: _min_range[1],
        values: _min_range,
        slide: function(event, ui) {
            _fromMin = ui.values[0];
            _toMin = ui.values[1];
            $('#slider-min a.ui-slider-handle').eq(0).text(_fromMin + ' min');
            $('#slider-min a.ui-slider-handle').eq(1).text(_toMin + ' min');
            var with_rescale = $('#autoscale').is(':checked');
            recompare(with_rescale);
        }
    });
    $('#slider-min a.ui-slider-handle').eq(0)
        .text($('#slider-min').slider('values', 0) + ' min');
    $('#slider-min a.ui-slider-handle').eq(1)
        .text($('#slider-min').slider('values', 1) + ' min');

    // minute interval
    $('#slider-min-interval').slider({
        min: 10,
        max: _min_range[1],
        step: 5,
        value: _min_interval,
        slide: function(event, ui) {
            $('#slider-min-interval a.ui-slider-handle').text(ui.value + ' min intervals');
            update_min_interval(ui.value);
        }
    });
    $('#slider-min-interval a.ui-slider-handle').text(_min_interval + ' min intervals');

    compare(teams[0], teams[1]);
});
