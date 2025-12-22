# edu-core
course engine


### folder structure
```
edu-core/
│
├── assets/
│   └── images/
│
├── colleges/
│   ├── cuyamaca.json
│   ├── palomar.json
│   ├── sdmesa.json
│   └── sfcollege.css
│
├── css/
│   ├── base.css
│   ├── layout.css
│   └── theme.css
│
├── js/
│   ├── core.js              # main renderer
│   ├── fetch-course.js      # loads JSON from course repo
│   ├── templates.js         # HTML template functions
│   └── utils.js
│
├── outcomes/
│   └── institutional/
│
├── templates/
│   ├── homepage.html
│   ├── syllabus.html
│   ├── module.html
│   └── assignment.html
│
├── shared-content/
│   ├── policies/
│   │   ├── academic-integrity.md
│   │   └── late-policy.md
│   ├── images/
│   └── snippets/
│
├── index.html               # main renderer entry point
└── README.md
```

## canvas page:
```
<iframe 
  src="https://yourname.github.io/edu-core/index.html?course=cs101-sdcc"
  width="100%" height="2000">
</iframe>
```

## render fetches:
`https://raw.githubusercontent.com/yourname/cs101-sdcc/main/course.json`


### LOCAL TESTING:
```
cd ~/proj/edu-core
python -m http.server 8000
```

browse to:
`http://localhost:8000/templates/homepage.html?course=palomar-csit175`

