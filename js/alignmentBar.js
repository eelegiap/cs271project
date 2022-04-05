/* * * * * * * * * * * * * *
*          alignmentBar          *
* * * * * * * * * * * * * */

//make the rectangle

class AlignmentBar {

    constructor(parentElement, source_align, translation_align, sent_order) {
        this.parentElement = parentElement;
        this.source_align = source_align;
        this.translation_align = translation_align;
        this.cur_source_align = "en";
        this.cur_translation_align = "in";
        this.sent_order = sent_order;
        this.initVis()
    }

    initVis() {
        let vis = this;
        vis.margin = {top: 8, right: 40, bottom: 5, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'alignmentTooltip')

        vis.colors = ["lightgrey", "darkgrey","grey",];

        vis.cur_sent_idx = -1;

        let button = document.createElement('button');
        button.textContent = "Next Example"
        button.id = "nextAlign";
        button.onclick = function(event){vis.showNextExample()}
        let cont = document.getElementById("nextButton")
        cont.append(button)

        vis.updateVis(vis.cur_source_align, vis.cur_translation_align);

    }



    updateVis(s, t){
        let vis = this;

        vis.cur_source_align = s;
        vis.cur_translation_align =t;

        vis.wrangleData();

        let lengths = [];
        vis.data.forEach(function (d){lengths.push(vis.scale(d[1]))});
        const cumulativeSum = (sum => value => sum += value)(0);
        let pos = lengths.map(cumulativeSum);
        pos.unshift(0)

        let align_rects = vis.svg.selectAll('.align_rects')
            .data(vis.data )

        align_rects.enter()
            .append('rect')
            .attr("class", "align_rects")
            .merge(align_rects)
            .attr("width", function(d, i){return lengths[i]})
            .attr("height", 20)
            .attr("x", function(d, i){return pos[i]})
            .attr("fill", function (d, i){return vis.colors[i]})
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', 'black')
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 40 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                         <div style="border: thin solid grey; border-radius: 5px; padding: 20px">
                             <p>${d[0]}<p>
                             <p>${d[1]} times<p>
                         </div>`)
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '0px')

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .on('click', function (event, d){
                let title_cont = document.getElementById("alignmentTitle")
                while(title_cont.firstChild){
                    title_cont.removeChild(title_cont.firstChild);
                }
                let title = document.createElement('p');
                title.textContent = d[0];
                title.setAttribute("style", "color:gray");
                title_cont.appendChild(title);

                vis.cur_sent_idx = -1;
                vis.pairs_to_print = [];
                for (let i = 0; i < d[3].length; i++) {
                    vis.pairs_to_print.push(vis.sent_order["srcSentsInOrder"]["text"][d[3][i]] + '<br>' + vis.sent_order["tgtSentsInOrder"]["text"][d[4][i]]);
                }
                vis.showNextExample();
        });
        let d = vis.data[1];
        let title_cont = document.getElementById("alignmentTitle")
        while(title_cont.firstChild){
            title_cont.removeChild(title_cont.firstChild);
        }
        let title = document.createElement('p');
        title.setAttribute("style", "color:gray");
        title.textContent = d[0];
        title_cont.appendChild(title);

        vis.cur_sent_idx = -1;
        vis.pairs_to_print = [];
        for (let i = 0; i < d[3].length; i++) {
            vis.pairs_to_print.push(vis.sent_order["srcSentsInOrder"]["text"][d[3][i]] + '<br>' + vis.sent_order["tgtSentsInOrder"]["text"][d[4][i]]);
        }
        vis.showNextExample();
        align_rects.exit().remove()

    }

    wrangleData(){
        let vis = this;
        let ab = vis.getOccurrence(vis.source_align[vis.cur_source_align][0], vis.cur_translation_align);
        let anotb = vis.source_align[vis.cur_source_align][0].length - ab;
        let bnota = vis.translation_align[vis.cur_translation_align][0].length - ab;

        let idx_ab = vis.getIndex(vis.source_align[vis.cur_source_align][0], vis.cur_translation_align);
        let idx_anotb = vis.getNotIndex(vis.source_align[vis.cur_source_align][0], vis.cur_translation_align);
        let idx_bnota = vis.getNotIndex(vis.translation_align[vis.cur_translation_align][0], vis.cur_source_align);

        let str_ab = vis.cur_source_align + " translated as " + vis.cur_translation_align;
        let str_anotb= vis.cur_source_align + " not translated as " + vis.cur_translation_align;
        let str_bnota= vis.cur_translation_align+ " not translated as "+ vis.cur_source_align;


        vis.scale = d3.scaleLinear()
            .domain([0, ab + anotb + bnota])
            .range([0, vis.width]);


        vis.data = [[str_anotb, anotb, idx_anotb, [], []], [str_ab, ab, idx_ab, [], []], [str_bnota, bnota, idx_bnota, [], []]];


        idx_anotb.forEach(function (element) {
            vis.data [0][3].push(vis.source_align[vis.cur_source_align][1][element]);
            vis.data [0][4].push(vis.source_align[vis.cur_source_align][2][element]);
        });

        idx_ab.forEach(function (element) {
            vis.data [1][3].push(vis.source_align[vis.cur_source_align][1][element]);
            vis.data [1][4].push(vis.source_align[vis.cur_source_align][2][element]);

        });

        idx_bnota.forEach(function (element) {
            vis.data [2][3].push(vis.translation_align[vis.cur_translation_align][1][element]);
            vis.data [2][4].push(vis.translation_align[vis.cur_translation_align][2][element]);
        });
    }

    showNextExample(){
        let vis = this;
        if(vis.cur_sent_idx < vis.pairs_to_print.length - 1) {
            vis.cur_sent_idx += 1;
        }
        else{
            vis.cur_sent_idx = 0;
        }
        let cont = document.getElementById("textArea")
        cont.removeChild(cont.firstChild);

        let ul = document.createElement('ul');
        ul.setAttribute("style", "list-style-type:none");
        if(typeof vis.pairs_to_print != "undefined" && vis.pairs_to_print.length != 0){
            let li = document.createElement('li');     // create li element.
            li.innerHTML = vis.pairs_to_print[vis.cur_sent_idx];      // assigning text to li using array value.
            ul.appendChild(li);     // append li to ul.
            cont.insertBefore(ul, cont.firstChild);
        }
    }
    getOccurrence(array, value) {
        return array.filter((v) => (v === value)).length;
    }

    getIndex(array, true_align){
        return array.reduce(function(arr, value, i) {
            if (value == true_align) arr.push(i);
            return arr;
        }, []);
    }

    getNotIndex(array, true_align){
        return array.reduce(function(arr, value, i) {
            if (value != true_align) arr.push(i);
            return arr;
        }, []);
    }
}