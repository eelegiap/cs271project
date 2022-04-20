let src_lang = "spanish";
let tgt_lang = "english"

let source_align;
let translation_align;
let myAlignmentBar;
let myTimeline;
let sent_order;
let source_lemmas;
let translation_lemmas;
let barchart;
let senthistogram;

let sourceCount = [];
let transCount = [];
let filterTriggers = ['!', "'", '"', "#", "$", "¿", "%", ',', ".",
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", ";", "»", ":"];


let promises = [
    d3.json("nlp/jsondata/"+ src_lang +"/sentAlignment.json"),
    d3.json("nlp/jsondata/"+ src_lang +"/sentsInOrder.json"),
    d3.json("nlp/jsondata/"+ src_lang +"/wordAlignment.json"),
    d3.json("nlp/jsondata/"+ src_lang +"/alignments.json"),
    d3.json("nlp/jsondata/"+ tgt_lang +"/"+ src_lang +"/alignments.json"),
    d3.json("nlp/jsondata/"+ src_lang +"/lemmas.json"),
    d3.json("nlp/jsondata/"+ tgt_lang +"/"+ src_lang +"/lemmas.json"),
];

Promise.all(promises)
    .then( function(data){ initMainPage(data, src_lang) })
    .catch( function (err){console.log(err)} );



// initMainPage
function initMainPage(allDataArray, src_lang) {
    console.log('initMainPage', src_lang)
    let sent_align = allDataArray[0];
    sent_order = allDataArray[1];
    let word_align = allDataArray[2];
    source_align = allDataArray[3];
    translation_align = allDataArray[4];
    source_lemmas = allDataArray[5];
    translation_lemmas = allDataArray[6];

    myText = new TextPanel(sent_order, word_align, src_lang);
    change_level("wordlevel")
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function updateSidebar(cur_source_align, cur_translation_align, src_lang, source_lemma_idx, translation_lemma_idx){
    let source_lemma = source_lemmas[cur_source_align.toLowerCase().trim()];
    let translation_lemma = translation_lemmas[cur_translation_align.toLowerCase().trim()];
    // let source_lemma = cur_source_align
    // let translation_lemma = cur_translation_align
    console.log('updateSidebar is working',source_lemma, translation_lemma)
    document.getElementById("table_src_align").innerHTML =  cur_source_align;
    document.getElementById("table_src_lemma").innerHTML = source_lemma;
    document.getElementById("table_tgt_align").innerHTML =  cur_translation_align;
    document.getElementById("table_tgt_lemma").innerHTML = translation_lemma;

    myAlignmentBar.updateVis(source_lemma, translation_lemma, source_lemma_idx, translation_lemma_idx);
    myTimeline.updateVis(source_lemma, translation_lemma);
    myNGrams.updateVis(source_lemma, translation_lemma, src_lang);
}

function createWordLevelSidebar(){
    myAlignmentBar = new AlignmentBar('alignmentBar', source_align, translation_align, sent_order);
    myTimeline = new Timeline('timeline', source_align, translation_align, sent_order);
    console.log('creaetwordLevelsidebar',src_lang)
    myNGrams = new nGrams("En", "In", src_lang);
}

function createSentenceLevelSidebar(){
    console.log('createSentenceLevelSidebar', src_lang)
    dataProcessing(sent_order, src_lang);
}

function switchSidebar(bar_type){
    let analysis_panel = document.getElementById("aPanel")
    while (analysis_panel.firstChild) {
        analysis_panel.removeChild(analysis_panel.firstChild);
    }
    if(bar_type == "wordlevel") {
        $( "#aPanel" ).load( "html/wordLevel.html" )
        let checkIfExists = setInterval(function() {
            var exists = document.getElementById("textArea");

            if (exists) {
                clearInterval(checkIfExists);
                createWordLevelSidebar();
            }
        }, 25);
    }
    else{
        $( "#aPanel" ).load( "html/sentenceLevel.html" )
        let checkIfExists = setInterval(function() {
            var exists = document.getElementById("lex-richness");
            console.log(exists)
            if (exists) {
                console.log("loading")
                clearInterval(checkIfExists);
                createSentenceLevelSidebar();
            }
        }, 100);
    }

}

function clear_panels(){
    let tgt_panel = document.getElementById("tgttext")
    while (tgt_panel.firstChild) {
        tgt_panel.removeChild(tgt_panel.firstChild);
    }
    let src_panel = document.getElementById("srctext")
    while (src_panel.firstChild) {
        src_panel.removeChild(src_panel.firstChild);
    }
    let analysis_panel = document.getElementById("aPanel")
    while (analysis_panel.firstChild) {
        analysis_panel.removeChild(analysis_panel.firstChild);
    }
    return analysis_panel
}
function change_language_selection(lang){
    analysis_panel = clear_panels();
    $( "#aPanel" ).load( "html/wordLevel.html" )
    src_lang = lang;
    let promises = [
        d3.json("nlp/jsondata/"+ src_lang +"/sentAlignment.json"),
        d3.json("nlp/jsondata/"+ src_lang +"/sentsInOrder.json"),
        d3.json("nlp/jsondata/"+ src_lang +"/wordAlignment.json"),
        d3.json("nlp/jsondata/"+ src_lang +"/alignments.json"),
        d3.json("nlp/jsondata/"+ tgt_lang +"/"+ src_lang +"/alignments.json"),
        d3.json("nlp/jsondata/"+ src_lang +"/lemmas.json"),
        d3.json("nlp/jsondata/"+ tgt_lang +"/"+ src_lang +"/lemmas.json"),
    ];
    Promise.all(promises)
        .then( function(data){ initMainPage(data, src_lang) })
        .catch( function (err){console.log(err)} );
}

function change_level(value){
    if (value == 'wordlevel') {
        d3.selectAll('.sentence').classed('chosen', false)
        d3.selectAll('.token').classed('chosen', true)
    } else {
        d3.selectAll('.sentence').classed('chosen', true)
        d3.selectAll('.token').classed('chosen', false)
    }
    switchSidebar(value);
}

