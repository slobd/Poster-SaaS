import os
from src.pdfextractor import get_text
from src.summary.generate_summary import generate_summary
from src.topics.generate_topics import generate_topics
from src.keywords.generate_keywords import generate_keywords
from src.recommendations.ifidf_recommender import get_recommendation

class NLP:
    def __init__(self, filePath, type = 'api', inputText = ''):
        self.input_file = filePath
        if filePath:
            self.extracted_text = self.Extract_Pdf(filePath).rstrip()
        else:
            self.extracted_text = inputText
        self.type = type

    def Extract_Pdf(self, path):
        return get_text(path)
    
    def GenerateNLPData(self):
        if(self.extracted_text == ''):
            return {
                'statusCode': 500,
                'message': 'There has been a problem extracting the information. '
                        'Please add the information manually for now.'
            }
        else:
            summary = generate_summary(self.extracted_text)
            topics = generate_topics(self.extracted_text)
            keywords = generate_keywords(self.extracted_text)

            response = {'original_text': self.extracted_text, 'summary': summary,
                    'topics': topics, 'keywords': keywords }

            if (self.type == 'local'):
                recommendations = get_recommendation(self.extracted_text)
                response['recommendations'] = recommendations

            # Once NLP data is generated the input file is removed from the server
            if self.input_file:
                os.remove(self.input_file)

            return response