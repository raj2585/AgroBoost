from bs4 import BeautifulSoup
import requests
import json


url = 'https://pib.gov.in/PressReleaseIframePage.aspx?PRID=2002012'
html_text = requests.get(url).text
soup = BeautifulSoup(html_text, 'lxml')

# testing purpose
scheme_names = soup.find_all('td', style='width:108.6pt')
scheme_details = soup.find_all('td', style='width:336.85pt')


schemes = []


for name, detail in zip(scheme_names, scheme_details):
    scheme_name = name.get_text(strip=True)

    paragraphs = detail.find_all('p')
    scheme_detail = "\n\n".join(p.get_text(strip=True) for p in paragraphs) if paragraphs else detail.get_text(strip=True)

    schemes.append({'Scheme Name': scheme_name, 'Details': scheme_detail})


json_data = json.dumps(schemes, indent=4, ensure_ascii=False)


print(json_data)
