from flask import Flask, flash, redirect, render_template, request, session, abort,send_from_directory,send_file,jsonify
from astred import AlignedSentences, Sentence
from astred.aligned import AlignedSentences, Sentence
from astred.aligner import Aligner
from astred.utils import load_parser
import json




#1. Declare application
application = Flask(__name__)

#2. Declare data stores
class DataStore():
    CountryName=None
    Year=None
    Prod= None
    Loss=None
data=DataStore()


@application.route("/main",methods=["GET","POST"])

#3. Define main code
@application.route("/",methods=["GET","POST"])
def homepage():
    text = request.form.get('text_field','In his A History of the World War (page 212), Captain Liddell Hart reports that a planned offensive by thirteen British divisions, supported by fourteen hundred artillery pieces, against the German line at Serre-Montauban, scheduled for July 24, 1916, had to be postponed until the morning of the 29th.')
    translation = request.form.get('translation_field', 'En la página 22 de la Historia de la Guerra Europea, de Liddell Hart, se lee que una ofensiva de trece divisiones británicas (apoyadas por mil cuatrocientas piezas de artillería) contra la línea Serre Montauban había sido planeada para el veinticuatro de julio de 1916 y debió postergarse hasta la mañana del día veintinueve.')

    srcsents = text.split('\n')
    tgtsents = translation.split('\n')

    nlp_en = load_parser("en", "stanza", is_tokenized=False, verbose=True)
    nlp_es = load_parser("es", "stanza", is_tokenized=False, verbose=True)
    aligner = Aligner()

    your_data = zip(srcsents, tgtsents)

    alignmentList = []
    i = 0
    success = 0
    for sent_es_str, sent_en_str in your_data:
        if i % 10 == 0:
            print(f'{i}/{len(srcsents)} sentences parsed.')
        try:
            sent_en = Sentence.from_text(sent_en_str, nlp_en)
            sent_es = Sentence.from_text(sent_es_str, nlp_es)
            aligned = AlignedSentences(sent_es, sent_en, aligner=aligner)
            alignmentList.append({
                'spanish_text' : sent_es_str,
                'english_text' : sent_en_str,
                'spanish_nlp' : sent_es,
                'english_nlp' : sent_en,
                'alignment' : aligned
            })
            success += 1
        except:
            alignmentList.append({
                'spanish_text' : sent_es_str,
                'english_text' : sent_en_str,
                'spanish_nlp' : 'Error',
                'english_nlp' : 'Error',
                'alignment' : 'Error'
            })
        i += 1
    return render_template("index.html", text=text, translation=translation, aligned=alignmentList)


@application.route("/get-data",methods=["GET","POST"])
def returnProdData():
    f=data.Prod

    return jsonify(f)
# export the final result to a json file

@application.route("/get-loss-data",methods=["GET","POST"])
def returnLossData():
    g=data.Loss

    return jsonify(g)

if(__name__ == "main"):
	application.run(threaded=True)
	


