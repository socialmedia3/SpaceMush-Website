// ============================================================
// SPACEMUSH WEBSITE — CONTENT DATA
// ============================================================
// This is the main file to edit when project content changes.
// You do NOT need to edit index.html or app.js to add a project.
//
// SIMPLE RULE:
// 1. Create a project folder inside images/projects/
// 2. Put the project photos there (01.jpg, 02.jpg, 03.jpg...)
// 3. Copy the NEW PROJECT TEMPLATE at the bottom of this file
// 4. Replace the CAPITALIZED / example values
// 5. Save the file
// ============================================================


// ------------------------------------------------------------
// BROCHURES
// ------------------------------------------------------------
// These connect project brochure buttons to PDF files.
// Usually you do not need to change this section unless a new
// project also has a brochure.
// ------------------------------------------------------------
const BROCHURE_B64 = {
  mush05: {
    filename: 'MUSH_05_AnnaNagar_Residence_Brochure.pdf',
    path: 'documents/MUSH_05_AnnaNagar_Residence_Brochure.pdf'
  },
  mush38: {
    filename: 'MUSH_38_NathansHome_Brochure.pdf',
    path: 'documents/MUSH_38_NathansHome_Brochure.pdf'
  },
  mush18: {
    filename: 'MUSH_18_LaPerle_Residence_Brochure.pdf',
    path: 'documents/MUSH_18_LaPerle_Residence_Brochure.pdf'
  }
};


// ------------------------------------------------------------
// LOCATION / OFFICE IMAGES
// ------------------------------------------------------------
const OFFICE_B64 = {
  parking_guidance: 'images/location/parking_guidance.jpg'
};


// ------------------------------------------------------------
// TEAM / FOUNDER IMAGES
// ------------------------------------------------------------
// SSR and Shyam are used by the existing website posts.
// Other team members can be added here when their photos are ready.
// ------------------------------------------------------------
const FOUNDER_B64 = {
  ssr: 'images/team/ssr.jpg',
  shyam: 'images/team/shyam.jpg'
};


// ------------------------------------------------------------
// LOGOS
// ------------------------------------------------------------
const LOGO_B64 = {
  black: './images/logo/logo_black.png',
  white: './images/logo/logo_white.png',
  compact: './images/logo/logo_compact.png',
  badge: './images/logo/logo_badge.jpg'
};


// ============================================================
// PROJECTS
// ============================================================
// IMPORTANT:
// Keep every project inside this array.
// The website automatically reads the projects from here.
// ============================================================

const mushData = [

  // ----------------------------------------------------------
  // MUSH 05 — ANNA NAGAR
  // ----------------------------------------------------------
  {
    id: '001',
    title: 'Anna Nagar Residence',
    handle: 'Mush_05_AnnaNagar',
    loc: 'Anna Nagar / Banu Nagar, Ambattur, Chennai',
    emoji: '🏠',
    tag: 'Residential',

    gradient: 'linear-gradient(160deg,#f5e6e6 0%,#ffe8cc 100%)',
    bg: '135deg,#3a1010,#2a1800',

    category: 'residential renovation designbuild',
    area: '880 sq.ft plot · 3,224 sq.ft tender area',
    year: '2022',
    budget: '≈ ₹1.36 Crores',
    type: 'G+3 Individual House',
    timeline: '376 days',

    architect: 'Ar. SSR & Ar. Shyam',
    designer: 'Team SpaceMush',
    contractor: 'SpaceMush (structures by Infiniti Structures)',

    likes: 0,
    comments: 0,
    hasStory: false,

    caption: 'Anna Nagar Residence — a G+3 home reimagined on a tight 880 sq.ft linear plot. "Small Spaces Deserve Design." 🏠✨',

    hashtags: [
      '#SmallSpacesDeserveDesign',
      '#SpaceMush',
      '#AnnaNagar',
      '#MUSH05'
    ],

    desc: 'The Anna Nagar Residence is a multi-story (G+3) home cleverly configured on a highly restricted 880 sq.ft linear plot with neighbouring buildings in close quarters. The layout maximizes spatial flow and daylighting through a centralized L-shaped staircase, a duplex unit design, and skylight cutouts, while the upper levels open up to private garden terraces. The home features 2 bedrooms, a study room, living & dining area, a duplex unit, a lift, and open/private terraces.',

    philosophy: 'Guided by the motto "Small Spaces Deserve Design," the core approach tackles the linear site\'s constraints by creating a linear complex form. The design evolved through strategic plane subtractions and the addition of perforations — such as CNC Jaalis and pivoting louvers — which act as functional service vents while adding horizontal and vertical aesthetic elements to break the building\'s linearity.',

    materials: [
      'HPL Panels',
      'CNC Jaali Patterns',
      'MS Frames & Louvers',
      'Toughened Glass',
      'Concrete Texture Finishes',
      'Teak & Sudan Wood',
      'Athangudi Tiles',
      'Kota Stone',
      'Red Oxide Flooring',
      'Granite',
      'Vitrified Tiles'
    ],

    palette: [
      '#e8d5ac',
      '#d9c8c0',
      '#f2e6d0',
      '#9a7a5a',
      '#3a2a1a'
    ],

    gallery: ['🏠', '🪜', '🪟', '🌿', '🛏️', '🏡'],

    images: [
      'images/projects/anna-nagar/01.jpg',
      'images/projects/anna-nagar/02.jpg',
      'images/projects/anna-nagar/03.jpg',
      'images/projects/anna-nagar/04.jpg',
      'images/projects/anna-nagar/05.jpg'
    ],

    brochureKey: 'mush05',
    testimonial: null,
    client: '— Mr. Padmanaban, Anna Nagar',
    times: '2022'
  },


  // ----------------------------------------------------------
  // MUSH 38 — NATHAN'S HOME
  // ----------------------------------------------------------
  {
    id: '002',
    title: "Nathan's Home",
    handle: 'Mush_38_NathansHome',
    loc: 'Jaganathan Street, Madipakkam, Chennai',
    emoji: '🪜',
    tag: 'Renovation',

    gradient: 'linear-gradient(160deg,#e6f0f5 0%,#e6f5ee 100%)',
    bg: '135deg,#0a2040,#0a2818',

    category: 'residential renovation designbuild interior',
    area: '2,400 sq.ft plot · 4,580 sq.ft built-up',
    year: '2022',
    budget: 'Not disclosed',
    type: 'G+2 Renovation cum Interior',
    timeline: 'Design began Aug 2022 · into 2023',

    architect: 'Ar. SSR Sivaraman S. & Ar. Shyam',
    designer: 'Team SpaceMush',
    contractor: 'SpaceMush LLP',

    likes: 0,
    comments: 0,
    hasStory: true,
    storyCaption: 'Behind the design — Nathan\'s Home renovation in Madipakkam, with our new MS spiral staircase 🪜',

    caption: 'Nathan\'s Home (MUSH 38) — a complete G+2 renovation with a striking external MS spiral staircase. "Design, Small Spaces!" 🪜✨',

    hashtags: [
      '#DesignSmallSpaces',
      '#SpaceMush',
      '#Madipakkam',
      '#MUSH38',
      '#Renovation'
    ],

    desc: 'Nathan\'s Home is an extensive 4,580 sq.ft residential renovation that completely revitalizes an existing G+2 structure. The design opens up the interiors with reworked zoning across every level to include modern workspaces and multimedia areas, while a striking new external MS spiral staircase and innovative pot-filler slab roofs elevate both form and utility. The home includes 5 bedrooms, multiple dedicated workspaces, a double-height multipurpose room for yoga/dance/music, a pooja room, an open kitchen with dining, and suspended balconies.',

    philosophy: 'Operating under the guiding rule "Design, Small Spaces!", the core approach focused on maximizing utility through multi-use furniture and clever spatial reworking. A standout functional intervention was the use of filler slab technology (using earthen frustums) to reduce concrete dead load while enhancing thermal insulation, light entry, and eco-friendliness.',

    materials: [
      'MS Framing',
      'Earthen Frustums (Filler Slab)',
      'Interlocking Rubber Mats',
      'Wood Panelling',
      'Rattan Shutters',
      'Polycarbonate Skylight Sheets',
      'Granite',
      'Bison Board',
      'Frosted Glass',
      'Roman Blinds'
    ],

    palette: [
      '#f5f5f5',
      '#9ca3af',
      '#8b5e3c',
      '#134e4a',
      '#0a0a0a'
    ],

    gallery: ['🪜', '🧘', '🍳', '🛏️', '🪟', '🏗️'],

    images: [
      'images/projects/nathans-home/01.jpg',
      'images/projects/nathans-home/02.jpg',
      'images/projects/nathans-home/03.jpg',
      'images/projects/nathans-home/04.jpg'
    ],

    brochureKey: 'mush38',
    testimonial: null,
    client: '— Mr. Prasanna, Madipakkam',
    times: '2022–2023'
  },


  // ----------------------------------------------------------
  // MUSH 18 — LA PERLE
  // ----------------------------------------------------------
  {
    id: '003',
    title: 'La Perle',
    handle: 'Mush_18_LaPerle',
    loc: 'Kolathur / Kamban Nagar Extn., Perambur, Chennai',
    emoji: '🪞',
    tag: 'Residential',

    gradient: 'linear-gradient(160deg,#f0ece8 0%,#fce8f4 100%)',
    bg: '135deg,#2a1e10,#180a20',

    category: 'residential designbuild interior',
    area: '2,625 sq.ft (tender area)',
    year: '2022',
    budget: '≈ ₹1.06 Crores',
    type: 'G+1 Residence',
    timeline: '330 days',

    architect: 'Ar. Sivaraman & Ar. Shyam',
    designer: 'Team SpaceMush',
    contractor: 'SpaceMush LLP',

    likes: 0,
    comments: 0,
    hasStory: true,
    storyCaption: 'Behind the design — La Perle Residence\'s signature cantilever staircase in Kolathur 🪞',

    caption: 'La Perle Residence (MUSH 18) — a double-height sunken living room and a dramatic front cantilever staircase. 🪞✨',

    hashtags: [
      '#LaPerle',
      '#SpaceMush',
      '#Kolathur',
      '#MUSH18',
      '#CantileverStaircase'
    ],

    desc: 'LA PERLE Residence is a highly customized G+1 home featuring a double-height sunken living room, extensive skylight integration, and a dramatic cantilever staircase at the forefront of the property. The layout maximizes spatial flow with an open island kitchen and centralized corridors, while standout visual elements like WPC claddings, CNC metal grilles, and distinct tile work elevate its modern aesthetic. The home includes 3 bedrooms, a study room, a home theatre, and a terrace/headroom.',

    philosophy: 'Crafted around the family\'s unique lifestyle and day-to-day interactions, the core functional approach ensures every space tells their story. A major guiding design decision occurred during construction when the main staircase was relocated to the front of the building, transforming it into a signature aesthetic statement visible from the main road.',

    materials: [
      'Ghana / African Teak Wood',
      'UPVC Windows (Fenesta)',
      'HPL Cladding',
      'WPC Louvers',
      'CNC MS Grilles',
      'Toughened Glass',
      'Black Galaxy / Jet Black Granite',
      'Athangudi Tiles',
      'Kota Stone',
      'Red Oxide Flooring',
      'Vitrified Tiles',
      'Exposed Concrete Texture Paint'
    ],

    palette: [
      '#f5f5f0',
      '#8293a8',
      '#c0c0c0',
      '#5c3a21',
      '#0a0a0a'
    ],

    gallery: ['🪞', '🪜', '🛋️', '🛏️', '🎥', '🏡'],

    images: [
      'images/projects/la-perle/01.jpg',
      'images/projects/la-perle/02.jpg',
      'images/projects/la-perle/03.jpg',
      'images/projects/la-perle/04.jpg',
      'images/projects/la-perle/05.jpg',
      'images/projects/la-perle/06.jpg'
    ],

    brochureKey: 'mush18',
    testimonial: null,
    client: '— Mr. Boanerges, Mrs. Arunmozhidevi Boanerges & Neo Athwaith, Kolathur',
    times: '2022'
  }
];


// ============================================================
// HOME FEED ORDER
// ============================================================
// This controls the public Instagram-style feed.
// To add a new project to the feed later, add:
// { type: 'project', id: '004' }
// where you want it to appear.
// The project itself still lives in mushData above.
// ============================================================
const FEED_CONFIG = [
  { type: 'info', key: 'welcome' },
  { type: 'project', id: '003' }, // La Perle
  { type: 'info', key: 'whoSSR' },
  { type: 'project', id: '001' }, // Anna Nagar
  { type: 'info', key: 'whoWeAre' },
  { type: 'info', key: 'howWeDesign' },
  { type: 'info', key: 'howToFindUs' },
  { type: 'project', id: '002' }, // Nathan's Home
  { type: 'info', key: 'contact' },
  { type: 'info', key: 'faq' }
];


// ============================================================
// AVAILABLE DESIGN STYLES
// ============================================================
const stylesData = [
  'Minimal',
  'Japandi',
  'Luxury',
  'Modern',
  'Traditional',
  'Industrial',
  'Scandinavian',
  'Contemporary',
  'Biophilic',
  'Coastal',
  'Mediterranean',
  'Wabi-Sabi'
];


// ============================================================
// NEW PROJECT TEMPLATE
// ============================================================
// DO NOT put this template inside mushData.
// When a new project arrives:
//
// 1. Copy the object below.
// 2. Paste it just before the closing ] of mushData.
// 3. Replace the example values.
// 4. Create the matching image folder.
//
// Example image folder:
// images/projects/mush-42/
//
// Example photos:
// images/projects/mush-42/01.jpg
// images/projects/mush-42/02.jpg
// images/projects/mush-42/03.jpg
// ============================================================

/*
{
  id: '004',
  title: 'PROJECT NAME',
  handle: 'Mush_42_ProjectName',
  loc: 'LOCATION, Chennai',
  emoji: '🏠',
  tag: 'Residential',

  gradient: 'linear-gradient(160deg,#f5e6e6 0%,#ffe8cc 100%)',
  bg: '135deg,#3a1010,#2a1800',

  category: 'residential designbuild',
  area: 'AREA',
  year: '2026',
  budget: 'BUDGET',
  type: 'PROJECT TYPE',
  timeline: 'TIMELINE',

  architect: 'ARCHITECT NAME',
  designer: 'Team SpaceMush',
  contractor: 'SpaceMush LLP',

  likes: 0,
  comments: 0,
  hasStory: false,

  caption: 'WRITE THE INSTAGRAM-STYLE PROJECT CAPTION HERE.',

  hashtags: [
    '#SpaceMush',
    '#SmallSpacesDeserveDesign',
    '#Architecture'
  ],

  desc: 'WRITE THE FULL PROJECT DESCRIPTION HERE.',

  philosophy: 'WRITE THE DESIGN PHILOSOPHY HERE.',

  materials: [
    'Material 1',
    'Material 2',
    'Material 3'
  ],

  palette: [
    '#e8d5ac',
    '#d9c8c0',
    '#3a2a1a'
  ],

  gallery: ['🏠', '🪜', '🪟'],

  images: [
    'images/projects/mush-42/01.jpg',
    'images/projects/mush-42/02.jpg',
    'images/projects/mush-42/03.jpg'
  ],

  brochureKey: null,
  testimonial: null,
  client: 'CLIENT NAME / PROJECT NAME',
  times: '2026'
}
*/
