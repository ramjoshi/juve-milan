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

    // Returns data that falls in the from-to year range.
    function dataInYearRange(data, from, to) {
        return _.filter(data, function(row) {
            var year = parseInt(row[columnIndex('date')].toString('yyyy'));
            return (year >= from && year <= to);
        });
    }

    /* 
     * Groups data by year in the from-to year range.
     * From-to are integers representing years.
     */
    function yearlyData(data, from, to) {
        return _.groupBy(dataInYearRange(data, from, to), function(row) {
                return row[columnIndex('date')].toString('yyyy');
        });
    }

    /*
     * Groups data by minute in the from-to year range.
     */
    function minutelyData(data, fromYear, toYear) {
        return _.groupBy(dataInYearRange(data, fromYear, toYear), function(row) {
            return row[columnIndex('min')];
        });
    }

    function updateGraph(dataset) {
        var svg = d3.select("#graph")
                .append("svg")
                .attr("width", 2000)
                .attr("height", 800);
        console.log(dataset);
        svg.selectAll("rect")
            .data(dataset)
            .enter()
            .append("rect")
            .attr("x", function(d, i) {
                return i*10;
            })
            .attr("y", function(d, i) {
                return 800 - i*20;
            })
            .attr("width", 5)
            .attr("height", function(d, i) {
                var goals = 0;
                for(m in yearly[d]) {
                    goals += 1;
                }
                if(goals==9){console.log(d);}
                return goals*20;
            });
    }

    loadData('juve', function(data) {
        updateGraph(yearlyData(data, 1900, 2000));
    });
});
