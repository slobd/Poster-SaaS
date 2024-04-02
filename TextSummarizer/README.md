## Project Overview
The entry file for the NLP module is the main.py file. It maintains the routes used for the nlp.posterlab.co and 
the web-app. 

## Routes for nlp.posterlab.co

There are two routes for nlp.posterlab.co.

1. /summarize : to generate NLP data for input text
2. /readpdf : to process and generate NLP data for the uploaded pdf file

Since the recomendation feature is only active for nlp.posterlab.co (by passing type = 'local' for `NLP` class argument), the output of these routes will also have a `recommendations` key (which is not available for web-app). 
## Routes for web-app
The web-app currently uses only one route:

1. /api/readpdf : to process and generate NLP data for the uploaded pdf file

## Project Structure
```
/src/
    /keywords/
    /recommendation/
    /summary/
    /topics/
    index.py
    pdfextractor.py

```
The index.py holds the `NLP` class that manages the `NLP sub classes`.

For any future developments to make each NLP feature as a micro service, specific methods inside ```NLP``` class can be created. 
