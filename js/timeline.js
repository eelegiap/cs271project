/* * * * * * * * * * * * * *
*          timeline         *
* * * * * * * * * * * * * */


class Timeline{

    constructor(parentElement, source_align, translation_align, sent_order) {
        this.parentElement = parentElement;
        this.source_align = source_align;
        this.translation_align = translation_align;
        this.cur_source_align = sent_order.srcSentsInOrder[0].tokens[0].lemma.toLowerCase().trim();
        this.cur_translation_align = sent_order.tgtSentsInOrder[0].tokens[0].lemma.toLowerCase().trim();
        this.sent_order = sent_order;
        this.initVis()
    }

    initVis() {
        let vis = this;

        vis.shift = 100;

        vis.margin = {top: 5, right: 20, bottom: 20, left: 0};
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
            .attr("x1", vis.shift)
            .attr("x2", vis.width)
            .attr("y1", 30)
            .attr("y2",30)
            .attr("stroke","black");

        vis.src_label = vis.svg.append("text");
        vis.src_label.text(vis.cur_source_align)
            .attr("style", "vertical-align: middle;")
            .attr("y", 15)
            .attr("x", 0)

        vis.trans_label = vis.svg.append("text");
        vis.trans_label.text(vis.cur_translation_align)
            .attr("style", "vertical-align: middle;")
            .attr("y", 55)
            .attr("x", 0)

        vis.updateVis(vis.cur_source_align, vis.cur_translation_align);
    }

    updateVis(s, t){
        let vis = this;
        vis.cur_source_align = s;
        vis.cur_translation_align = t;

        vis.src_label.text(vis.cur_source_align)
        vis.trans_label.text(vis.cur_translation_align)

        let source_length = vis.sent_order['srcSentsInOrder'].length
        let translation_length = vis.sent_order['tgtSentsInOrder'].length
        vis.scale_source = d3.scaleLinear()
            .domain([0, source_length])
            .range([vis.margin.left+vis.shift, vis.width]);
        vis.scale_translation = d3.scaleLinear()
            .domain([0, translation_length])
            .range([vis.margin.left+vis.shift, vis.width]);


        vis.data_source = vis.source_align[vis.cur_source_align][1];
        vis.data_translation =vis.translation_align[vis.cur_translation_align][2];

        vis.src_token_idxs = vis.translation_align[vis.cur_translation_align][3];
        vis.tgt_token_idxs = vis.source_align[vis.cur_source_align][3];

        let timeline_dots_source = vis.svg.selectAll('.timeline_dots_source')
            .data(vis.data_source)

        timeline_dots_source.enter()
            .append('circle')
            .attr("class", "timeline_dots_source")
            .merge(timeline_dots_source)
            .attr('id', function(d,i) {
                var sentidx = d;
                var tokenidx = vis.tgt_token_idxs[i]
                return `sent${sentidx}dot${tokenidx}`
            })
            .attr("cx", function(d){return vis.scale_source(d)})
            .attr("cy", 10)
            .attr("r", 5)
            .attr("fill", "rgb(31,121,211)")
            .style('cursor','pointer')

        timeline_dots_source.exit().remove()

        timeline_dots_source.on('click', function() {
            var dotID = d3.select(this).attr('id')
            var tokenIdx = dotID.split('dot')[1]
            var sentIdx = dotID.split('dot')[0].replace('sent','')
            var element = document.getElementById(`srcsent${sentIdx}span${tokenIdx}`)
            element.scrollIntoView();
            
            const y = element.getBoundingClientRect().top + window.scrollY;
            window.scroll({
            top: y,
            behavior: 'smooth'
            });
        })

        let timeline_dots_translation = vis.svg.selectAll('.timeline_dots_translation')
            .data(vis.data_translation)

        timeline_dots_translation.enter()
            .append('circle')
            .attr("class", "timeline_dots_translation")
            .merge(timeline_dots_translation)
            .attr("cx", function(d){return vis.scale_translation(d)})
            .attr("cy", 50)
            .attr("r", 5)
            .attr("fill", "rgb(209,38,38)")

        timeline_dots_translation.exit().remove()


    }
}