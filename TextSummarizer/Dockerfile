# start from base

FROM python:3.6-stretch

# We copy just the requirements.txt first to leverage Docker cache

COPY requirements.txt /app/requirements.txt

WORKDIR /app

RUN pip3 install -r requirements.txt

RUN pip3 install spacy_langdetect

# Download spacy package's dependency
RUN python3 -m spacy download en_core_web_sm

RUN python3 -m spacy download de_core_news_sm

RUN python3 -m spacy download fr_core_news_sm

RUN python -m nltk.downloader all

COPY . /app

CMD [ "python", "./main.py" ]