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
		div = soup.find('div', {'class': 'post-text'})
		child = div.findChildren()
		# for eachchild in child:
			# print eachchild.text
		question = soup.find('p')
		for eachq in question:
			print eachq
		
def insert_db(title, url, tag):
	try:
		db.question_index.insert_one({"title":title, "url":url, "tag":tag})
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
	url = sys.argv[1]
	print url
	r = Render(url)
	html = r.frame.toHtml()
	src = unicode(html)
	rq = r.parse_required(src, url)

main()