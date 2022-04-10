let promises = [
    d3.json("nlp/jsondata/sentAlignment3-28.json"),
    d3.json("nlp/jsondata/spanish/sentsInOrder4-7.json"),
    d3.json("nlp/jsondata/spanish/wordAlignment4-7.json"),
    d3.json("nlp/jsondata/span_alignments.json"),
    d3.json("nlp/jsondata/eng_alignments.json"),
    d3.json("nlp/jsondata/span_lemmas.json"),
    d3.json("nlp/jsondata/eng_lemmas.json"),
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
// let element = document.getElementById("rando");
// element.onclick = function(event){testRandomWord()}

// initMainPage
function initMainPage(allDataArray) {
    let sent_align = allDataArray[0];
    sent_order = allDataArray[1];
    let word_align = allDataArray[2];
    source_align = allDataArray[3];
    translation_align = allDataArray[4];
    source_lemmas = allDataArray[5];
    translation_lemmas = allDataArray[6];


    myText = new TextPanel(sent_order, word_align);
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
        analysis_panel.innerHTML += "\t\t\t\t\t<div class=\"row-md-auto\" style=\"height: 30vh\">\n" +
            "\t\t\t\t\t\t<p>Word Frequency</p>\n" +
            "\t\t\t\t\t</div>\n" +
            "\t\t\t\t\t<div class=\"row-md-auto\" style=\"height: 30vh\">\n" +
            "\t\t\t\t\t\t<p>Sentence Length</p>\n" +
            "\t\t\t\t\t</div>\n" +
            "\t\t\t\t\t<div class=\"row-md-auto\" style=\"height: 30vh\">\n" +
            "\t\t\t\t\t\t<p>Lexical Richness</p>\n" +
            "\t\t\t\t\t</div>"
        createSentenceLevelSidebar();
    }

}