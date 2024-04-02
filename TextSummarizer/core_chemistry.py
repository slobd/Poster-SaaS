import requests
import csv

url = 'https://core.ac.uk:443/api-v2/search/language.name%' \
      '3AEnglish%20and%20topics%3AChemistry?page=1&' \
      'pageSize=100&apiKey=ZQNyjrMW2JdPCvpblesg38RakwnG5HLq'
x = requests.get(url)
y = x.json()
print(y["totalHits"])
with open('core-chemistry.csv', mode='w') as csv_file:
    fieldnames = ['Abstract']
    writer = csv.DictWriter(csv_file, fieldnames=fieldnames)

    writer.writeheader()
    for record in y["data"]:
        if (record["_source"]["description"]):
            print(record["_source"]["description"])
            writer.writerow({'Abstract': record["_source"]["description"]})
