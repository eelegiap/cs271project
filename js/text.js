class TextPanel {

    constructor(sent_order, word_align) {
        this.sent_order = sent_order;
        this.word_align = word_align;
        this.initVis()
    }

    initVis() {
        let vis = this;
// set the dimensions and margins of the graph
        var margin = {top: 30, right: 30, bottom: 70, left: 60},
            width = 400 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        var srcdiv = d3.select("#srctext")
        var tgtdiv = d3.select("#tgttext")

        d3.select('#analysispanel').style('left', parseInt($(window).width() * .68) + 'px').style('position', 'fixed')

        let data = vis.sent_order;
        var srccharcount = 0;
        var tgtcharcount = 0;

        let src_linebreak = 0;
        let tgt_linebreak = 0;

        // APPEND SOURCE SENTENCES
        function spacenospace(tokens, thistoken, j, type_str) {
            if (thistoken.linebreak) {
                if (type_str == "src"){
                    src_linebreak += 1;
                }
                else{
                    tgt_linebreak += 1;
                }
                return thistoken.text + '<br><br>'

            }
            if (j < tokens.length-1) {
                var nexttoken = tokens[j+1]
                if ('.,)?;'.includes(nexttoken.text)) {
                    return thistoken.text
                } 
                if ((':' == nexttoken.text) || '...' == nexttoken.text) {
                    return thistoken.text
                }
                if (('"' == nexttoken.text) && thistoken.text == ':') {
                    return thistoken.text + ' '
                } 
                if (('"' == nexttoken.text) && thistoken.pos == 'PUNCT') {
                    return thistoken.text
                } 
                if (('"' == thistoken.text) && nexttoken.text == '¿') {
                    return thistoken.text
                } 
                if ('¿"'.includes(thistoken.text) && nexttoken.pos != 'PUNCT') {
                    return thistoken.text
                }
            } 
            if ('(¿'.includes(thistoken.text)) {
                return thistoken.text
            }
            return thistoken.text + ' '
        }

        data.srcSentsInOrder.forEach(function (sent, i) {
            srcdiv
                .append('span')
                .attr('id', 'srcsent' + i)
                .attr('class', 'sentence chosen')

            var tokens = data.srcSentsInOrder[i].tokens
            // var tokenshtml = ''
            tokens.forEach(function (t, j) {
                srccharcount += t.text.length
            })

            d3.select('#srcsent' + i)
                .selectAll('span')
                .data(tokens)
                .enter()
                .append('span')
                .attr('id', function (d, j) {
                    return 'srcsent' + i + 'span' + j
                })
                .attr('class', 'token')
                .append('mark')
                .attr('id', function (d, j) {
                    return 'srcsent' + i + 'token' + j
                })
                .html(function (d,j) {
                    return spacenospace(tokens, d, j, "src")
                })
                .style('background-color', 'white')
        })

        // APPEND TARGET SENTENCES
        data.tgtSentsInOrder.forEach(function (sent, i) {
            tgtdiv
                .append('span')
                .attr('id', 'tgtsent' + i)
                .attr('class', 'sentence chosen')

            var tokens = data.tgtSentsInOrder[i].tokens

            tokens.forEach(function (t) {
                tgtcharcount += t.text.length
            })

            d3.select('#tgtsent' + i)
                .selectAll('span')
                .data(tokens)
                .enter()
                .append('span')
                .attr('id', function (d, j) {
                    return ('tgtsent' + i + 'span' + j)
                })
                .attr('class', 'token')
                .append('mark')
                .attr('id', function (d, j) {
                    return ('tgtsent' + i + 'token' + j)
                })
                .html(function (d, j) {
                    return spacenospace(tokens, d, j, "tgt")
                })
                .style('background-color', 'white')
        })
        var totalcharcount = srccharcount + tgtcharcount;

        let line_break = src_linebreak - tgt_linebreak;
        let char_per_break_est = 75;

        // MAKE SURE CORRECT WIDTH
        var srccolwidth = (srccharcount + line_break * char_per_break_est)/ (totalcharcount + line_break * char_per_break_est) * 100;
        var tgtcolwidth = 100 - srccolwidth;


        d3.select("#srccol").attr("style", "width: " + srccolwidth + "%");
        d3.select("#tgtcol").attr("style", "width: " + tgtcolwidth + "%");

        console.log(srccolwidth)
        console.log(tgtcolwidth)

        let wadata = vis.word_align;

        var src2tgt = Object()
        var tgt2src = Object()
        src2tgt['sentences'] = Object()
        src2tgt['tokens'] = Object()
        tgt2src['sentences'] = Object()
        tgt2src['tokens'] = Object()

        // CREATE WORD AND SENTENCE ALIGNMENT LOOKUP
        wadata.forEach(function (s) {
            // sent level
            var i = s.srcsentidx
            var j = s.tgtsentidx
            src2tgt['sentences'][i] = j
            tgt2src['sentences'][j] = i

            // token level
            src2tgt['tokens'][i] = Object()
            tgt2src['tokens'][j] = Object()
            s.alignedwordindices.forEach(function (kl) {
                var k = kl[0];
                var l = kl[1]
                src2tgt['tokens'][i][k] = l
                tgt2src['tokens'][j][l] = k
            })

        })

        // handle radio buttons
        d3.selectAll(("input[name='level']")).on("change", function () {
            if (this.value == 'wordlevel') {
                d3.selectAll('.sentence').classed('chosen', false)
                d3.selectAll('.token').classed('chosen', true)
            } else {
                d3.selectAll('.sentence').classed('chosen', true)
                d3.selectAll('.token').classed('chosen', false)
            }
            switchSidebar(this.value);
        })

        // HOVER SENTENCES
        d3.selectAll('.sentence').on('mouseover', function () {
            var chosenElt = d3.select(this)
            if (chosenElt.classed('chosen')) {
                var chosenID = chosenElt.attr('id')
                var index1 = chosenID.replace('sent', '').replace('src', '').replace('tgt', '')

                if (chosenID.includes('src')) {
                    var which = 'tgt'
                    var index2 = src2tgt['sentences'][index1]
                } else {
                    var which = 'src'
                    var index2 = tgt2src['sentences'][index1]
                }
                chosenElt.selectAll('span.token').transition().style('background-color', 'aqua')
                d3.select('#' + which + 'sent' + index2).selectAll('span.token').transition().style('background-color', 'aqua')
            }
        })
        d3.selectAll('.sentence').on('mouseout', function () {
            d3.selectAll('.sentence').selectAll('span.token').transition().style('background-color', 'white')
        })

        // HOVER TOKENS
        d3.selectAll('.token').on('mouseover', function () {
            var chosenElt = d3.select(this)
            if (chosenElt.classed('chosen')) {
                var chosenID = chosenElt.attr('id')

                var sentidx1 = chosenID.split('span')[0].replace('sent', '').replace('src', '').replace('tgt', '')
                var tokenidx1 = chosenID.split('span')[1]
                var exists = true
                if (chosenID.includes('src')) {
                    var which = 'tgt'
                    try {
                        var sentidx2 = src2tgt['sentences'][sentidx1]
                        var tokenidx2 = src2tgt['tokens'][sentidx1][tokenidx1]
                    } catch {
                        exists = false;
                    }
                } else {
                    var which = 'src'
                    try {
                        var sentidx2 = tgt2src['sentences'][sentidx1]
                        var tokenidx2 = tgt2src['tokens'][sentidx1][tokenidx1]
                    } catch {
                        exists = false;
                    }
                }
                if (exists) {
                    chosenElt.transition().style('background-color', 'aqua')
                    d3.select('#' + which + 'sent' + sentidx2 + 'span' + tokenidx2).transition().style('background-color', 'aqua')
                } else {
                    d3.select(this).style('cursor', 'default')
                }
            }
        })
        d3.selectAll('.token').on('mouseout', function () {
            d3.selectAll('.token').selectAll('mark').transition().style('background-color', 'white')
        })

        // CLICK TOKENS
        d3.selectAll('.token').on('click', function () {
            $("#ngramtitle").empty();
            $("#ngramviewer").empty();

            var chosenElt = d3.select(this)
            if (chosenElt.classed('chosen')) {
                var chosenID = chosenElt.attr('id')
                var sentidx1 = chosenID.split('span')[0].replace('sent', '').replace('src', '').replace('tgt', '')
                var tokenidx1 = chosenID.split('span')[1]
                var exists = true
                if (chosenID.includes('src')) {
                    var which = 'tgt'
                    try {
                        var sentidx2 = src2tgt['sentences'][sentidx1]
                        var tokenidx2 = src2tgt['tokens'][sentidx1][tokenidx1]
                        var tgttoken = d3.select('#' + which + 'sent' + sentidx2 + 'span' + tokenidx2).text()
                        var srctoken = chosenElt.text()
                    } catch {
                        exists = false
                    }
                } else {
                    var which = 'src'
                    try {
                        var sentidx2 = tgt2src['sentences'][sentidx1]
                        var tokenidx2 = tgt2src['tokens'][sentidx1][tokenidx1]
                        var srctoken = d3.select('#' + which + 'sent' + sentidx2 + 'span' + tokenidx2).text()
                        var tgttoken = chosenElt.text()
                    } catch {
                        exists = false
                    }
                }
                if (exists) {
                    // display word pair up top
                    d3.select('#wordpair').text(srctoken + '- ' + tgttoken)
                    updateSidebar(srctoken, tgttoken);
                    // wiktionary
                    // $.get('http://en.wiktionary.org/w/index.php?title=testx&printable=yes',function(data, status) {
                    //     console.log(data)
                    // });

                } else {
                    d3.select('#wordpair').text('[Alignment failure]')
                }
            }


        }) // end token click
    }
}