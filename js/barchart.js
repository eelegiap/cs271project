/*
 * BarChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the bar charts
 * @param _data				-- the dataset of words and their associated frequencies
 * @param _config			-- whether the data set is the translation or source
 */
let displayData;
let splAmt = 15;
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
        vis.margin = { top: 10, right: 50, bottom: 60, left: 50 };

        // Dynamically instantiate width and height of vis
        vis.width = (document.getElementById('analysisCol').getBoundingClientRect().width - 200) - (vis.margin.left - vis.margin.right);
        vis.height = (document.getElementById('analysisCol').getBoundingClientRect().height *.5) - (vis.margin.top - vis.margin.bottom);

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

        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        vis.svg.append("text")
            .attr("class", "y label genText")
            .attr("text-anchor", "right")
            .attr("transform", "rotate(-90)")
            .attr("y", vis.margin.left - 25)
            .attr("x", (0 - vis.height / 2))
            .attr("dy", "-5em")
            .attr("dx", "-5em")
            .text("# of Occurrences in Text");

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }

    /*
     * Data wrangling
     */

    wrangleData() {
        let vis = this;

        displayData = vis.data;

        displayData = displayData.filter(function (d, index) {
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
        vis.y.domain([0, d3.max((displayData).map(a => a.tf))]);
        vis.x
            .domain((displayData).map(b => b.lemma))
            .padding(0.2);

        // (2) Draw rectangles
        vis.bars = vis.svg.selectAll("." + rectClassName).data(displayData)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("width", (vis.x).bandwidth())
            .attr("x", function (d) { return vis.x(d.lemma) })
            .attr("y", function (d) { return ((vis.y(d.tf))); })
        // vis.bars
        //     .transition() // <---- Here is the transition
        //     .duration(1000) // 2 seconds
            .attr("height", function (d) { return (vis.height - (vis.y(d.tf))); })
            .attr("fill", "#69b3a2")

        vis.bars.on("mouseover", function (event, d) {
            d3.select(this).transition().duration(200).attr('fill','#00cccc')
            vis.tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            vis.tooltip.html(`${d.lemma} occurs ${d.tf} times in <br>${d.df} sentences.`)
                .style("left", (event.pageX+5) + "px")
                .style("top", (event.pageY-15) + "px");
        })
            .on("mouseout", function (d) {
                d3.select(this).transition().duration(200).attr('fill','#69b3a2')

                vis.tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // (4) Update the y-axis
        vis.svg.select(".y-axis")
            .transition()
            .duration(800)
            .call(vis.yAxis.ticks(10));

        // (5) Update the x-axis
        vis.svg.select(".x-axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .transition()
            .duration(800)
            .call(vis.xAxis)
            .selectAll("text")
            .attr("font-size", "small")
            .attr('dy', ".5em")
            .attr("dx", ".75em")
            .attr("transform", "rotate(45)")
            .style("text-anchor", "start");
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

