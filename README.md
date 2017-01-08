## StackOverflow Question Bank

### Folder structure

```
├── QGen
│   └── scrape_stackoverflow.py
├── API
│   └── server
│			└── controllers
│			└── models
│
│
│
└── README.md 
```

### QGen

* ```python``` script to scrape and fetch questions via ```StackOverflow``` 
* ```skill_tag``` can be any of the tags existing on stackoverflow
* ```page_no``` is the specific page number 

```
$ python QGen/scrape_stackoverflow.py skill_tag page_no
$ python QGen/scrape_stackoverflow.py c 1

```

Title and URL pair is stored for "On-demand" question retrival. Please note that, the top level domain needs to be added to the URL scrapped


