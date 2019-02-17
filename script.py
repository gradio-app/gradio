from bs4 import BeautifulSoup

sketchpad_url = 'templates/sketchpad_input.html'
all_io_url =  'templates/all_io.html'
sketchpad_page = open(sketchpad_url)
all_io_page = open(all_io_url)
sketchpad_soup = BeautifulSoup(sketchpad_page.read())
all_io_soup = BeautifulSoup(all_io_page.read())
input_tag = all_io_soup.find("div", {"id": "input"})
input_tag.replace_with(sketchpad_soup)
f = open("templates/tmp_html.html", "w")
f.write(str(all_io_soup.prettify))