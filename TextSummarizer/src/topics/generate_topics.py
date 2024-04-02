import src.topics.lda_topic_prediction as lda_topic_prediction

def generate_topics(text):
    try:
        predict_text = lda_topic_prediction.PredictTextTopic()
        topics = predict_text.LDA_Predict_Topics(text)
    except Exception as err:
        topics = []
        # print ("error in topicsL ", err)
        # topics_Object = {
        #     'statusCode': 500,
        #     'message': 'Something went wrong '
        #                 'predicting the topics, '
        #                 'please add the information '
        #                 'manually for now',
        # }
    finally:
        return topics
