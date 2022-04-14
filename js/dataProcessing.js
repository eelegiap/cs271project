

function dataProcessing(data, src_lang) {

    let sourceSentences = (data.srcSentsInOrder).map(function (d) { return d.tokens; })
    let targetSentences = (data.tgtSentsInOrder).map(function (d) { return d.tokens })

    let srcSentLengths = (data.srcSentsInOrder).map(function (d) { return d.tokens.length; })
    let tgtSentLengths = (data.tgtSentsInOrder).map(function (d) { return d.tokens.length })


    function tally(sentTokenList) {
        let tf = {}
        let df = {}
        let tfidf = {}

        let totalTokens = 0
        sentTokenList.forEach(function (tokens) {
            if (tokens == undefined) {
            } else {
                tokens.forEach(function (t) {
                    totalTokens += 1
                    if (!tf.hasOwnProperty(t.lemma)) {
                        tf[t.lemma] = 1
                        df[t.lemma] = 0
                        tfidf[t.lemma] = 0
                    } else {
                        tf[t.lemma] += 1
                    }
                })
            }
        })

        sentTokenList.forEach(function (tokens) {
            let lemmasInSent = new Set()
            if (tokens == undefined) {
            } else {
                tokens.forEach(function (t) {
                    lemmasInSent.add(t.lemma)
                })
                lemmasInSent.forEach(function (l) {
                    df[l] += 1
                })
            }
        })
        for (const lemma of Object.keys(tfidf)) {
            if (df[lemma] == 0) {
                tfidf[lemma] = 0
            } else {
                tfidf[lemma] = Math.log(1+tf[lemma]) * Math.log(1 + sentTokenList.length/df[lemma])
            }
        }

        let temp = Object.keys(tfidf).map(function(key) {
            return {
            'lemma' : key, 'tfidf' : tfidf[key], 'tf' : tf[key], 'df' : df[key]
            }
        });
        let filtered = temp.filter(function(d) {
            d = d.lemma;
            return filterTriggers.indexOf(d) == -1;
        })

        return filtered.sort(function (a, b) {
            return b.tfidf - a.tfidf;
        })
    }

    sourceCount = (tally(sourceSentences));
    targetCount = (tally(targetSentences));

    barchart = new BarChart("word-freq", sourceCount);
    senthistogram = new sentHistogram("sent-length", srcSentLengths);
    var s = data.srcSentsInOrder[0].tokens[0].lemma.toLowerCase().trim();
    var t = data.tgtSentsInOrder[0].tokens[0].lemma.toLowerCase().trim()
    console.log('dataprocess', src_lang)
    myNGrams = new nGrams(s, t, src_lang)
    

    document.getElementById("lang").onchange = function () {
        let selectLang = document.getElementById("lang").value;

        if (selectLang == "source") {
            barchart.langSelectionChanged(sourceCount);
            senthistogram.langSelectionChanged(srcSentLengths);
        }
        else {
            barchart.langSelectionChanged(targetCount);
            senthistogram.langSelectionChanged(tgtSentLengths);
        }
    }

    document.getElementById("numb").onchange = function () {
        let selectNumb = document.getElementById("numb").value;
        barchart.numbSelectionChanged(selectNumb);
    }

}