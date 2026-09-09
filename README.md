# SpaceMush Website — simple editing guide

This website is designed so normal content changes happen in `js/data.js` and the `images/` folders. You normally do not need to edit `index.html`, `js/app.js`, or `css/style.css`.

## Add a new project

### 1. Create the project image folder

Inside:

`images/projects/`

create a folder such as:

`mush-42`

Put the photos inside it:

- `01.jpg`
- `02.jpg`
- `03.jpg`
- etc.

### 2. Add the project to `js/data.js`

Go to the `mushData` array and copy the **NEW PROJECT TEMPLATE** at the bottom of the file. Paste the new project object just before the closing `];` of `mushData` and replace the example values.

The important fields are:

- `id` — use the next unused number, e.g. `004`
- `handle` — e.g. `Mush_42_NewProject`
- `loc`
- `area`
- `year`
- `budget`
- `type`
- `timeline`
- `architect`
- `designer`
- `contractor`
- `caption`
- `desc`
- `philosophy`
- `materials`
- `images`
- `client`

### 3. Put the project into the public feed

In the **HOME FEED ORDER** section of `data.js`, add one line wherever you want the project to appear:

`{ type: 'project', id: '004' }`

For example, to put MUSH 42 after Nathan's Home:

`{ type: 'project', id: '002' },`
`{ type: 'project', id: '004' },`
`{ type: 'info', key: 'whoWeAre' },`

The website uses the project's stable `id`, so changing the order of projects in `mushData` will not break the feed.

## Team and location

Team images are in `images/team/`.

The parking/location image is in `images/location/parking_guidance.jpg`.

## Brochures

Existing project brochures are in `documents/`. If a new project has a brochure, add the PDF there and add its brochure entry in `BROCHURE_B64` in `data.js`.

## Important

- Keep image filenames simple: `01.jpg`, `02.jpg`, `03.jpg`.
- Keep project IDs unique.
- Save `data.js` before refreshing the local preview.
- Test locally before uploading changes to GitHub.


## Simple workflow for a new project

1. Create a folder under `images/projects/`, for example `mush-42`.
2. Put the project photos inside it as `01.jpg`, `02.jpg`, `03.jpg`, etc.
3. Open `js/data.js`.
4. Copy the **NEW PROJECT TEMPLATE** near the bottom into the `mushData` array.
5. Replace the example values, especially `id`, `title`, `handle`, `loc`, `client`, and the image paths.
6. Save and refresh the local preview.
7. To show the new project in the homepage feed, add `{ type: 'project', id: '004' }` to `FEED_CONFIG` in `js/data.js`.

### Important
- `index.html` and `js/app.js` are the website engine. Leave them alone unless you are intentionally changing functionality.
- `js/data.js` is the content file.
- Project titles shown publicly come from `title`, not the internal `handle`.
- Client information is shown independently from testimonials.
- The current public feed order is controlled by `FEED_CONFIG`.
