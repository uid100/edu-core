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

### css structure notes:

_**base.css**_ — global resets + typography + HTML element defaults
This file should contain:

- body, h1–h6, p, ul, ol, dt, dd
- global font settings
- global background color
- spacing resets
- table defaults

_**layout.css**_ — page structure, spacing, positioning
This file handles:

- card spacing
- margins
- widths
- layout containers
- timeline positioning
- floating images

_**components.css**_ — reusable UI components
This file contains:

- cards
- headers
- markers
- labels
- boxed paragraphs
- shadows
- letter blocks
- signposts
- highlights

_**utilities.css**_ — small helper classes
These are single‑purpose classes:

- .col-20, .col-30, .col-35, .col-80
- .highlight
- .signpost
- .ic-flash-info
- .example
- .logo

_**theme.css**_ — colors, branding, college-specific overrides
This is where you put:

- Palomar colors
- SDCC colors
- Grossmont colors
- Logo overrides
- Header backgrounds
- Syllabus/policy header backgrounds
