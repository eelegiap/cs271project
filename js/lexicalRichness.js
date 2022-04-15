window.addEventListener("load", function() {

    const obj1 = {
        source: "I like sports.",
        translation: "Me gustan los deportes.",
        source_lex: 3,
        translation_lex: 5
    }
    const obj2 = {
        source: "Hi.",
        translation: "Hola.",
        source_lex: 1,
        translation_lex: 1
    }
    const obj3 = {
        source: "Nice.",
        translation: "Bueno.",
        source_lex: 1,
        translation_lex: 1
    }

    let arr = [obj1, obj2, obj3];
    moveDataToVis(arr);
})




function moveDataToVis(data) {
    let html = "<table class='styled-table'><thead><tr><th>Sentence</th><th>Score</th></tr><thead><tbody>"
    for (var i = 0; i < data.length; i++) {
        html += "<tr>"
        html += "<td>" + data[i].source + "</td>" + "<td>" + data[i].source_lex + "</td>"
        html += "</tr>"

        html += "<tr>"
        html += "<td>" + data[i].translation + "</td>" + "<td>" + data[i].translation_lex + "</td>"
        html += "</tr>"
    }

    html += "</tbody></table>"

    document.getElementById("container").innerHTML = html;
}

