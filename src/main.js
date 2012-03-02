$(function() {
    var teams = ['juve', 'milan']; // declare team names to match names of respective csv files.

    // draw team data inside element.
    var drawTable = function(team, element) {
        data = 'assets/data/' + team + '-goals.csv';
        d3.text(data, function(datasetText) {
        var csv = d3.csv.parseRows(datasetText);
        var header = csv.splice(0, 1);
        csv.forEach(function(o) {
            o[0] = parseInt(o[0]);
            o[2] = Date.parse(o[2]);
            o[7] = parseInt(o[7]);
        });
        csv = header.concat(csv);
        d3.select(element).selectAll('ul') // each row is an unsorted list
            .data(csv)
            .enter().append('ul')
            .html(function(d) {
                var row = $('<ul>');
                for(e in d) {
                    if(e==2) {
                        d[e] = d[e].toString('MMM-d-yyyy');
                    }
                    row.append($('<li>').text(d[e])); // each data point is a list element
                }
                return row.html();
            });
        });
    }

    // create anchor tags to select teams
    for(t in teams) {
        $('#control').append($('<a>').attr({'href':(teams[t]), 'class':'nav'}).text(teams[t]));
    }
    // handle click event on anchor tag
    $('#control a.nav').click(function(e) {
        e.preventDefault(); // prevent navigation
        $('#control a.nav').each(function() {
            $(this).removeClass('selected'); // mark all anchor tags as deslected
        });
        $(this).addClass('selected'); // mark this anchor tag as selected
        $('#table').empty(); // empty existing table
        drawTable($(this).attr('href'), '#table'); // draw table for this team
    });

    // initialize by clicking the first anchor tag
    $('#control a.nav').first().click();
});
