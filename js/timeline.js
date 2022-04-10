/* * * * * * * * * * * * * *
*          timeline         *
* * * * * * * * * * * * * */


class Timeline{

    constructor(parentElement, source_align, translation_align, sent_order) {
        this.parentElement = parentElement;
        this.source_align = source_align;
        this.translation_align = translation_align;
        this.cur_source_align = "mi";
        this.cur_translation_align = "my";
        this.sent_order = sent_order;
        this.initVis()
    }

    initVis() {
        let vis = this;
        vis.margin = {top: 20, right: 40, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = 100 - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'alignmentTooltip')


        vis.line = vis.svg.append("line");
        vis.line
            .attr("x1", 0)
            .attr("x2", vis.width)
            .attr("y1", 30)
            .attr("y2",30)
            .attr("stroke","black");

        vis.updateVis(vis.cur_source_align, vis.cur_translation_align);
    }

    updateVis(s, t){
        let vis = this;
        vis.cur_source_align = s;
        vis.cur_translation_align =t;

        let source_length = vis.sent_order['srcSentsInOrder'].length
        let translation_length = vis.sent_order['tgtSentsInOrder'].length
        vis.scale_source = d3.scaleLinear()
            .domain([0, source_length])
            .range([0, vis.width]);
        vis.scale_translation = d3.scaleLinear()
            .domain([0, translation_length])
            .range([vis.margin.left, vis.width]);


        vis.data_source = vis.source_align[vis.cur_source_align][1];
        vis.data_translation =vis.translation_align[vis.cur_translation_align][2];

        let timeline_dots_source = vis.svg.selectAll('.timeline_dots_source')
            .data(vis.data_source)

        timeline_dots_source.enter()
            .append('circle')
            .attr("class", "timeline_dots_source")
            .merge(timeline_dots_source)
            .attr("cx", function(d){return vis.scale_source(d)})
            .attr("cy", 10)
            .attr("r", 5)
            .attr("fill", "lightgrey")

        timeline_dots_source.exit().remove()

        let timeline_dots_translation = vis.svg.selectAll('.timeline_dots_translation')
            .data(vis.data_translation)

        timeline_dots_translation.enter()
            .append('circle')
            .attr("class", "timeline_dots_translation")
            .merge(timeline_dots_translation)
            .attr("cx", function(d){return vis.scale_translation(d)})
            .attr("cy", 50)
            .attr("r", 5)
            .attr("fill", "grey")

        timeline_dots_translation.exit().remove()


    }
}