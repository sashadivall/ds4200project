// Load CSV and parse
d3.csv('./ai_generated_code_new.csv').then(function(data) {
    // Convert relevant fields to numeric values
    data.forEach(function(d) {
        d.num_loops = +d.num_loops;
        d.execution_time_ms = +d.execution_time_ms;
        d.num_parameters = +d.num_parameters;
        d.model = d.model; // Ensure model is retained
    });

    const margin = { top: 50, right: 50, bottom: 120, left: 50 },
          width = 700 - margin.left - margin.right,
          height = 400 - margin.top - margin.bottom;

    const colorScale = d3.scaleSequential(d3.interpolatePurples)
        .domain([d3.min(data, d => d.execution_time_ms), d3.max(data, d => d.execution_time_ms)]);

    // Create SVG
    const svg = d3.select("#heatmap").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Create tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Group data by model and loops
    const groupedData = d3.group(data, d => d.model, d => d.num_loops);

    // Get sorted loops and models
    const sortedLoops = Array.from(new Set(data.map(d => d.num_loops))).sort((a, b) => a - b);
    const sortedModels = Array.from(new Set(data.map(d => d.model)));

    // X and Y axes scales
    const xScale = d3.scaleBand()
        .domain(sortedLoops)
        .range([0, width])
        .padding(0.05);

    const yScale = d3.scaleBand()
        .domain(sortedModels)
        .range([0, height])
        .padding(0.05);

    // Add X axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).tickSize(0))
        .selectAll(".tick text")
        .style("font-size", "14px")
        .attr("class", "axis-label");

    // Add Y axis
    svg.append("g")
        .call(d3.axisLeft(yScale).tickSize(0))
        .selectAll(".tick text")
        .style("font-size", "14px")
        .attr("class", "axis-label");

    // Create heatmap cells
    const cells = svg.selectAll(".cell")
        .data(data)
        .enter().append("rect")
        .attr("class", "cell")
        .attr("x", d => xScale(d.num_loops))
        .attr("y", d => yScale(d.model))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .style("fill", d => colorScale(d.execution_time_ms))
        .style("stroke", "lightgray")
        .on("mouseover", function(event, d) {
            const avgParams = d3.mean(groupedData.get(d.model).get(d.num_loops), d => d.num_parameters).toFixed(2);
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("Model: " + d.model + "<br>Loops: " + d.num_loops + "<br>Execution Time: " + d.execution_time_ms.toFixed(2) + " ms<br>Avg Parameters: " + avgParams)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Add chart title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("class", "title")
        .text("Heatmap: Execution Time vs Loops by Model");

    // Add color legend
    const legendWidth = 300;
    const legendHeight = 20;
    const legendMargin = {top: 20, right: 0, bottom: 50, left: 0};

    const legend = svg.append("g")
        .attr("transform", "translate(" + (width / 2 - legendWidth / 2) + "," + (height + legendMargin.top) + ")");
    
    const legendScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.execution_time_ms), d3.max(data, d => d.execution_time_ms)])
        .range([0, legendWidth]);

    // Add legend gradient
    const gradient = legend.append("defs").append("linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("x2", "100%")
        .attr("y1", "0%")
        .attr("y2", "0%");

    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", d3.interpolatePurples(0));

    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", d3.interpolatePurples(1));

    legend.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#gradient)");

    // Add legend ticks
    const tickCount = 5;  // Number of ticks
    const ticks = d3.range(d3.min(data, d => d.execution_time_ms), d3.max(data, d => d.execution_time_ms), (d3.max(data, d => d.execution_time_ms) - d3.min(data, d => d.execution_time_ms)) / tickCount);
    legend.selectAll(".tick")
        .data(ticks)
        .enter().append("line")
        .attr("x1", d => legendScale(d))
        .attr("x2", d => legendScale(d))
        .attr("y1", 0)
        .attr("y2", legendHeight)
        .style("stroke", "black")
        .style("stroke-width", 0.5);

    // Add legend labels
    legend.selectAll(".tick-label")
        .data(ticks)
        .enter().append("text")
        .attr("x", d => legendScale(d))
        .attr("y", legendHeight + 15)
        .attr("text-anchor", "middle")
        .text(d => d.toFixed(2));

    // Add legend label
    legend.append("text")
        .attr("x", legendWidth / 2)
        .attr("y", legendHeight + 30)
        .style("text-anchor", "middle")
        .text("Execution Time (ms)");
    
}).catch(function(error) {
    console.error('Error loading the CSV file:', error);
});