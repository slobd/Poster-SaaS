import os
import pandas as pd
import configparser
import gensim
from gensim import corpora
from bs4 import BeautifulSoup
import re
import string
from nltk.corpus import stopwords
from nltk.stem.wordnet import WordNetLemmatizer
import spacy
import numpy as np
from gensim.summarization import keywords as kw

nlp = spacy.load("en_core_web_sm")


class PredictTextTopic:

    def __init__(self, DIR="LDA_Model/", CONFIG_FILE='lda_config.ini'):
        self.cur_dir = os.path.dirname(__file__)
        self.cur_dir = self.cur_dir + '/models/'
        self.cur_dir = os.path.join(self.cur_dir, DIR)
        self.Read_Config_File(CONFIG_FILE, self.cur_dir)
        self.cur_dir = self.cur_dir
        lm_list = \
            gensim.models.ldamodel.LdaModel.load(
                f'{self.cur_dir}{self.lda_model_file}')

        self.lda_model = lm_list
        self.dictionary = \
            corpora.Dictionary.load(f'{self.cur_dir}{self.dictionary_file}')
        self.stop_words_file = \
            f'{self.cur_dir}{self.stop_word_file}'

        self.topicsArray = ['Environment',
                            'Analytical Chemistry',
                            'No related topic',
                            'Biomedical Engineering',
                            'Epidemiology',
                            'Medical and Health Sciences',
                            'Psychology and Cognitive Sciences',
                            'Economics',
                            'Politics',
                            'Optical Physics',
                            'Public Health',
                            'Linguistics',
                            'Medical and Health Sciences',
                            'Clinical Sciences',
                            'Neurosciences',
                            'Cultural Studies',
                            'Immunology',
                            'Biophysics',
                            'Biomedical Engineering',
                            'Education',
                            'Environment',
                            'Reproduction',
                            'Behavioral Science',
                            'Psychology',
                            'Pharmacology',
                            'Plant Biology',
                            'Public Health',
                            'Biology',
                            'Virology',
                            'Cognitive Sciences',
                            'Nutrition',
                            'Neurosciences',
                            'Immunology',
                            'Immunology',
                            'Medical Microbiology',
                            'Medical and Health Sciences',
                            'Genetics',
                            'Physiology OR Engineering',
                            'Oncology and Carcinogenesis',
                            'Health/Fitness',
                            'Ecology',
                            'Research',
                            'Public Health',
                            'Law',
                            'Molecular Biology',
                            'Agriculture',
                            'Quantum Physics',
                            'Education',
                            'Environmental Geoscience',
                            'Information and Computing Sciences',
                            'Clinical Sciences',
                            'Biology/Education',
                            'Scientific models',
                            'No related topic']

    def Read_Config_File(self, CONFIG_FILE, cur_dir):
        """Read configuration file parameters.

        Args:
            CONFIG_FILE: String containing name of configuration file

        Returns:
            return nothing
        """
        config = configparser.ConfigParser()
        config_file = os.path.join(cur_dir, CONFIG_FILE)
        config.read(config_file)
        cur_dir = (config.get('common', "cur_dir"))
        self.topics_number = int(config.get('common', "topics_number"))
        self.topic_num_start_LDA_list = \
            int(config.get('common', "topic_num_start_LDA_list"))
        self.lda_model_file = \
            config.get('common', "lda_model_list").replace("'", "")
        self.dictionary_file = \
            config.get('common', "lda_model_dictionary").replace("'", "")
        self.stop_word_file = \
            config.get('common', "stop_words_file").replace("'", "")

    def Clean_Text_Round(self, TEXT):
        """Make text lowercase, remove text in square brackets,
           remove punctuation and remove words containing numbers.

        Args:
            TEXT: string containing article text

        Returns:
            string after cleaning
        """
        # print('Inside Clean_Text_Round')
        text = TEXT.lower()
        text = re.sub(r'\[.*?\]', '', text)
        text = re.sub(r'[%s]' % re.escape(string.punctuation), '', text)
        text = re.sub(r'\w*\d\w*', '', text)
        text = re.sub(r'[‘’“”…]', '', text)
        text = re.sub(r'\n', '', text)
        return text

    def Get_Corpus(self, TEXT):
        """Make text lowercase, remove punctuation and remove stop words.

        Args:
            TEXT: string containing article text

        Returns:
            string after cleaning
        """
        stop_words = self.Get_Stop_Words()
        # Remove punctuations
        # text = re.sub('[^a-zA-Z]', ' ', df_corpus['editor_text'][i])
        TEXT = TEXT.lower()
        text = re.sub('[^a-zA]', ' ', TEXT)
        # Convert to lowercase
        text = text.lower()
        # remove tags
        text = re.sub("&lt;/?.*?&gt;", " &lt;&gt; ", text)
        # remove special characters and digits
        text = re.sub("(\\d|\\W)+", " ", text)
        # Convert to list from string
        text = text.split()
        text = [t for t in text if len(t) > 1]
        # Lemmatisation
        lem = WordNetLemmatizer()
        text = [lem.lemmatize(word) for word in text if word not in stop_words]
        text = " ".join(text)
        return text

    def Get_Corpus_Spacy(self, TEXT):
        """Make text lowercase, remove punctuation and remove stop words.

        Args:
            TEXT: string containing article text

        Returns:
            string after cleaning
        """
        doc = nlp(TEXT)
        text_list = [token.lemma_ for token in doc if
                     (token.pos_ == 'NOUN' or token.pos_ == 'PROPN'
                      )]
        text = " ".join(text_list)
        return text

    def Get_Stop_Words(self):
        """Get stop words.

        Args:
            self.stop_words_file: string containing path
            of text file containing german stop words.

        Returns:
            list containing stop words
        """
        stop_words = set(stopwords.words("german"))
        stop_words_english = set(stopwords.words("english"))

        new_words = []
        f = open(self.stop_words_file, "r")
        for x in f:
            x = re.sub("\n", "", x)
            new_words.append(x)

        stop_words = stop_words.union(new_words)
        stop_words = stop_words.union(stop_words_english)
        return stop_words

    def Get_Clean_Spacy_Text(self, text):
        """Cleans the text

        Args:
            TEXT: string containing article text

        Returns:
            string after cleaning
        """
        text = BeautifulSoup(text, 'html.parser').get_text()
        text = self.Get_Corpus(text)
        text = self.Get_Corpus_Spacy(text)
        return text

    def LDA_Predict_Topics(self, TEXT):
        """Predicts topic for given text

        Args:
            TEXT: string containing cleaned article text

        Returns:
            dataframe containing predicted topics
            with probability score and keywords
        """
        clean_text = self.Get_Clean_Spacy_Text(TEXT)
        bow_vector = self.dictionary.doc2bow(clean_text.split())
        detect_topics = self.lda_model[bow_vector]
        df_detect_topics = \
            pd.DataFrame(detect_topics,
                         columns=['topic_No', 'prob']).sort_values(
                             'prob', ascending=False)
        listOfTopics = []
        for i in range(0, 4):
            topic = []
            topicName = self.topicsArray[df_detect_topics['topic_No'].iloc[i]]
            probability = \
                round(float((df_detect_topics['prob'].iloc[i]) * 100))
            topic.append(topicName)
            topic.append(probability)
            listOfTopics.append(topic)
        return listOfTopics

    def LDA_Predict_Keywords(self, TEXT):
        clean_text = self.Get_Clean_Spacy_Text(TEXT)
        keywords = \
            list(kw(clean_text, words=12,
                    scores=False, lemmatize=True).split())
        return keywords
