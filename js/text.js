class TextPanel {

    constructor(sent_order, word_align, src_lang) {
        this.sent_order = sent_order;
        this.word_align = word_align;
        this.src_lang = src_lang;
        this.initVis()
    }

    initVis() {
        let vis = this;

        vis.radio_value = "wordlevel";
        vis.src_lemma = "";
        vis.tgt_lemma = "";

        // set the dimensions and margins of the graph
        var margin = { top: 30, right: 30, bottom: 70, left: 60 },
            width = 400 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        var srcdiv = d3.select("#srctext")
        var tgtdiv = d3.select("#tgttext")

        // text titles
        var titles = {
            'russian': {
                'src': 'Дама с собачкой',
                'tgt': 'Lady with the Lapdog'
            },
            'arabic': {
                'src': 'الأيام',
                'tgt': 'The Days (1-5)'
            },
            'spanish': {
                'src': "El jardín de senderos que se bifurcan",
                'tgt': "The Garden of Forking Paths"
            },
        }
        var authors = {
            'russian': {
                'src': 'Антон Чехов',
                'tgt': 'by Anton Chekhov'
            },
            'arabic': {
                'src': 'by Taha Hussein',
                'tgt': 'translated by E.H. Paxton'
            },
            'spanish': {
                'src': 'by Jorge Luis Borges',
                'tgt': 'translated by Anthony Kerrigan',
            }
        }

        d3.select('#srcTitle').text(titles[vis.src_lang]['src'])
        d3.select('#tgtTitle').text(titles[vis.src_lang]['tgt'])
        d3.select('#srcAuthor').text(authors[vis.src_lang]['src'])
        d3.select('#tgtAuthor').text(authors[vis.src_lang]['tgt'])

        if (vis.src_lang == 'arabic') {
            d3.select('#srctext').attr('dir', 'rtl').style('font-size', '22px')
            d3.select('#srcTitle').attr('dir', 'rtl')
            d3.select('#srcAuthor').attr('dir', 'rtl')
            d3.select('#ngraminfo').text('Unfortunately, Google N-Grams is not supported in Arabic.')
        } else {
            d3.select('#srctext').attr('dir', 'ltr')
            d3.select('#srcTitle').attr('dir', 'ltr')
            d3.select('#srcAuthor').attr('dir', 'ltr')
            d3.select('#ngraminfo').text(``)
        }

        let data = vis.sent_order;
        var srccharcount = 0;
        var tgtcharcount = 0;

        let src_linebreak = 0;
        let tgt_linebreak = 0;

        // APPEND SOURCE SENTENCES
        function spacenospace(tokens, thistoken, j, type_str) {
            if (thistoken.linebreak) {
                if (type_str == "src") {
                    src_linebreak += 1;
                } else {
                    tgt_linebreak += 1;
                }
                return thistoken.text + '<br><br>'
            }
            if (thistoken.pos == 'SUPERSCRIPT') {
                return '<sup>1</sup>'
            }
            if (j < tokens.length - 1) {
                var nexttoken = tokens[j + 1]
                if (',.'.includes(thistoken.text) && "'".includes(nexttoken.text)) {
                    return thistoken.text
                }
                if (["'", '"'].includes(thistoken.text) && nexttoken.text == 'Our') {
                    return thistoken.text
                }
                if (thistoken.text == 'Master' && ["'", '"'].includes(nexttoken.text)) {
                    return thistoken.text
                }
                if ('.,)?;»!”'.includes(nexttoken.text)) {
                    return thistoken.text
                }
                if ((':' == nexttoken.text) || '...' == nexttoken.text) {
                    return thistoken.text
                }
                if (('"' == nexttoken.text) && thistoken.text == ':') {
                    return thistoken.text + ' '
                }
                if (('"‘' == nexttoken.text) && thistoken.pos == 'PUNCT') {
                    return thistoken.text
                }
                if (('"' == thistoken.text) && nexttoken.text == '¿') {
                    return thistoken.text
                }
                if ('¿"'.includes(thistoken.text) && nexttoken.pos != 'PUNCT') {
                    return thistoken.text
                }
                if (['n’t', '’m', '’s', "'s"].includes(nexttoken.text)) {
                    return thistoken.text
                }
            }
            if ('(¿«“‘'.includes(thistoken.text)) {
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
                .html(function (d, j) {
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

        let char_per_break_est = 50;

        var src_space = srccharcount + src_linebreak * char_per_break_est;
        if (vis.src_lang == 'russian') {
            src_space = src_space * 1.1
        } else if (vis.src_lang == 'arabic') {
            src_space = src_space * 1.32
        }
        var tgt_space = tgtcharcount + tgt_linebreak * char_per_break_est

        var totalcharcount = src_space + tgt_space

        // MAKE SURE CORRECT WIDTH
        var srccolwidth = (src_space / totalcharcount) * 100
        var tgtcolwidth = (tgt_space / totalcharcount) * 100

        d3.select('#srccol').style('width', `${srccolwidth}%`)
        d3.select('#tgtcol').style('width', `${tgtcolwidth}%`)

        var analysiswidth = parseInt(($(window).width() - 300) * .33)

        // d3.select('.wrapper').style('grid-template-columns', `${srccolwidth}px ${tgtcolwidth}px ${analysiswidth}px`)
        // d3.select('#analysispanel').style('visibility','visible').style('left', parseInt(($(window).width() - 100)* .66) + 'px').style('position', 'fixed')

        let wadata = vis.word_align;

        var src2tgt = Object()
        var tgt2src = Object()
        src2tgt['sentences'] = Object()
        src2tgt['tokens'] = Object()
        tgt2src['sentences'] = Object()
        tgt2src['tokens'] = Object()

        var alignment = Object()
        alignment['src'] = Object()
        alignment['tgt'] = Object()

        // CREATE WORD AND SENTENCE ALIGNMENT LOOKUP
        wadata.forEach(function (s) {

            alignment['src'][s.srcsentidx] ??= []
            alignment['tgt'][s.tgtsentidx] ??= []
            var alignedTokens = Object()
            alignedTokens['src'] = Object()
            alignedTokens['tgt'] = Object()
            s.alignedwordindices.forEach(function (st) {
                alignedTokens['src'][st[0]] = st[1]
                alignedTokens['tgt'][st[1]] = st[0]
            })
            alignment['src'][s.srcsentidx].push({
                'sentIdx': s.tgtsentidx,
                'tokenObj': alignedTokens['src']
            })
            alignment['tgt'][s.tgtsentidx].push({
                'sentIdx': s.srcsentidx,
                'tokenObj': alignedTokens['tgt']
            })
        })

        // handle radio buttons
        d3.selectAll(("input[name='level']")).on("change", function () {
            vis.radio_value = this.value;
        })

        // HOVER SENTENCES
        d3.selectAll('.sentence').on('mouseover', function () {
            var chosenElt = d3.select(this)
            if (chosenElt.classed('chosen')) {
                var chosenID = chosenElt.attr('id')
                var index1 = chosenID.replace('sent', '').replace('src', '').replace('tgt', '')
                var index2;
                if (chosenID.includes('src')) {
                    var which = 'tgt'
                    alignment['src'][index1].forEach(function (info) {
                        index2 = info.sentIdx
                        console.log('text.jshoversent', index1, index2)
                        chosenElt.selectAll('span.token').transition().style('background-color', 'aqua')
                        d3.select('#' + which + 'sent' + index2).selectAll('span.token').transition().style('background-color', 'aqua')
                    })
                } else {
                    var which = 'src'
                    alignment['tgt'][index1].forEach(function (info) {
                        index2 = info.sentIdx
                        console.log('text.jshoversent', index1, index2)
                        chosenElt.selectAll('span.token').transition().style('background-color', 'aqua')
                        d3.select('#' + which + 'sent' + index2).selectAll('span.token').transition().style('background-color', 'aqua')
                    })
                }
            }
        })
        d3.selectAll('.sentence').on('mouseout', function () {
            d3.selectAll('.sentence').selectAll('span.token').transition().style('background-color', 'white')
        })

        // HOVER TOKENS
        d3.selectAll('.token').on('mouseover', function (d) {
            var chosenElt = d3.select(this)
            if (chosenElt.classed('chosen')) {
                var chosenID = chosenElt.attr('id')

                var sentidx1 = chosenID.split('span')[0].replace('sent', '').replace('src', '').replace('tgt', '')
                var tokenidx1 = chosenID.split('span')[1]

                var exists = true
                var sentidx2; var tokenidx2;
                if (chosenID.includes('src')) {
                    var which = 'tgt'
                    try {
                        alignment['src'][sentidx1].forEach(function (info) {
                            sentidx2 = info.sentIdx
                            tokenidx2 = info.tokenObj[tokenidx1]
                            chosenElt.transition().style('background-color', 'aqua')
                            d3.select('#' + which + 'sent' + sentidx2 + 'span' + tokenidx2).transition().style('background-color', 'aqua')
                        })
                        // var sentidx2 = src2tgt['sentences'][sentidx1]
                        // var tokenidx2 = src2tgt['tokens'][sentidx1][tokenidx1]
                    } catch (e) {
                        chosenElt.transition().style('background-color', 'tomato')
                        exists = false;
                    }
                } else {
                    var which = 'src'
                    try {
                        alignment['tgt'][sentidx1].forEach(function (info) {
                            sentidx2 = info.sentIdx
                            tokenidx2 = info.tokenObj[tokenidx1]
                            chosenElt.transition().style('background-color', 'aqua')
                            d3.select('#' + which + 'sent' + sentidx2 + 'span' + tokenidx2).transition().style('background-color', 'aqua')
                        })
                    } catch {
                        exists = false;
                    }
                }
                if (exists && vis.radio_value == "wordlevel") {
                    d3.select(this).style('cursor', 'pointer')
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
            $("#ngramviewer").empty();
            var chosenElt = d3.select(this)
            if (chosenElt.classed('chosen')) {
                var chosenID = chosenElt.attr('id')
                var sentidx1 = chosenID.split('span')[0].replace('sent', '').replace('src', '').replace('tgt', '')
                var tokenidx1 = chosenID.split('span')[1]
                var exists = true
                var srctoken; var tgttoken;
                var info; var sentidx2; var tokenidx2; var which
                if (chosenID.includes('src')) {
                    which = 'tgt'
                    // try {
                    info = alignment['src'][sentidx1][0]
                    sentidx2 = info.sentIdx
                    tokenidx2 = info.tokenObj[tokenidx1]
                    tgttoken = d3.select('#' + which + 'sent' + sentidx2 + 'span' + tokenidx2).text()
                    vis.tgt_lemma = d3.select('#' + which + 'sent' + sentidx2 + 'span' + tokenidx2)["_groups"][0][0]["__data__"].lemma
                    vis.src_lemma = chosenElt["_groups"][0][0]["__data__"].lemma
                    srctoken = chosenElt.text()
                    // } catch {
                    //     exists = false
                    // }
                } else {
                    which = 'src'
                    try {
                        info = alignment['tgt'][sentidx1][0]
                        sentidx2 = info.sentIdx
                        tokenidx2 = info.tokenObj[tokenidx1]
                        srctoken = d3.select('#' + which + 'sent' + sentidx2 + 'span' + tokenidx2).text()
                        vis.src_lemma = d3.select('#' + which + 'sent' + sentidx2 + 'span' + tokenidx2)["_groups"][0][0]["__data__"].lemma
                        vis.tgt_lemma = chosenElt["_groups"][0][0]["__data__"].lemma
                        tgttoken = chosenElt.text()
                    } catch {
                        exists = false
                    }
                }
                if (exists) {
                    // display word pair up top
                    d3.select('#wordpair').text(srctoken + '- ' + tgttoken)
                    updateSidebar(srctoken, tgttoken, vis.src_lang, tokenidx1, tokenidx2, vis.src_lemma, vis.tgt_lemma);
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