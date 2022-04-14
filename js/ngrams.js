class nGrams {

    constructor(srctoken, tgtoken, srclang) {
        this.srctoken = srctoken;
        this.tgtoken = tgtoken;
        this.cur_source_align = sent_order.srcSentsInOrder[0].tokens[0].lemma.toLowerCase().trim();
        this.cur_translation_align = sent_order.tgtSentsInOrder[0].tokens[0].lemma.toLowerCase().trim();
        this.src_lang = srclang;
        this.initVis()
    }

    initVis() {
        let vis = this;
        vis.srctoken = vis.cur_source_align;
        vis.tgttoken = vis.cur_translation_align;

        vis.updateVis(vis.srctoken, vis.tgttoken);
    }
    updateVis(s, t) {
        let vis = this;
        vis.srctoken = s;
        vis.tgttoken = t;
        console.log(s,t )
        var direct_url = 't1%3B%2C';
        var content = '';
        var index = 0;
        var array = [vis.srctoken.toLowerCase(), vis.tgttoken.toLowerCase()]

        console.log('ngrams_src_lang', vis.src_lang)
        for (const token of array) {
            // for ngram viewer
            if (index != 1) {
                var corpus = ''
                if (vis.src_lang == 'spanish') {

                    corpus = 'spa_2019'
                } else if (vis.src_lang == 'russian') {
                    corpus = 'rus_2019'
                }
                direct_url = direct_url + token + '%3A' + corpus + '%3B%2Cc0%3B.t1%3B%2C';
                content = content + token + '%2C+'
            }
            else {
                // deal with last element in array (differenr url endings)
                direct_url = direct_url + token + '%3Aeng_2019%3B%2Cc0';
                content = content + token;
            }
            index += 1;
        }
        // ngrams div
        // $("#ngramtitle").append('<tr style="color:gray"><th> Google N-Gram Viewer (usage over time)</th><th>');
        $("#ngramviewer").append('<iframe name="ngram_chart" src="https://books.google.com/ngrams/interactive_chart?smoothing=3&direct_url=' + direct_url
            + '&corpus=36&year_start=1800&content=' + content
            + '&year_end=2010" width=' + $('#aPanel').width() + ' height=200 marginwidth=0 marginheight=0 hspace=0 vspace=0 frameborder=0 scrolling=no></iframe>');
    }
}
