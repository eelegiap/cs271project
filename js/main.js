let promises = [
    d3.json("nlp/jsondata/sentAlignment3-28.json"),
    d3.json("nlp/jsondata/sentsInOrder3-28.json"),
    d3.json("nlp/jsondata/wordAlignment3-28.json"),
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
    myAlignmentBar = new AlignmentBar('alignmentBar', source_align, translation_align, sent_order);
    myTimeline = new Timeline('timeline', source_align, translation_align, sent_order);
}


function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function updateSidebar(cur_source_align, cur_translation_align){
    let source_lemma = source_lemmas[cur_source_align.toLowerCase().trim()];
    let translation_lemma = translation_lemmas[cur_translation_align.toLowerCase().trim()];
    myAlignmentBar.updateVis(source_lemma, translation_lemma);
    myTimeline.updateVis(source_lemma, translation_lemma);
}
