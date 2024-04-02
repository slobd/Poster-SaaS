import string
from django.shortcuts import redirect
from pdfminer.psparser import keyword_name
from spacy.lang.en.stop_words import STOP_WORDS
from spacy.lang.fr.stop_words import STOP_WORDS as STOP_WORDS_FR
from spacy.lang.de.stop_words import STOP_WORDS as STOP_WORDS_GR
from string import punctuation
import src.topics.lda_topic_prediction as lda_topic_prediction
from collections import Counter
from transformers import T5Tokenizer, T5ForConditionalGeneration
from src.recommendations.ifidf_recommender import get_recommendation

model = T5ForConditionalGeneration.from_pretrained('t5-small')
tokenizer = T5Tokenizer.from_pretrained('t5-small')


def local_nlp_features(text: string):
    """ This function is for texts in English, French, or German.
        Bert Model is used for summarization.
        Here specific parameters are set to
        generate the summary by using the Bert model.
        Keywords are extracted by using the gensim model.
    """

    if(text==''):
        return {
            'statusCode': 500,
            'message': 'There has been a problem extracting the information. '
        }

    else:
        # Bertsummary
        preprocess_text = text.strip().replace("\n", "")
        t5_prepared_Text = "summarize: " + preprocess_text
        tokenized_text = tokenizer.encode(t5_prepared_Text,
                                          return_tensors="pt",
                                          max_length=512,
                                          truncation=True,
                                          )
        summary_ids = model.generate(tokenized_text,
                                     num_beams=4,
                                     no_repeat_ngram_size=9,
                                     length_penalty=1.0,
                                     min_length=100,
                                     max_length=500,
                                     early_stopping=True
                                     )
        bertsummary = tokenizer.decode(summary_ids[0],
                                       skip_special_tokens=True)
        
        predict_text = lda_topic_prediction.PredictTextTopic()

        topics = predict_text.LDA_Predict_Topics(text)

        keywords = predict_text.LDA_Predict_Keywords(text)

        recommendations = get_recommendation(text)

        data = {'original_text': text, 'summary': bertsummary,
                'topics': topics, 'keywords': keywords,
                'recommendations': recommendations }
        return data


def api_nlp_features(text: string):
    """ This function is for texts in English, French, or German.
        Bert Model is used for summarization.
        Here specific parameters are set to
        generate the summary by using the Bert model.
        Keywords are extracted by using the gensim model.
    """

    if(text==''):
        return {
            'statusCode': 500,
            'message': 'There has been a problem extracting the information. '
                       'Please add the information manually for now.'
        }

    else:
        # Bertsummary
        try:
            preprocess_text = text.strip().replace("\n", "")
            t5_prepared_Text = "summarize: " + preprocess_text
            tokenized_text = tokenizer.encode(t5_prepared_Text,
                                              return_tensors="pt",
                                              max_length=512,
                                              truncation=True,
                                              )
            summary_ids = model.generate(tokenized_text,
                                         num_beams=4,
                                         no_repeat_ngram_size=9,
                                         length_penalty=1.0,
                                         min_length=100,
                                         max_length=500,
                                         early_stopping=True
                                         )
            bertsummary = tokenizer.decode(summary_ids[0],
                                           skip_special_tokens=True)
            summary_object = {
                'text': bertsummary
            }
        except Exception:
            summary_object = {
                'statusCode': 500,
                'message': 'Something went wrong creating '
                           'the summary, please add the '
                           'information manually for now'
            }
        try:
            predict_text = lda_topic_prediction.PredictTextTopic()
            topics = predict_text.LDA_Predict_Topics(text)
            topics_Object = {
                'topics': topics
            }
        except Exception:
            topics_Object = {
                'statusCode': 500,
                'message': 'Something went wrong '
                           'predicting the topics, '
                           'please add the information '
                           'manually for now',
            }
        try:
            predict_text = lda_topic_prediction.PredictTextTopic()
            keywords = predict_text.LDA_Predict_Keywords(text)
            keywords_Object = {
                'keywords': keywords
            }
        except Exception:
            keywords_Object = {
                'statusCode': 500,
                'message': 'Something went wrong while '
                           'finding the keywords, '
                           'please add the information '
                           'manually for now',
            }
        data = {'original_text': text, 'summary': summary_object,
                'topics': topics_Object, 'keywords': keywords_Object }
        return data


def removeDuplicates(x):
    return list(dict.fromkeys(x))
