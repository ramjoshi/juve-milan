$(function() {
    var teams = ['juve', 'milan']; // declare team names to match names of respective csv files.
    var years = [];
    var yearly = {};
    var loadData = function(team) {
        data = 'assets/data/' + team + '-goals.csv';
        d3.text(data, function(datasetText) {
            var csv = d3.csv.parseRows(datasetText);
            var header = csv.splice(0, 1);
            csv.forEach(function(o) {
                o[0] = parseInt(o[0]);
                o[2] = Date.parse(o[2]);
                o[7] = parseInt(o[7]);
            });
            byYear = _.groupBy(csv, function(row) {
                return row[2].toString('yyyy');
            });
            _.each(byYear, function(rows, year) {
                var minute = _.groupBy(rows, function(row) {
                    return row[7];
                });
                years.push(year);
                yearly[year] = minute;
            });
            var svg = d3.select("#table")
                .append("svg")
                .attr("width", 2000)
                .attr("height", 800);
            svg.selectAll("rect")
                   .data(years)
                   .enter()
                   .append("rect")
                   .attr("x", function(d, i) {
                       return i*10;
                   })
                   .attr("y", function(d, i) {
                       var goals = 0;
                       for(m in yearly[d]) {
                           goals += 1;
                       }
                       return 800 - goals*20;
                   })
                   .attr("width", 5)
                   .attr("height", function(d, i) {
                       var goals = 0;
                       for(m in yearly[d]) {
                           goals += 1;
                       }
                       if(goals==9){console.log(d);}
                       return goals*20;
                   })
        });
    }

    loadData('juve');
});
