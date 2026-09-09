# SpaceMush Website — Simple Content System

This website is designed so normal content changes happen in **one place: `js/data.js`**.

## The important idea

**Everything in the public feed is a POST.**

A project is a post.

An architect introduction is a post.

A design-philosophy carousel is a post.

A location guide is a post.

An FAQ carousel is a post.

You do not need a separate system for projects and informational content.

---

## Folder structure

```text
SpaceMush-Main-Fixed/
├── index.html                 ← website structure; normally do not edit
├── css/style.css              ← visual design; normally do not edit
├── js/
│   ├── app.js                 ← website engine; do not edit for content
│   └── data.js                ← CONTENT CONTROL CENTER
├── images/
│   ├── posts/                 ← normal carousel-post images
│   ├── projects/              ← project-post images
│   ├── team/                  ← founder/team photos
│   ├── location/              ← office/location images
│   └── logo/                  ← logos
└── documents/                 ← project brochures
```

## How to add a new normal carousel post

### Step 1 — create the image folder

Create a folder inside:

```text
images/posts/
```

For example:

```text
images/posts/design-philosophy/
```

Put your images inside it:

```text
01.jpg
02.jpg
03.jpg
04.jpg
```

### Step 2 — open `js/data.js`

Find:

```js
const CONTENT_POSTS = {
```

Add a new post object inside it.

Example:

```js
"designPhilosophy": {
  "type": "carousel",
  "author": { "name": "spacemush_architects_chennai", "avatar": "SM" },
  "subtitle": "Our philosophy · Small Spaces Deserve Design",
  "caption": "<span class=\"handle\">spacemush_architects_chennai</span> Every inch matters. <span class=\"hashtag\">#SmallSpacesDeserveDesign</span>",
  "action": { "onClick": "bookConsultationWhatsApp()" },
  "slides": [
    {
      "type": "image",
      "src": "images/posts/design-philosophy/01.jpg",
      "alt": "SpaceMush design philosophy"
    },
    {
      "type": "image",
      "src": "images/posts/design-philosophy/02.jpg",
      "alt": "SpaceMush design philosophy"
    },
    {
      "type": "image",
      "src": "images/posts/design-philosophy/03.jpg",
      "alt": "SpaceMush design philosophy"
    },
    {
      "type": "image",
      "src": "images/posts/design-philosophy/04.jpg",
      "alt": "SpaceMush design philosophy"
    }
  ]
},
```

### Step 3 — put it in the feed

Find:

```js
const FEED_CONFIG = [
```

Add the post key where you want it to appear:

```js
"designPhilosophy",
```

For example:

```js
const FEED_CONFIG = [
  "where-it-all-begins",
  "la-perle",
  "who-ssr",
  "designPhilosophy",
  "anna-nagar",
  ...
];
```

Save the file and refresh the website.

**You do not edit `app.js` or `style.css`.** The source records are in `CONTENT_POSTS`; the normalized public object is `POSTS`.

---

# How to add a NEW PROJECT POST

Projects use the exact same post system.

### Step 1 — create the project image folder

For example:

```text
images/posts/mush-42/
```

Put the project photos inside:

```text
01.jpg
02.jpg
03.jpg
04.jpg
```

### Step 2 — add the project to `POSTS` in `data.js`

Use this structure:

```js
"mush-42": {
  "type": "project",
  "id": "004",
  "title": "Project Name",
  "handle": "Mush_42_ProjectName",
  "loc": "Location, Chennai",
  "emoji": "🏠",
  "tag": "Residential",
  "gradient": "linear-gradient(160deg,#f5e6e6 0%,#ffe8cc 100%)",
  "bg": "135deg,#3a1010,#2a1800",
  "category": "residential designbuild",
  "area": "AREA",
  "year": "2026",
  "budget": "BUDGET",
  "type": "G+1 Residence",
  "timeline": "TIMELINE",
  "architect": "ARCHITECT NAME",
  "designer": "Team SpaceMush",
  "contractor": "SpaceMush LLP",
  "likes": 0,
  "comments": 0,
  "hasStory": false,
  "caption": "Write the Instagram-style project caption here.",
  "hashtags": [
    "#SpaceMush",
    "#SmallSpacesDeserveDesign",
    "#Architecture"
  ],
  "desc": "Write the full project description here.",
  "philosophy": "Write the design philosophy here.",
  "materials": [
    "Material 1",
    "Material 2"
  ],
  "palette": [
    "#f5f5f0",
    "#8293a8",
    "#0a0a0a"
  ],
  "gallery": ["🏠", "🪜", "🪟"],
  "images": [
    "images/posts/mush-42/01.jpg",
    "images/posts/mush-42/02.jpg",
    "images/posts/mush-42/03.jpg",
    "images/posts/mush-42/04.jpg"
  ],
  "brochureKey": null,
  "testimonial": null,
  "client": "Client Name, Chennai",
  "times": "2026"
},
```

**Important:** use `type: "project"` to mark this as a project post. Keep the building type in its project metadata, such as `G+1 Residence`.

### Step 3 — add the post key to `FEED_CONFIG`

```js
"mush-42",
```

Put it exactly where you want the project to appear in the continuous feed.

---

# How to edit an existing post

Find its key inside `POSTS`.

You can change:

- caption
- subtitle
- text
- slide order
- slide images
- hashtags
- project information
- client name
- architect
- year
- area
- project photos

Do not change the post key if the post is already in `FEED_CONFIG`.

Example:

```js
"la-perle": {
```

is the La Perle post.

---

# How to change an existing image

Replace the image file while keeping the same filename.

For example:

```text
images/posts/la-perle/01.jpg
```

Replace that file with the new `01.jpg`.

No code change is needed if the filename stays the same.

---

# Current public feed order

```text
1. Where It All Begins
2. La Perle
3. Who is SSR?
4. Anna Nagar
5. How We Design
6. Nathan's Home
7. Who We Are
8. How to Find Us
9. Contact SpaceMush
10. FAQ
```

The first post is intentionally labelled **WHERE IT ALL BEGINS** instead of `WELCOME`.

---

# Navigation change

The magnifying-glass Search button has been removed from:

- desktop/laptop sidebar
- mobile bottom navigation

The navigation reflows without leaving an empty Search slot.

# Feed spacing change

The public feed no longer shows `0 comments` / `View all 0 comments` placeholders.

Additional spacing has been added around captions and post labels so the text does not feel crowded between posts.

# What you normally should NOT edit

Do not edit these for ordinary content work:

```text
index.html
css/style.css
js/app.js
```

If you want a new type of visual component or a change to how every carousel behaves, that is an engine/design change and should be handled separately.
