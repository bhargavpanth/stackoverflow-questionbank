import sys  
from PyQt4.QtGui import *  
from PyQt4.QtCore import *  
from PyQt4.QtWebKit import *
from bs4 import BeautifulSoup
import argparse
import re
import unicodedata
import time
from pymongo import MongoClient
from rq import Queue
import urllib
# import tldextract

client = MongoClient()
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
		
		for link in soup.find_all('a', {'class': 'question-hyperlink'}):
			for eachlink in link:
				source = link.get('href')
				print eachlink
				print str(source)
		

def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('-s', '--search', help='Enter the search term')
    return parser.parse_args()

def main():
	pg = sys.argv[2]
	tag = sys.argv[1]
	# tag = (urllib.quote(sys.argv[1])).lower()
	url = "http://stackoverflow.com/questions/tagged/"+tag+"?page="+pg+"&sort=oldest&pagesize=15"
	print url
	r = Render(url)
	html = r.frame.toHtml()
	src = unicode(html)
	rq = r.parse_required(src, url)

main()