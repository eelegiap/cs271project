let promises = [
    d3.json("nlp/jsondata/sentAlignment3-28.json"),
    d3.json("nlp/jsondata/sentsInOrder3-28.json"),
    d3.json("nlp/jsondata/wordAlignment3-28.json"),
    d3.json("nlp/jsondata/span_alignments.json"),
    d3.json("nlp/jsondata/eng_alignments.json"),
];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );

let source_align;
let translation_align;
let myAlignmentBar;
let myTimeline;
let element = document.getElementById("rando");
element.onclick = function(event){testRandomWord()}

// initMainPage
function initMainPage(allDataArray) {
    let sent_align = allDataArray[0];
    let sent_order = allDataArray[1];
    let word_align = allDataArray[2];
    source_align = allDataArray[3];
    translation_align = allDataArray[4];

    // console.log("sent alignment", sent_align);
    // console.log("sent order", sent_order);
    // console.log("word align", word_align);
    console.log("span_align", source_align);
    console.log("eng_align", translation_align);

    myAlignmentBar = new AlignmentBar('alignmentBar', source_align, translation_align, sent_order);
    myTimeline = new Timeline('timeline', source_align, translation_align, sent_order);
}


function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function testRandomWord(){
    let i = getRandomInt(Object.keys(source_align).length);
    let cur_source_align = Object.keys(source_align)[i];
    let cur_translation_align = source_align[cur_source_align][0][0];

    myAlignmentBar.updateVis(cur_source_align, cur_translation_align);
    myTimeline.updateVis(cur_source_align, cur_translation_align);
}
