class nGrams {

    constructor(srctoken, tgtoken) {
        this.srctoken = srctoken;
        this.tgtoken = tgtoken;
        this.initVis()
    }

    initVis() {
        let vis = this;
        let srctoken = vis.srctoken;
        let tgttoken = vis.tgtoken;
        // for ngrams viewer
        var direct_url = 't1%3B%2C';
        var content = '';
        var index = 0;
        var array = [srctoken.toLowerCase(), tgttoken.toLowerCase()]
        for (const token of array) {
            // for ngram viewer
            if (index != 1) {
                direct_url = direct_url + token + '%3Aspa_2019%3B%2Cc0%3B.t1%3B%2C';
                content = content + token + '%2C+'
            } else {
                // deal with last element in array (differenr url endings)
                direct_url = direct_url + token + '%3Aeng_2019%3B%2Cc0';
                content = content + token;
            }
            index += 1;
        }
        // ngrams div
        $("#ngramtitle").append('<tr style="color:gray"><th> Google N-Gram Viewer</th><th>');
        $("#ngramviewer").append('<iframe name="ngram_chart" src="https://books.google.com/ngrams/interactive_chart?smoothing=3&direct_url=' + direct_url
            + '&corpus=36&year_start=1800&content=' + content
            + '&year_end=2010" width=500 height=200 marginwidth=0 marginheight=0 hspace=0 vspace=0 frameborder=0 scrolling=no></iframe>');
        // done ngrams
    }
}
