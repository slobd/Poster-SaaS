import src.topics.lda_topic_prediction as lda_topic_prediction

def generate_keywords(text):
    try:
        predict_text = lda_topic_prediction.PredictTextTopic()
        keywords = predict_text.LDA_Predict_Keywords(text)
    except Exception:
        keywords = []
        # keywords_Object = {
        #     'statusCode': 500,
        #     'message': 'Something went wrong while '
        #                 'finding the keywords, '
        #                 'please add the information '
        #                 'manually for now',
        # }
    finally:
        return keywords
