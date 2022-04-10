/*
 * BarChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the bar charts
 * @param _data				-- the dataset of words and their associated frequencies
 * @param _config			-- whether the data set is the translation or source
 */
let displayData;
let splAmt = 5;
let rectClassName;
let rectLabelClassName;

class BarChart {

    constructor(parentElement, data, config) {
        this.parentElement = parentElement;
        this.data = data;
        this.config = config;

        this.initVis();
    }
    /*
     * Initialize visualization (static content; e.g. SVG area, axes)
     */
    initVis() {
        let vis = this;
        vis.margin = {top: 20, right: 100, bottom: 100, left: 100};

        // Dynamically instantiate width and height of vis
        vis.width =  (document.getElementById(this.parentElement).getBoundingClientRect().width) - (vis.margin.left - vis.margin.right);
        vis.height = (document.getElementById(this.parentElement).getBoundingClientRect().height) - (vis.margin.top - vis.margin.bottom);

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Variable that stands in for class name of rectangle graph
        rectClassName = this.config + "-rect";

        // Variable that stands in for class name of rectangle label
        rectLabelClassName = rectClassName + "-label";

        // Append bar to svg
        vis.svg.selectAll(".bar")
            .attr("class", rectClassName);

        // Create y-scale
        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        // Create y-axis
        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        // Create g group for y-axis
        vis.svg.append("g")
            .attr("class", "y-axis axis");

        // Create x-scale
        vis.x = d3.scaleBand()
            .range([0, vis.width]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.svg.append("g")
            .attr("class", "x-axis axis");

        // Labelling axis https://stackoverflow.com/questions/11189284/d3-axis-labeling
        vis.svg.append("text")
            .attr("class", "x label genText")
            .attr("text-anchor", "end")
            .attr("x", vis.width/2)
            .attr("y", vis.height + 50)
            .text("Date");

        vis.svg.append("text")
            .attr("class", "y label genText")
            .attr("text-anchor", "end")
            .attr("y", 6)
            .attr("dy", "-5em")
            .attr("dx", "-5em")
            .attr("transform", "rotate(-90)")
            .text("Weighted Frequency");

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }

    /*
	 * Data wrangling
	 */

    wrangleData() {
        let vis = this;

        displayData = vis.data;

        displayData = displayData.filter(function(d, index) {
            return index < splAmt;
        })

        vis.updateVis();

    }

    /*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * */

    updateVis() {
        let vis = this;

        // Exit data
        vis.svg.selectAll(".label-text").remove();
        vis.svg.selectAll("rect").remove();

        // (1) Update domains
        vis.y.domain([0, d3.max((displayData).map(a => a[1]))]);
        vis.x
            .domain((displayData).map(b => b[0]))
            .padding(0.2);

        // (2) Draw rectangles
        vis.svg.selectAll("." + rectClassName).data(displayData)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("width", (vis.x).bandwidth())
            .attr("x", function(d) { return vis.x(d[0]) })
            .attr("y", function(d) {return ((vis.y(d[1]))); })
            .transition() // <---- Here is the transition
            .duration(2000) // 2 seconds
            .attr("height", function(d) {return (vis.height - (vis.y(d[1]))); })
            .attr("fill", "#00FFFF");

        // (4) Update the y-axis
        vis.svg.select(".y-axis")
            .transition()
            .duration(800)
            .call(vis.yAxis.ticks(3));

        // (5) Update the x-axis
        vis.svg.select(".x-axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .transition()
            .duration(800)
            .call(vis.xAxis)
            .selectAll("text")
            .attr("font-size", "small");

    }

    langSelectionChanged(selectData) {
        let vis = this;

        // Set to appropriate language data
        vis.data = selectData;

        // Update the visualization
        vis.wrangleData();
    }

    numbSelectionChanged(selectNumb) {
        let vis = this;

        // Set to appropriate language data
        splAmt = selectNumb;

        // Update the visualization
        vis.wrangleData();
    }
}

