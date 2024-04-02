import os
import re
import string

import dask.dataframe as dd
import gensim
import numpy as np
import pandas as pd
import spacy
import sqlalchemy as sqla
from gensim import corpora, models, similarities
from nltk.corpus import stopwords
from nltk.stem.wordnet import WordNetLemmatizer
from sqlalchemy.orm import sessionmaker

# import Database_Connector

nlp = spacy.load("en_core_web_sm")


# to be tested
# nlp =spacy.load("en_trf_bertbaseuncased_lg")
def get_csv_data_frame(path):
    return pd.read_csv(path, sep=',', encoding='utf-8')


def clean_text_round(TEXT):
    '''Make text lowercase, remove text in square brackets,
       remove punctuation and remove words containing numbers.

    Args:
        TEXT: string containing article text

    Returns:
        string after cleaning
    '''
    text = TEXT.lower()
    text = re.sub(r'\[.*?\]', '', text)
    text = re.sub(r'[%s]' % re.escape(string.punctuation), '', text)
    text = re.sub(r'\w*\d\w*', '', text)
    text = re.sub(r'[‘’“”…]', '', text)
    text = re.sub(r'\n', '', text)
    return text


def Clean_Text(x):
    return clean_text_round(x)


def get_stop_words(STOPWORDS_TXT_FILE):
    '''Get stop words.

    Args:
        STOPWORDS_TXT_FILE: string containing
        path of text file containing german stop words.

    Returns:
        list containing stop words
    '''
    stop_words = set(stopwords.words("german"))
    stop_words_english = set(stopwords.words("english"))

    new_words = []
    f = open(STOPWORDS_TXT_FILE, "r")
    for x in f:
        x = re.sub("\n", "", x)
        new_words.append(x)

    stop_words = stop_words.union(new_words)
    stop_words = stop_words.union(stop_words_english)
    return (stop_words)

## To do fix cur_dir for new folder structure
def stop_words_list():
    cur_dir = os.path.dirname(__file__) 
    remove_rec = cur_dir.split('/')
    cur_dir = '/'.join(remove_rec[:-1])
    return get_stop_words(os.path.join(cur_dir, 'topics/models/'
                                       'LDA_Model', 'stop_words_en.txt'))


def get_corpus(TEXT):
    '''Make text lowercase, remove punctuation and remove stop words.

    Args:
        TEXT: string containing article text

    Returns:
        string after cleaning
    '''
    try:
        # Remove punctuations
        text = re.sub('[^a-zA-Z]', ' ', TEXT)
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
        text = [lem.lemmatize(word) for word in text
                if word not in stop_words_list()]
        text = " ".join(text)
        # print(text)
        return text
    except ValueError:
        # print("Error Cleaning Text: " + str(ValueError))
        return ""
    else:
        return(text)
    # finally:
    #   return(text)


def Clean_Corpus(x):
    return get_corpus(x)


def apply_dask_spacy_clean(DF, DASK_PARTATIONS=16):
    """process the text column with dask.

    Args:
        DF: dataframe containing column: corpus'
        DASK_PARTATIONS: integer value for dask partations

    Returns:
        dataframe containg additional column: 'spacy_corpus'
    """
    df_dd_art_corp = dd.from_pandas(DF[['corpus']],
                                    npartitions=DASK_PARTATIONS)
    series_articles_clean_spacy = \
        df_dd_art_corp.corpus.apply(Clean_Corpus_Spacy,
                                    meta=('corpus', 'str')).compute()
    DF['spacy_corpus'] = series_articles_clean_spacy
    return DF


def get_corpus_spacy(TEXT):
    """Make text lowercase, remove punctuation and remove stop words.

    Args:
        TEXT: string containing article text

    Returns:
        string after cleaning
    """
    doc = nlp(TEXT)
    text_list = [token.lemma_ for token in doc if
                 (token.pos_ == 'NOUN' or token.pos_ == 'PROPN'
                  or token.pos_ == 'ADJ')]
    text = " ".join(text_list)
    return text


def Clean_Corpus_Spacy(x):
    return get_corpus_spacy(x)


def tokenize(text):
    return [token for token in gensim.utils.simple_preprocess(text)
            if token not in stop_words_list()]


def save_recommendation(id, text, dfAllPosters):
    cur_dir = os.path.dirname(__file__) + '/model/'
    loaded_dict = corpora.Dictionary.load(os.path.join(cur_dir, 'TFIDF',
                                                       'dictionaryss.dict'))
    loaded_corp = corpora.MmCorpus(os.path.join(cur_dir, 'TFIDF',
                                                'corpus_tfIdf.mm'))
    tfidf_model = models.TfidfModel(loaded_corp)

    index_sparse = \
        similarities.SparseMatrixSimilarity(loaded_corp,
                                            num_features=loaded_corp.num_terms)
    index_sparse.num_best = 10

    query_doc = loaded_dict.doc2bow(tokenize(text))

    query_doc_tf_idf = tfidf_model[query_doc]

    List = [item[0] for item in index_sparse[query_doc_tf_idf]]

    dfAllPosters = dfAllPosters.ix[List]

    dfAllPosters = dfAllPosters[not(dfAllPosters.id == id)]
    dfAllPosters = dfAllPosters[['id']]
    dfAllPosters['poster_recommended'] = dfAllPosters['id']
    dfAllPosters['ranking'] = range(0, 0 + len(dfAllPosters))
    dfAllPosters['id'] = id

    return dfAllPosters


def generate_recommendations(df_clean, dbCon, engine):
    dfAll = pd.DataFrame(columns=['poster_recommended', 'ranking', 'id'])
    for row in df_clean.iterrows():
        dfRecommendations = save_recommendation(row['id'],
                                                row['structured_text'],
                                                df_clean)
        dfAll = dfAll.append(dfRecommendations, ignore_index=True)
    # print('all')
    conn = dbCon.Get_SQL_Trusted_PYODBC_Connection()
    # postersquery = dbCon.GetExistingRecommendationsQuery()
    # for future development we update the existing recommendations instead
    # of deleting them and adding them new
    # df_existingRecommendations=pd.read_sql(postersquery, engine)
    cursor = conn.cursor()
    cursor.execute(" delete from poster_recommendations ")
    conn.commit()
    cursor.close()
    dbCon.Save_DF_To_SQL_DynamicChunk_dtyp(dfAll, 'poster_recommendations',
                                           'append')
    return "SQL recommendations saved"


def generate_tfidf(path):
    cur_dir = os.path.dirname(__file__) + '/model/'
    # print(cur_dir)
    df_clean = get_csv_data_frame(os.path.join(path))
    if isinstance(df_clean, pd.DataFrame):
        # print(df_clean)
        # print(df_clean.text.swifter)
        corpus_art = df_clean.text.swifter.apply(Clean_Corpus)
        # here dask gives problem when list is returned
        df_clean['corpus'] = corpus_art

        df_clean = apply_dask_spacy_clean(df_clean)
        # num_art = df_clean.shape[0]

    if isinstance(df_clean, pd.DataFrame):
        spacy_text = df_clean['spacy_corpus']
        text_list = [i.split() for i in spacy_text]
        # print('get spacy corpus')

        # Creating the term dictionary of our courpus,
        # where every unique term is assigned an index.
        dictionary = corpora.Dictionary(text_list)
        # dictionary=dictionary.filter_extremes(no_below=5, no_above=0.3),
        # keep_n=50000

        # Converting list of documents (corpus) into Document Term Matrix
        # using dictionary prepared above.
        doc_term_matrix = [dictionary.doc2bow(doc) for doc in text_list]
        # num_art = len(doc_term_matrix)

        dict_file = os.path.join(cur_dir, 'TFIDF', 'dictionaryss.dict')
        dictionary.save(dict_file)
        corpora.MmCorpus.serialize(os.path.join(cur_dir, 'TFIDF', 'corpus.mm'),
                                   doc_term_matrix)

        tfidf = models.TfidfModel(doc_term_matrix)
        corpus_tfidf = tfidf[doc_term_matrix]
        corpus_file = os.path.join(cur_dir, 'TFIDF', 'corpus_tfIdf.mm')
        corpora.MmCorpus.serialize(corpus_file, corpus_tfidf)


def get_corpusRec(TEXT):
    '''Make text lowercase, remove punctuation and remove stop words.

    Args:
        TEXT: string containing article text

    Returns:
        string after cleaning
    '''
    try:
        # Remove punctuations
        text = re.sub('[^a-zA-Z]', ' ', TEXT)
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
        text = [lem.lemmatize(word) for word in text
                if word not in stop_words_list()]
        text = " ".join(text)
        # print (text)
        return text
    except ValueError:
        # print("Error Cleaning Text: " + str(ValueError))
        return ""
    finally:
        return text


def get_recommendation(text):
    cur_dir = os.path.dirname(__file__) + '/model/'
    loaded_dict = corpora.Dictionary.load(os.path.join(cur_dir, 'TFIDF',
                                                       'dictionaryss.dict'))
    loaded_corp = corpora.MmCorpus(os.path.join(cur_dir, 'TFIDF',
                                                'corpus_tfIdf.mm'))
    df_clean = get_csv_data_frame(os.path.join(cur_dir,
                                               'TFIDF', 'dataset.csv'))

    tfidf_model = models.TfidfModel(loaded_corp)

    index_sparse = \
        similarities.SparseMatrixSimilarity(loaded_corp,
                                            num_features=loaded_corp.num_terms)
    index_sparse.num_best = 6
    cleantext = get_corpusRec(text)
    # print ("tokenizedtext: ", cleantext)
    tokenizedtext = tokenize(cleantext)
    query_doc = loaded_dict.doc2bow(tokenizedtext)
    query_doc_tf_idf = tfidf_model[query_doc]

    list = [int(item[0]) for item in index_sparse[query_doc_tf_idf]]
    list2 = [item for item in df_clean.loc[list]['text']]
    # for i in range(0, len(index_sparse[query_doc_tf_idf])):
    #     array = [int(index_sparse[query_doc_tf_idf][i]),
    # index_sparse[query_doc_tf_idf][i]]
    #     list.append(array)
    # print(list)
    # return df_clean.loc[List].to_html()
    # print(df_clean.loc[List])
    # return [list, df_clean.loc[list]]
    return list2
    # return list
