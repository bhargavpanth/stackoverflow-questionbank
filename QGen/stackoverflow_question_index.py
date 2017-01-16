import sys  
from PyQt4.QtGui import *  
from PyQt4.QtCore import *  
from PyQt4.QtWebKit import *
from bs4 import BeautifulSoup
# import argparse
import unicodedata
import time
from pymongo import MongoClient
import urllib
# import tldextract

## Popularity based ranking - Priority

client = MongoClient("mongodb://localhost:27017/comcast")
db = client.comcast
  
class Render(QWebPage):
	def __init__(self, url):
		self.app = QApplication(sys.argv)
		QWebPage.__init__(self)
		self.loadFinished.connect(self._loadFinished)
		self.mainFrame().load(QUrl(url))
		self.app.exec_()
	
	def _loadFinished(self, result):
		self.frame = self.mainFrame()
		self.app.quit()


	def parse_required(self, source, url):
		soup = BeautifulSoup(source, 'html.parser')
		# texts = soup.findAll(text=True)
		title = str(soup.title.text.encode('utf-8'))
		question = soup.find('div', {'id': 'questions'})
		# Loop through each of the questions
		child = question.findChildren()
		# for eachchild in child:
		# print eachchild.text
		# for eachQuestion in soup.find_all('div', {'class': 'questions'}):
		elements = soup.find_all('div', class_= "question-hyperlink question-summary votes views".split())
		# print("\n".join("{} {}".format(el['class'], el.get_text()) for el in elements))
		for el in elements:
			# print format(el.get_text())
			if el['class'] == 'votes':
				print format(el.get_text())
			print format(el['views'], el.get_text())
			print format(el['question-summary'], el.get_text())
			print '-+-+-+-+-+-+-'
			# source = eachq.get('href')
			# t = soup.findAll('a', {'class': 'post-tag'})
			# summary = soup.find('div', {'class': 'excerpt'})
			# votes = soup.find('span', {'class': 'vote-count-post'})
			# print "Summary : " + summary.text
			# print "URL : " + source
			# print "Question title : " + eachq.text
			# print "Popularity : " + votes.text
			# insert_db(eachlink, str(source), sys.argv[1], url)
		
def insert_db(title, url, tag, src):
	try:
		db.question_index.insert_one({"title":title, "url":url, "tag":tag, "source":src})
	except Exception, e:
		print "[x]"
		pass
	else:
		print "title : " + title
		print "URL : " + url
		print "Tag : " + tag
	finally:
		print '-+-+-+-+-+-+-+-+-'
		# Run each URL in threads
		time.sleep(0.2)

# def parse_args():
#     parser = argparse.ArgumentParser()
#     parser.add_argument('-s', '--search', help='Enter the search term')
#     return parser.parse_args()

def main():
	pg = sys.argv[2]
	tag = sys.argv[1]
	## skill tag
	## page number
	# tag = (urllib.quote(sys.argv[1])).lower()
	url = "http://stackoverflow.com/questions/tagged/"+tag+"?page="+pg+"&sort=oldest&pagesize=15"
	print url
	r = Render(url)
	html = r.frame.toHtml()
	src = unicode(html)
	rq = r.parse_required(src, url)
	# for eachpg in range(int(pg), 0, -1):
	# 	url = "http://stackoverflow.com/questions/tagged/"+tag+"?page="+str(eachpg)+"&sort=oldest&pagesize=15"
	# 	print url
	# 	r = Render(url)
	# 	html = r.frame.toHtml()
	# 	src = unicode(html)
	# 	rq = r.parse_required(src, url)

main()