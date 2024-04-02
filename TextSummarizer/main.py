# -*- coding: utf-8 -*-
"""
Created on Sun Jan  5 08:52:08 2020

@author: sami
"""
import os
import time
from flask import Flask, request, render_template, redirect, jsonify
from werkzeug.utils import secure_filename
from src.recommendations.ifidf_recommender import generate_tfidf
from flask_cors import cross_origin
from src.index import NLP
from src.auth.decorators.jwtAuthGuard import JwtAuthGuard

app = Flask(__name__)


# Standard routes for the nlp.posterlab.co
@app.route("/")
def home():
    return render_template('summarize.html')


@app.route("/summarize", methods=['POST'])
def summarize():
    if request.form['text']:
        nlpData = NLP(generateFilePath(), type = 'local', inputText = request.form['text'])
        data = nlpData.GenerateNLPData()
        return(
            render_template(
                'summarizedText.html',
                text=data['original_text'],
                text_length=len(data['original_text']),
                summary=data['summary'],
                topics_list=data['topics'],
                keywords_list=data['keywords'],
                topics_list_length=len(data['topics']),
                keywords_list_length=len(data['keywords']),
                recommendations_list=data['recommendations']
                            ))
    else: return render_template('summarize.html')


@app.route("/readpdf", methods=['POST'])
def pdf():
    """ API end point to fetch the summarized data of uploaded pdf file. """
    nlpData = NLP(generateFilePath(), 'local')
    data = nlpData.GenerateNLPData()
    return(
        render_template(
            'summarizedText.html',
            text=data['original_text'],
            text_length=len(data['original_text']),
            summary=data['summary']['text'],
            topics_list=data['topics']['topics'],
            keywords_list=data['keywords']['keywords'],
            topics_list_length=len(data['topics']['topics']),
            keywords_list_length=len(data['keywords']['keywords']),
            recommendations_list=data['recommendations']
                        ))


@app.route("/updatemodelcsv", methods=['POST'])
def update():
    if request.files:
        fp = request.files.get('file')
        file_name = os.path.join("TFIDF/", 'dataset.csv')

        fp.save(file_name)
        generate_tfidf(file_name)

    return jsonify("Uploaded")


# Api routes to use the nlp from the web-app
@app.route("/api/readPdf", methods=['POST'])
@JwtAuthGuard
@cross_origin()
def api_pdf():
    nlpData = NLP(generateFilePath())
    data = nlpData.GenerateNLPData()
    return data


def generateFilePath():
    if request.files:
        fp = request.files.get('file')
        current_time = time.strftime("%Y%m%d-%H%M%S")
        file_name = current_time + "_" + secure_filename(fp.filename)

        fp.save(os.path.join("pdfarchive", file_name))

        return os.path.join("pdfarchive", file_name)

if __name__ == "__main__":
    app.debug = True
    app.run(host='0.0.0.0')
