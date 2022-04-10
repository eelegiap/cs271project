let promises = [
    d3.json("nlp/jsondata/sentAlignment3-28.json"),
    d3.json("nlp/jsondata/spanish/sentsInOrder4-7.json"),
    d3.json("nlp/jsondata/spanish/wordAlignment4-7.json"),
    d3.json("nlp/jsondata/span_alignments.json"),
    d3.json("nlp/jsondata/eng_alignments.json"),
    d3.json("nlp/jsondata/span_lemmas.json"),
    d3.json("nlp/jsondata/eng_lemmas.json"),
    d3.json("nlp/jsondata/spanish/wordJSON.json"),
];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );

let source_align;
let translation_align;
let myAlignmentBar;
let myTimeline;
let sent_order;
let source_lemmas;
let translation_lemmas;
let barchart;

let sourceCount = [];
let transCount = [];
let filterTriggers = ['!', "'", '"', "#", "$", "¿", "%", ',', ".",
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", ";", "»", ":"];


// initMainPage
function initMainPage(allDataArray) {
    let sent_align = allDataArray[0];
    sent_order = allDataArray[1];
    let word_align = allDataArray[2];
    source_align = allDataArray[3];
    translation_align = allDataArray[4];
    source_lemmas = allDataArray[5];
    translation_lemmas = allDataArray[6];
    raj_words = allDataArray[7];

    myText = new TextPanel(sent_order, word_align);
    dataProcessing(raj_words)
}


function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function updateSidebar(cur_source_align, cur_translation_align){
    let source_lemma = source_lemmas[cur_source_align.toLowerCase().trim()];
    let translation_lemma = translation_lemmas[cur_translation_align.toLowerCase().trim()];
    myAlignmentBar.updateVis(source_lemma, translation_lemma);
    myTimeline.updateVis(source_lemma, translation_lemma);
    myNGrams = new nGrams(cur_source_align, cur_translation_align);
}

function createWordLevelSidebar(){
    myAlignmentBar = new AlignmentBar('alignmentBar', source_align, translation_align, sent_order);
    myTimeline = new Timeline('timeline', source_align, translation_align, sent_order);
    myNGrams = new nGrams("En", "In");
}

function createSentenceLevelSidebar(){
    console.log("Placeholder for sentence level sidebar")
}

function switchSidebar(bar_type){
    let analysis_panel = document.getElementById("aPanel")
    while (analysis_panel.firstChild) {
        analysis_panel.removeChild(analysis_panel.firstChild);
    }
    if(bar_type == "wordlevel") {
        analysis_panel.innerHTML += "<div class=\"row-md-auto\"\n" +
            "\t\t\t\t\t\t<div id=\"nextButton\"></div>\n" +
            "\t\t\t\t\t\t<div id=\"alignmentBar\" style=\"height: 5vh\">\n" +
            "\t\t\t\t\t\t</div>\n" +
            "\t\t\t\t\t\t<div id=\"alignmentTitle\">\n" +
            "\t\t\t\t\t\t</div>\n" +
            "\t\t\t\t\t\t<div id=\"textArea\">\n" +
            "\t\t\t\t\t\t</div>\n" +
            "\t\t\t\t\t</div>\n" +
            "\t\t\t\t\t<div class=\"row-md-auto\">\n" +
            "\t\t\t\t\t\t<table id='ngramtitle' style=\"width:100%; color: gray\"></table>\n" +
            "\t\t\t\t\t\t<div id='ngramviewer'>\n" +
            "\t\t\t\t\t\t</div>\n" +
            "\t\t\t\t\t</div>\n" +
            "\t\t\t\t\t<div class=\"row-md-auto\">\n" +
            "\t\t\t\t\t\t<div id=\"timeline\">\n" +
            "\t\t\t\t\t\t</div>\n" +
            "\t\t\t\t\t</div>\n" +
            "\t\t\t\t</div>";
        createWordLevelSidebar();
    }
    else{
        analysis_panel.innerHTML += "\t\t\t\t\t<div class=\"row-md-auto\">\n" +
            "\t\t\t\t\t\t<p>Word Frequency</p>\n" +
            "\t\t\t\t\t</div>\n" +
            "\t\t\t\t\t<div class=\"row-md-auto\">\n" +
            "\t\t\t\t\t\t<p>Sentence Length</p>\n" +
            "\t\t\t\t\t</div>\n" +
            "\t\t\t\t\t<div class=\"row-md-auto\">\n" +
            "\t\t\t\t\t\t<p>Lexical Richness</p>\n" +
            "\t\t\t\t\t</div>"
        createSentenceLevelSidebar();
    }

}


function dataProcessing(data) {
    let rawSource = [];
    let rawTrans = [];

    let sourceSentences = (data.srcSentsInOrder.tokens).map(function (d) {
        let result = {
            sentence: d
        }
        return result;
    })
    sourceSentences.forEach(sentence => {
        for(let i = 0; i < sentence["sentence"].length; i++)
        {
            rawSource.push(sentence["sentence"][i]["lemma"]);
        }
    })

    let transSentences = (data.tgtSentsInOrder.tokens).map(function (d) {
        let result = {
            sentence: d
        }
        return result;
    })
    transSentences.forEach(sentence => {
        for(let i = 0; i < sentence["sentence"].length; i++)
        {
            rawTrans.push(sentence["sentence"][i]["lemma"]);
        }
    })

    function tally(data) {

        let sentences = [];
        let sentIndex = 0;
        for(let j=0; j < data.length; j++) {
            let word = data[j];
            if(sentences[sentIndex] == undefined)
                sentences[sentIndex] = "";

            if(word ==".") {
                sentIndex++;
            }
            else{
                sentences[sentIndex] = sentences[sentIndex] + " " + word;
            }
        }

        let output = {};

        for(let i=0; i < data.length; i++) {
            let word = data[i];

            if(output[word] === undefined) {
                output[word] = 1;
            }
            else {
                output[word] += 1;
            }
        }


        let idf = {};
        let lemmas = Object.keys(output);

        for(let k=0; k<sentences.length; k++) {
            for(let m=0; m<lemmas.length; m++) {
                let word = lemmas[m];
                let tempArray = sentences[k].split(" ");

                if(idf[word] == undefined) {
                    idf[word] = 0;
                }

                if(tempArray.indexOf(word) != -1) {
                    idf[word] += 1;
                }
            }
        }

        for(let y=0; y<lemmas.length; y++) {
            let word = lemmas[y];

            if(idf[word] == 0) {
                output[word] = 0;
            }
            output[word] = (output[word])/(idf[word]);

        }


        let temp = Object.keys(output).map((key => [(key), output[key]]));


        let filtered = temp.filter(function(d) {
            d = d[0];
            return filterTriggers.indexOf(d) == -1;

        })

        return filtered.sort(function (a, b) {
            return b[1] - a[1];
        })
    }

    sourceCount = (tally(rawSource));
    transCount = (tally(rawTrans));



    barchart = new BarChart("main-container", sourceCount);

    document.getElementById("lang").onchange = function () {
        let selectLang = document.getElementById("lang").value;
        if(selectLang == "source") {
            barchart.langSelectionChanged(sourceCount);
        }
        else {
            barchart.langSelectionChanged(transCount);
        }
    }

    document.getElementById("numb").onchange = function () {
        let selectNumb = document.getElementById("numb").value;
        barchart.numbSelectionChanged(selectNumb);
    }

}



