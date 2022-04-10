

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