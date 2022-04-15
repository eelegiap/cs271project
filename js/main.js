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

let word_level_html = "" +
    "<div class=\"row-md-auto\">\n" +
    "\t\t\t\t\t\t<h6>Alignment Explorer</h6>\n" +
    "\t\t\t\t\t\t<div id=\"nextButton\"></div>\n" +
    "\t\t\t\t\t\t<div id=\"alignmentBar\" style=\"height: 5vh\">\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t<div id=\"alignmentTitle\">\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t\t<div id=\"textArea\">\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t<div class=\"row\" style='height: 18vh;'>\n" +
    "\t\t\t\t\t\t<h6>Position(s) in Text</h6>\n" +
    "\t\t\t\t\t\t<div id=\"timeline\">\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t<div class=\"row\">\n" +
    "\t\t\t\t\t\t<h6>Google N-Gram Viewer (Usage over time)</h6>\n" +
    "\t\t\t\t\t\t<div id='ngramviewer'>\n" +
    "\t\t\t\t\t\t</div>\n" +
    "\t\t\t\t\t</div>\n" +
    "\t\t\t\t</div>";

let sent_level_html = "<label for=\"lang\">Text:</label>\n" +
    "\t\t\t\t\t\t\t\t<select name=\"lang\" id=\"lang\">\n" +
    "\t\t\t\t\t\t\t\t\t<option value=\"source\">Source</option>\n" +
    "\t\t\t\t\t\t\t\t\t<option value=\"trans\">Translation</option>\n" +
    "\t\t\t\t\t\t\t\t</select>" +
    "<div id='myCarousel' class='carousel slide' data-ride='carousel' data-interval=false>" +
"<div class='carousel-inner' role='listbox'>"+
    "<div class='item active''>"+
            "<h4 class=' sentleveltitle'>Word Frequency</h4>"+
        "<div class='description'>Words that appear an unusually high number of times in a low number of sentences.</div>"+
        "<div style='float:left '> <label for='numb'>Elements:</label>"+
            "<select name='numb' id='numb'>"+
                "<option value=5>5</option>"+
                "<option value=10>10</option>"+
                "<option value=15 selected>15</option>"+
            "</select>"+
        "</div>"+
        "<div id='word-freq'></div>"+
    "</div>"+
    "<div class='item'>"+
        "<h4 class='sentleveltitle'>Sentence Length</h4>"+
        "<div class='description'>Distribution of sentence length across work as a whole.</div>"+
        "<div id='sent-length'></div>"+
    "</div>"+
    "<div class='item'>"+
        "<h4 class='sentleveltitle'>Lexical Richness</h4>"+
        "<div class='description'>What is lexical richness again?</div>"+
        "<div id='lex-richness'></div>"+
    "</div>"+
"</div>"+
"<a class='left carousel-control' href='#myCarousel' role='button' data-slide='prev'>"+
    "<span class='glyphicon glyphicon-chevron-left' aria-hidden='true'></span>"+
    "<span class='sr-only'>Previous</span>"+
"</a>"+
"<a class='right carousel-control' href='#myCarousel' role='button' data-slide='next'>"+
    "<span class='glyphicon glyphicon-chevron-right' aria-hidden='true'></span>"+
    "<span class='sr-only'>Next</span>"+
"</a>"+
"</div>"

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
        analysis_panel.innerHTML += word_level_html;
        createWordLevelSidebar();
    }
    else{
        analysis_panel.innerHTML += sent_level_html;
        createSentenceLevelSidebar();
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
    analysis_panel.innerHTML += sent_level_html;
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
    // handle radio buttons
    console.log("HEY")
    if (value == 'wordlevel') {
        d3.selectAll('.sentence').classed('chosen', false)
        d3.selectAll('.token').classed('chosen', true)
    } else {
        d3.selectAll('.sentence').classed('chosen', true)
        d3.selectAll('.token').classed('chosen', false)
    }
    switchSidebar(value);
}

