$(function(){
    
    var teams = ['juve', 'milan']; // declare team names to match names of respective csv files.
    var years = [];
    var yearly = {};
    var minutes = [];
    var m= {};

    function  loadData(team) {
        data = 'assets/data/' + team + '-goals.csv';
        d3.text(data, function(datasetText) {
            var csv = d3.csv.parseRows(datasetText);
            var header = csv.splice(0, 1);
            csv.forEach(function(o) {
                o[0] = parseInt(o[0]);
                o[2] = Date.parse(o[2]);
                o[7] = parseInt(o[7]);
            });

            byMin = _.groupBy(csv,function(row) {
			return row[7];
    	   });
		console.log(byMin);


	   _.each(byMin, function(rows, minute) {
		   var min = _.groupBy(rows, function(row){
			   return row[7];
		   });
				
		minutes.push(minute);
		m[minute]=min;
	
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
	    //console.log(years);


	   
	    if (team==='juve'){  //Change team corresponding to team of choice. This team will be the upper team
	    var svg = d3.select("#table")
                .append("svg")
                .attr("width", 1000)
                .attr("height", 250)
		
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
                       return 250 - goals*20;
                   })
                   .attr("width", 5)
		   .style("fill","grey")		   
                   .attr("height", function(d, i) {
                       var goals = 0;
                       for(m in yearly[d]) {
                           goals += 1;
                       }
                       if(goals==9){console.log(d);}
                      return goals*20;
		       })
		}

		   else{
		        var svg2 = d3.select("#table")
                		.append("svg")
		                .attr("width", 1000)
        		        .attr("height", 400);
            		svg2.selectAll("rect")
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
                       //return 400 - goals*20;
                   })
                   .attr("width", 5)
		   .style("fill","red")		   
                   .attr("height", function(d, i) {
                       var goals = 0;
                       for(m in yearly[d]) {
                           goals += 1;
                       }
                       if(goals==9){console.log(d);}
                      return goals*20;
		   }
		   )
		 }
	    }
        )};
     for (i=0;i<2;++i){loadData(teams[i]);}  

}

);
