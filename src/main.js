$(function() {
    var teams = ['juve', 'milan']; // declare team names to match names of respective csv files.

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
            yearly = {};
            _.each(byYear, function(rows, year) {
                var minute = _.groupBy(rows, function(row) {
                    return row[7]
                });
                yearly[year] = minute;
            });
            console.log(yearly);
        });
    }

    loadData('juve');
});
