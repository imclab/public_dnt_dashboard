function draw(data, container, format, humanify_numbers, custom_units, splice_from, annotations, show_confidence) {
	var w = 960,
		h = 340,
		xPadding = 18,
		yPadding = 30,
		x_axis_format = "%b";
		//x_axis_format = "%b %e, %Y";
	
	//we always use the div within the container for placing the svg
	container += " div.chart_content";
	
	$(container + " svg").remove();
	
	//for clarity, we reassign
	var which_metric = container;
	
	//update date formats
	$.each(data, function(i, value) {
		data[i].date_raw = value.date;
		data[i].date = +new Date(value.date);
	});
	
    //prepare our scales and axes
    //var xMin = 1,
	//    xMax = Object.keys(data).length,
	var xMin = d3.min(d3.values(data), function(d) { return d.date; }),
	    xMax = d3.max(d3.values(data), function(d) { return d.date; }),
	    //yMin = d3.min(d3.values(data), function(d) { return d.percentage; }),
	    yMin = 0,
	    yMax = d3.max(d3.values(data), function(d) { return d.percentage; });
	
	//todo kruge
	yMax += 0.03;
	xMax += 100000000;
	
	var mean = d3.mean(d3.values(data), function(d) { return d.percentage; });
	
   	/*var xScale = d3.scale.ordinal()
        .domain(d3.keys(data))
		.rangeBands([xPadding+16, w+10]); */
		
	var xScale = d3.time.scale()
        .domain([xMin, xMax])
        .range([xPadding+16, w-xPadding]);
            
    var yScale = d3.scale.linear()
        .domain([yMin, yMax])
        .range([h-yPadding+2, yPadding-6]);
            
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .tickFormat(d3.time.format(x_axis_format))
        .ticks(15);
        
	$(".x g text").attr("text-anchor", "left");
   
            
	var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .tickFormat(d3.format(format))
        .ticks(7);
            
    //draw svg
	var svg = d3.select(container)
        .append("svg")
        .attr("width", w)
        .attr("height", h);
	    	    
    //draw extended ticks (horizontal)
    var ticks = svg.selectAll('.ticky')
    	.data(yScale.ticks(7))
    	.enter()
    		.append('svg:g')
    		.attr('transform', function(d) {
      			return "translate(0, " + (yScale(d)) + ")";
    		})
    		.attr('class', 'ticky')
    	.append('svg:line')
    		.attr('y1', -1)
    		.attr('y2', -1)
    		.attr('x1', yPadding+5)
    		.attr('x2', w-yPadding+8);
    		
	//draw x axis
	var xAxis = svg.append("g")
    	.attr("class", "axis x")
	    .attr("transform", "translate(0," + (h-xPadding-3) + ")")
    	.call(xAxis);
    	    	
	//draw y axis
	svg.append("g")
    	.attr("class", "axis y")
	    .attr("transform", "translate(" + (yPadding+10) + ",0)")
    	.call(yAxis);
    
    //draw left y-axis
    /*svg.append('svg:line')
    	.attr('x1', yPadding+6)
    	.attr('x2', yPadding+6)
    	.attr('y1', yPadding-14)
    	.attr('y2', h-xPadding-5);*/

    //y labels
    /*ticks
    	.append('svg:text')
    		.text(function(d) {
				return d;
			})
		.attr('text-anchor', 'bottom')
		.attr('dy', 125)
		.attr('dx', -4);
	*/

	var area = d3.svg.area()
		    .interpolate("basis")
    		.x(function(d) { return xScale(d.date); })
		    .y0(function(d) { return yScale(0); })
		    .y1(function(d) { return yScale(d.percentage); });
	    
		svg.selectAll(".area")
    	    .data(d3.values(data))
      		.enter().insert("svg:path", ".area_line")
		        .attr("class", "area")
    		    //.attr("transform", function(d) { return "translate(0," + (data * (h / 4 - 20)) + ")"; })
        		.attr("d", area(data))
        		.style("opacity", 0.9)
	        	.style("fill", "#e8e8e8")
	    	    .style("fill-opacity", 1);
	    	    
	//extended ticks (vertical)
    ticks = svg.selectAll('.tickx')
    	.data(xScale.ticks(21))
    	.enter()
    		.append('svg:g')
    			.attr('transform', function(d, i) {
				    return "translate(" + (xScale(d)) + ", 0)";
			    })
			    .attr('class', 'tickx');
	
	//draw y ticks
    ticks.append('svg:line')
    	//.attr('y1', h-xPadding)
    	.attr('y1', h-xPadding)
    	.attr('y2', h-xPadding-7)
    	.attr('x1', 0)
    	.attr('x2', 0);
	    	    
	//draw the line		
	var line = d3.svg.line()
		.interpolate("basis")
		.x(function(d,i) { return xScale(d.value.date); })
		.y(function(d) {
			 return yScale(d.value.percentage);
		});

	var paths = svg.append("svg:path")	
	    .attr("class", "default_path_format")
    	.attr("d", function() {
	    	return line(d3.entries(data));
    	});
    
    //draw mean line	
    /*svg.append("svg:line")
	    .attr("class", "mean_line")
	    .style("opacity", 0.9)
		.attr("stroke-dasharray","1,3")
    	.attr('y1', yScale(mean))
		.attr('y2', yScale(mean))
		.attr('x1', xScale(xMin)-3)
		.attr('x2', xScale(xMax));
		
	d3.select(which_metric + " svg")
		.append('svg:text')
			.attr("class", "mean_text")
			.text("avg")
    		.attr('y', yScale(mean)+3)
			.attr('x', xScale(xMax)+4);*/
    	
    //x-axis text	
    /*d3.select(which_metric + " svg")
		.append("text")
			.text("release")					
			.attr("x", function() { return w-41; })
			.attr("y", function() { return h; })
			.attr("fill", "#cccccc")
			.style("font-size", "10px")
			.style("cursor", "default");*/

	//draw points
	var circle = svg.selectAll("circle")
   		.data(d3.values(data))
   		.enter()
   			.append("circle")
   			.attr('class', function(d,i) { return "point_" + i + " point"; })
   			.attr('opacity', 1)
   			.attr("cx", function(d) {
        		return xScale(d.date);
   			})
   			.attr("cy", function(d) { 
   				return yScale(d.percentage);
   			})
   			.attr("r", 4)
   			.each(function(d, i) {
   					var date = new Date(d.date*1000);
   				
   					var ze_date = date.getFullYear() 
							+ "-" + ('0' + (date.getMonth()+1)).slice(-2)
							+ "-" + ('0' + date.getDate()).slice(-2);

   					if("undefined" != typeof annotations[ze_date]) {
						//add a vertical line at that point
						d3.select(which_metric + " svg")
							.append('svg:line')
								.attr("class", "annotation_line")
						    	.attr("stroke-dasharray","1,3")
    							.attr('y1', 17)
							    .attr('y2', h-15)
							    .attr('x1', xScale(d.date))
							    .attr('x2', xScale(d.date));
							    
						d3.select(which_metric + " svg")
							.append('svg:text')
								.attr("class", "annotation_text")
								.text(annotations[ze_date].annotation)
    							.attr('y', 24)
							    .attr('x', xScale(d.date)+4);
					}
					
					//a transparent copy of each rect to make it easier to hover over rects
					svg.append('rect')
		    			.attr('shape-rendering', 'crispEdges')
		    			.style('opacity', 0)
			    		.attr('x', function() {
			    			//TODO
			    			//subtract from width/2 to shift rect to middle of point rather than from left edge of point
			    			return xScale(d.date) - (((w-xPadding)/data.length)/2);
			    		})
    					.attr('y', 0)
	    				.attr("class", function() { return "trans_rect_" + i + " trans_rect"; })
	    				.attr('width', function() {
	    					return ((w-xPadding)/data.length); //place transp rect in middle
			    		})
				    	.attr('height', h-yPadding+2) //height of transparent bar
				    	.on('mouseover.tooltip', function(d_local) {
				    		d3.select(".tooltip_box").remove();
				    		//$(".point").hide();
				    		//$(".point_" + i).show();
				    		
				    		//todo
				    		//$(".tickx line").attr("y2", 0);
				    	
							d3.selectAll(".tooltip").remove();
							d3.selectAll(".tooltip_date").remove();
							
							var formatted_date = Date.parse(d.date_raw).toString('MMM yyyy');
							
							$("#tooltip")
	      						.show()
					      		.html((d.percentage*100).toFixed(2) + "%<br /><span style='font-size:13px'>" + formatted_date + "</span>")
					      		.css("left", (d3.event.pageX-40) + "px")
					      		.css("top", yScale(d.percentage)+110 + "px")
								
				});
			});
}


function drawSparkLine(data, container) {
	if(data == undefined) return;
	
	var w = 230,
		h = 35,
		xPadding = 0,
		yPadding = 10,
		x_axis_format = "%b %e";
	
	//for clarity, we reassign
	var which_metric = container;

	//update date formats
	/*$.each(data, function(i, value) {	
		data[i].date = +new Date(value.date);
	});	
	data.sort(function(a,b){return a.date - b.date});*/
	
    //prepare our scales and axes
	var xMin = d3.min(d3.values(data), function(d) { return d.date; }),
	    xMax = d3.max(d3.values(data), function(d) { return d.date; }),
	    yMin = d3.min(d3.values(data), function(d) { return d.percentage; }),
	    yMax = d3.max(d3.values(data), function(d) { return d.percentage; });
	    	
	//add some padding
	yMax+= 0.1;
			
	var xScale = d3.time.scale()
        .domain([xMin, xMax])
        .range([xPadding+16, w-xPadding]);
            
    var yScale = d3.scale.linear()
        .domain([yMin, yMax])
        .range([h-yPadding+2, yPadding-6]);
            
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .tickFormat(d3.time.format(x_axis_format))
        .ticks(10);
	$(".x g text").attr("text-anchor", "left");
            
	var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .tickFormat(d3.format("%"))
        .ticks(4);
            
    //draw svg
	var svg = d3.select(container)
        .append("svg")
        .attr("width", w)
        .attr("height", h);
    		
	//draw x axis
	var xAxis = svg.append("g")
    	.attr("class", "axis x")
	    .attr("transform", "translate(-26," + (h-xPadding-3) + ")")
    	.call(xAxis);
    	    	
	//draw y axis
	svg.append("g")
    	.attr("class", "axis y")
	    .attr("transform", "translate(" + (yPadding+10) + ",0)")
    	.call(yAxis);

	//draw the line		
	var line = d3.svg.line()
		.interpolate("basis")
		.x(function(d,i) { return xScale(d.value.date); })
		.y(function(d) {
			 return yScale(d.value.percentage);
		});

	var paths = svg.append("svg:path")
	    .attr("class", "the_glorious_line default_path_format")
    	.attr("d", function() {
	    	return line(d3.entries(data));
    	});

	//draw points
	var circle = svg.selectAll("circle")
   		.data(d3.values(data))
   		.enter()
   			.append("circle")
   			.attr('class', function(d,i) { return "point_" + i + " point"; })
   			.attr('opacity', 1)
   			.attr("cx", function(d) {
        		return xScale(d.date);
   			})
   			.attr("cy", function(d) { 
   				return yScale(d.percentage);
   			})
   			.attr("r", 0);
}