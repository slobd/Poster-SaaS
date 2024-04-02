from textsummarizer import api_nlp_features, local_nlp_features
from pdfminer.pdfinterp import PDFResourceManager, PDFPageInterpreter
from pdfminer.converter import TextConverter
from pdfminer.layout import LAParams
from pdfminer.pdfpage import PDFPage
from io import StringIO
import re


def get_text(path):
    try:
        rsrcmgr = PDFResourceManager()
        retstr = StringIO()
        # codec = 'utf-8'
        laparams = LAParams()
        device = TextConverter(rsrcmgr, retstr, laparams=laparams)
        fp = open(path, 'rb')
        interpreter = PDFPageInterpreter(rsrcmgr, device)
        password = ""
        maxpages = 0
        caching = True
        pagenos = set()

        for page in PDFPage.get_pages(fp, pagenos, maxpages=maxpages,
                                      password=password, caching=caching,
                                      check_extractable=True):
            interpreter.process_page(page)

        text = retstr.getvalue()

        fp.close()
        device.close()
        retstr.close()
        text = re.sub(r'\w+:\/{2}[\d\w-]+(\.[\d\w-]+)*(?:(?:\/[^\s/]*))*', '',
                      text)
        text = text.replace("\\u2018", "'")
        text = text.replace("\u2019", "'")
        text = text.replace("\u2022", "-")
        text = text.replace("\n", " ")
        return text
        # if(callType == 'api'):
        #     return api_nlp_features(text.rstrip())
        # else:
        #     return local_nlp_features(text.rstrip())

    except Exception:
        return ''
        # if(callType == 'api'):
        #     return api_nlp_features('')
        # else:
        #     return local_nlp_features('')
