/*
 * sentHistogram - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the bar charts
 * @param _data				-- the dataset of words and their associated frequencies
 * @param _config			-- whether the data set is the translation or source
 */
let sentData;
// let splAmt = 5;
// let rectClassName;
// let rectLabelClassName;

class sentHistogram {

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


        // set the dimensions and margins of the graph
        vis.margin = { top: 10, right: 50, bottom: 50, left: 50 },

        // Dynamically instantiate width and height of vis
        vis.width = (document.getElementById('analysispanel').getBoundingClientRect().width - 200) - (vis.margin.left - vis.margin.right);
        vis.height = (document.getElementById('analysispanel').getBoundingClientRect().height * .5) - (vis.margin.top - vis.margin.bottom);

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // X axis: scale and draw:
        vis.x = d3.scaleLinear()
            .range([0, vis.width]);

        vis.svg.append("g")
            .attr("class", "x-axis axis");

        // Y axis: scale and draw:
        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);


        vis.svg.append("g")
            .attr("class", "x-axis axis");


        vis.svg.append("g")
            .attr("class", "y-axis axis");

        vis.tooltipH = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);


        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }

    /*
     * Data wrangling
     */

    wrangleData() {
        let vis = this;

        sentData = vis.data;

        vis.updateVis();

    }

    /*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * */

    updateVis() {
        let vis = this;

        // Exit data
        // vis.svg.selectAll(".label-text").remove();
        vis.svg.selectAll("rect").remove();

        vis.x.domain([0, 100])

        // set the parameters for the histogram
        vis.histogram = d3.histogram()
            .value(function (d) { return d; })   // I need to give the vector of value
            .domain(vis.x.domain())  // then the domain of the graphic
            .thresholds(vis.x.ticks(20)); // then the numbers of bins

        // And apply this function to data to get the bins
        vis.bins = vis.histogram(vis.data);

        // update y domain
        vis.y.domain([0, d3.max(vis.bins, function (d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously


        // // (2) Draw rectangles
        vis.rects = vis.svg.selectAll("rect")
            .data(vis.bins)
            .join("rect")
            .attr("x", 1)
            .attr("transform", function (d) { return `translate(${vis.x(d.x0)} , ${vis.y(d.length)})` })
            .attr("width", function (d) { return vis.x(d.x1) - vis.x(d.x0) - 1 })
            .attr("height", function (d) { return vis.height - vis.y(d.length); })
            .attr("fill", "#69b3a2")

        vis.rects.on("mouseover", function (event, d) {


                d3.select(this).transition().duration(200).attr('fill','#00cccc')
                vis.tooltipH.transition()
                    .duration(200)
                    .style("opacity", .9);

                vis.tooltipH.html(`${d.length} sentences of length ${d3.min(d)}-${d3.max(d)}`)
                    .style("left", (event.pageX+10) + "px")
                    .style("top", (event.pageY-10) + "px");
            })
                .on("mouseout", function (d) {
                    d3.select(this).transition().duration(200).attr('fill','#69b3a2')
    
                    vis.tooltipH.transition()
                        .duration(500)
                        .style("opacity", 0);
                });


            // mouseover color 00cccc
        // // (4) Update the y-axis
        vis.svg.select(".y-axis")
            .transition()
            .duration(800)
            .call(d3.axisLeft(vis.y))


        // // (5) Update the x-axis
        vis.svg.select(".x-axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .transition()
            .duration(800)
            .call(d3.axisBottom(vis.x))
    }

    langSelectionChanged(selectData) {
        let vis = this;

        // Set to appropriate language data
        vis.data = selectData;

        // Update the visualization
        vis.wrangleData();
    }
}
