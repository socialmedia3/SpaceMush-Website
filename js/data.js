// ============================================================
// SPACEMUSH WEBSITE — CONTENT DATA
// ============================================================
// Edit normal public content in POSTS below.
// Every public feed item is a post — including projects.
// FEED_CONFIG controls the order of those posts.
// Do not edit app.js or style.css for normal content changes.
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
  ssr: 'images/posts/who-we-are/ssr.jpg',
  shyam: 'images/posts/who-we-are/shyam.jpg'
};


// ------------------------------------------------------------
// LOGOS
// ------------------------------------------------------------
const LOGO_B64 = {
  black: 'images/logo/logo_black.png',
  white: 'images/logo/logo_white.png',
  compact: 'images/logo/logo_compact.png',
  badge: 'images/logo/logo_badge.jpg'
};


const CONTENT_POSTS = {
  "where-it-all-begins": {
    "avatarText": "SM",
    "handle": "spacemush_architects_chennai",
    "subtitle": "📍 Chennai · Est. 2020",
    "caption": "<span class=\"handle\">spacemush_architects_chennai</span> Where it all begins — SpaceMush, built around one simple belief: small spaces deserve design. <span class=\"hashtag\">#SpaceMush</span> <span class=\"hashtag\">#SmallSpacesDeserveDesign</span>",
    "actionOnClick": "bookConsultationWhatsApp()",
    "time": "WHERE IT ALL BEGINS",
    "slides": [
      {
        "type": "image",
        "src": "images/posts/where-it-all-begins/1st.png",
        "alt": "SpaceMush Architects — where it all begins"
      }
    ],
    "postType": "info"
  },
  "who-ssr": {
    "avatarText": "SSR",
    "handle": "Architect SSR",
    "subtitle": "Who is SSR? · Founder of SpaceMush",
    "caption": "<span class=\"handle\">Architect SSR</span> The story behind the architect who started SpaceMush around one simple belief: small spaces deserve design. <span class=\"hashtag\">#ArchitectSSR</span> <span class=\"hashtag\">#SpaceMush</span>",
    "actionOnClick": "bookConsultationWhatsApp()",
    "slides": [
      {
        "type": "image",
        "src": "images/posts/who-is-ssr/1st.png",
        "alt": "Architect SSR"
      },
      {
        "type": "image",
        "src": "images/posts/who-is-ssr/2nd.png",
        "alt": "How SSR started SpaceMush"
      }
    ],
    "postType": "info"
  },
  "who-we-are": {
    "avatarText": "SM",
    "handle": "spacemush_architects_chennai",
    "subtitle": "Who we are · The SpaceMush team",
    "caption": "<span class=\"handle\">spacemush_architects_chennai</span> Meet the people behind SpaceMush — from founder-led design to architecture, documentation and project delivery. <span class=\"hashtag\">#SpaceMushTeam</span>",
    "actionOnClick": "bookConsultationWhatsApp()",
    "slides": [
      {
        "type": "image",
        "src": "images/posts/who-we-are/1st.png",
        "alt": "Who we are — image 1"
      },
      {
        "type": "html",
        "html": ""
      },
      {
        "type": "image",
        "src": "images/posts/who-we-are/3rd.png",
        "alt": "Who we are — image 3"
      },
      {
        "type": "image",
        "src": "images/posts/who-we-are/4th.png",
        "alt": "Who we are — image 4"
      }
    ],
    "postType": "info"
  },
  "how-we-design": {
    "avatarText": "SM",
    "handle": "spacemush_architects_chennai",
    "subtitle": "How we design · From constraint to space",
    "caption": "<span class=\"handle\">spacemush_architects_chennai</span> We study the plot, people, light, ventilation, movement and budget — then turn constraints into design decisions. <span class=\"hashtag\">#HowWeDesign</span>",
    "actionOnClick": "bookConsultationWhatsApp()",
    "slides": [
      {
        "type": "image",
        "src": "images/posts/how-we-design/1st.png",
        "alt": "How we design — image 1"
      },
      {
        "type": "image",
        "src": "images/posts/how-we-design/2nd.png",
        "alt": "How we design — image 2"
      },
      {
        "type": "image",
        "src": "images/posts/how-we-design/3rd.png",
        "alt": "How we design — image 3"
      },
      {
        "type": "image",
        "src": "images/posts/how-we-design/4th.png",
        "alt": "How we design — image 4"
      }
    ],
    "postType": "info"
  },
  "how-to-find-us": {
    "avatarText": "SM",
    "handle": "spacemush_architects_chennai",
    "subtitle": "📍 Chennai · Where to find us",
    "caption": "<span class=\"handle\">spacemush_architects_chennai</span> Find SpaceMush at KB Dasan Road, Alwarpet, Chennai. <span class=\"hashtag\">#SpaceMush</span> <span class=\"hashtag\">#Chennai</span>",
    "actionOnClick": "window.open('https://maps.app.goo.gl/myANNorCUc2HB3qeA','_blank')",
    "slides": [
      {
        "type": "text",
        "theme": "coral",
        "icon": "📍",
        "heading": "How to Find Us",
        "bodyHtml": "<p><strong>55, A3 Swati Sahana Apartments</strong><br>2nd Floor, KB Dasan Road<br>Alwarpet, Chennai – 600018</p><p>Corner building on KB Dasan Road. From SIET College Road, it is on your LEFT. From TTK Road, it is on your RIGHT.</p><p>Ground-floor identifiers: <strong>Dakshin Art Gallery</strong> and <strong>Dental Clinic</strong>.</p><button class=\"info-slide-btn\" onclick=\"window.open('https://maps.app.goo.gl/myANNorCUc2HB3qeA','_blank')\">📍 Open in Google Maps</button>"
      },
      {
        "type": "image",
        "theme": "coral",
        "src": "images/location/parking_guidance.jpg",
        "alt": "SpaceMush office parking and location map",
          "fit": "contain"
      }
    ],
    "postType": "info"
  },
  "faq": {
    "avatarText": "SM",
    "handle": "spacemush_architects_chennai",
    "subtitle": "FAQ · SpaceMush Architects",
    "caption": "<span class=\"handle\">spacemush_architects_chennai</span> A few answers before you start a conversation with us. <span class=\"hashtag\">#SpaceMushFAQ</span>",
    "actionOnClick": "bookConsultationWhatsApp()",
    "slides": [
      {
        "type": "text",
        "icon": "❓",
        "heading": "What does SpaceMush do?",
        "bodyHtml": "<p>We design and execute small spaces — from new homes on constrained urban plots to renovations and interiors.</p>"
      },
      {
        "type": "text",
        "icon": "🏗️",
        "heading": "Do you only provide design?",
        "bodyHtml": "<p>No. We offer <strong>Design Only</strong>, <strong>Design + Documentation</strong>, and <strong>Full End-to-End</strong> services depending on what you need.</p>"
      },
      {
        "type": "text",
        "icon": "📐",
        "heading": "What kind of projects do you take?",
        "bodyHtml": "<p>We work on small and constrained residential spaces, including new homes, renovations and interior projects.</p>"
      },
      {
        "type": "text",
        "icon": "📍",
        "heading": "Where is SpaceMush based?",
        "bodyHtml": "<p>Our studio is in <strong>Alwarpet, Chennai</strong>. See the “How to Find Us” post for the address and parking guidance.</p>"
      },
      {
        "type": "text",
        "icon": "💬",
        "heading": "How do I start a project?",
        "bodyHtml": "<p>Send us your site details, requirements and what you have in mind. You can reach SpaceMush through WhatsApp, email or phone.</p><button class=\"info-slide-btn\" onclick=\"bookConsultationWhatsApp()\">WhatsApp SpaceMush</button>"
      }
    ],
    "postType": "info"
  },
  "anna-nagar": {
    "id": "001",
    "title": "Anna Nagar Residence",
    "handle": "Mush_05_AnnaNagar",
    "loc": "Anna Nagar / Banu Nagar, Ambattur, Chennai",
    "emoji": "🏠",
    "tag": "Residential",
    "gradient": "linear-gradient(160deg,#f5e6e6 0%,#ffe8cc 100%)",
    "bg": "135deg,#3a1010,#2a1800",
    "category": "residential renovation designbuild",
    "area": "880 sq.ft plot · 3,224 sq.ft tender area",
    "year": "2022",
    "budget": "≈ ₹1.36 Crores",
    "timeline": "376 days",
    "architect": "Ar. SSR & Ar. Shyam",
    "designer": "Team SpaceMush",
    "contractor": "SpaceMush (structures by Infiniti Structures)",
    "likes": 0,
    "comments": 0,
    "hasStory": false,
    "caption": "Anna Nagar Residence — a G+3 home reimagined on a tight 880 sq.ft linear plot. \"Small Spaces Deserve Design.\" 🏠✨",
    "hashtags": [
      "#SmallSpacesDeserveDesign",
      "#SpaceMush",
      "#AnnaNagar",
      "#MUSH05"
    ],
    "desc": "The Anna Nagar Residence is a multi-story (G+3) home cleverly configured on a highly restricted 880 sq.ft linear plot with neighbouring buildings in close quarters. The layout maximizes spatial flow and daylighting through a centralized L-shaped staircase, a duplex unit design, and skylight cutouts, while the upper levels open up to private garden terraces. The home features 2 bedrooms, a study room, living & dining area, a duplex unit, a lift, and open/private terraces.",
    "philosophy": "Guided by the motto \"Small Spaces Deserve Design,\" the core approach tackles the linear site's constraints by creating a linear complex form. The design evolved through strategic plane subtractions and the addition of perforations — such as CNC Jaalis and pivoting louvers — which act as functional service vents while adding horizontal and vertical aesthetic elements to break the building's linearity.",
    "materials": [
      "HPL Panels",
      "CNC Jaali Patterns",
      "MS Frames & Louvers",
      "Toughened Glass",
      "Concrete Texture Finishes",
      "Teak & Sudan Wood",
      "Athangudi Tiles",
      "Kota Stone",
      "Red Oxide Flooring",
      "Granite",
      "Vitrified Tiles"
    ],
    "palette": [
      "#e8d5ac",
      "#d9c8c0",
      "#f2e6d0",
      "#9a7a5a",
      "#3a2a1a"
    ],
    "gallery": [
      "🏠",
      "🪜",
      "🪟",
      "🌿",
      "🛏️",
      "🏡"
    ],
    "images": [
      "images/posts/anna-nagar/01.jpg",
      "images/posts/anna-nagar/02.jpg",
      "images/posts/anna-nagar/03.jpg",
      "images/posts/anna-nagar/04.jpg",
      "images/posts/anna-nagar/05.jpg"
    ],
    "brochureKey": "mush05",
    "testimonial": null,
    "client": "— Mr. Padmanaban, Anna Nagar",
    "times": "2022",
    "postType": "project",
    "type": "G+3 Individual House"
  },
  "nathans-home": {
    "id": "002",
    "title": "Nathan's Home",
    "handle": "Mush_38_NathansHome",
    "loc": "Jaganathan Street, Madipakkam, Chennai",
    "emoji": "🪜",
    "tag": "Renovation",
    "gradient": "linear-gradient(160deg,#e6f0f5 0%,#e6f5ee 100%)",
    "bg": "135deg,#0a2040,#0a2818",
    "category": "residential renovation designbuild interior",
    "area": "2,400 sq.ft plot · 4,580 sq.ft built-up",
    "year": "2022",
    "budget": "Not disclosed",
    "timeline": "Design began Aug 2022 · into 2023",
    "architect": "Ar. SSR Sivaraman S. & Ar. Shyam",
    "designer": "Team SpaceMush",
    "contractor": "SpaceMush LLP",
    "likes": 0,
    "comments": 0,
    "hasStory": true,
    "storyCaption": "Behind the design — Nathan's Home renovation in Madipakkam, with our new MS spiral staircase 🪜",
    "caption": "Nathan's Home (MUSH 38) — a complete G+2 renovation with a striking external MS spiral staircase. \"Design, Small Spaces!\" 🪜✨",
    "hashtags": [
      "#DesignSmallSpaces",
      "#SpaceMush",
      "#Madipakkam",
      "#MUSH38",
      "#Renovation"
    ],
    "desc": "Nathan's Home is an extensive 4,580 sq.ft residential renovation that completely revitalizes an existing G+2 structure. The design opens up the interiors with reworked zoning across every level to include modern workspaces and multimedia areas, while a striking new external MS spiral staircase and innovative pot-filler slab roofs elevate both form and utility. The home includes 5 bedrooms, multiple dedicated workspaces, a double-height multipurpose room for yoga/dance/music, a pooja room, an open kitchen with dining, and suspended balconies.",
    "philosophy": "Operating under the guiding rule \"Design, Small Spaces!\", the core approach focused on maximizing utility through multi-use furniture and clever spatial reworking. A standout functional intervention was the use of filler slab technology (using earthen frustums) to reduce concrete dead load while enhancing thermal insulation, light entry, and eco-friendliness.",
    "materials": [
      "MS Framing",
      "Earthen Frustums (Filler Slab)",
      "Interlocking Rubber Mats",
      "Wood Panelling",
      "Rattan Shutters",
      "Polycarbonate Skylight Sheets",
      "Granite",
      "Bison Board",
      "Frosted Glass",
      "Roman Blinds"
    ],
    "palette": [
      "#f5f5f5",
      "#9ca3af",
      "#8b5e3c",
      "#134e4a",
      "#0a0a0a"
    ],
    "gallery": [
      "🪜",
      "🧘",
      "🍳",
      "🛏️",
      "🪟",
      "🏗️"
    ],
    "images": [
      "images/posts/nathans-home/01.jpg",
      "images/posts/nathans-home/02.jpg",
      "images/posts/nathans-home/03.jpg",
      "images/posts/nathans-home/04.jpg"
    ],
    "brochureKey": "mush38",
    "testimonial": null,
    "client": "— Mr. Prasanna, Madipakkam",
    "times": "2022–2023",
    "postType": "project",
    "type": "G+2 Renovation cum Interior"
  },
  "la-perle": {
    "id": "003",
    "title": "La Perle",
    "handle": "Mush_18_LaPerle",
    "loc": "Kolathur / Kamban Nagar Extn., Perambur, Chennai",
    "emoji": "🪞",
    "tag": "Residential",
    "gradient": "linear-gradient(160deg,#f0ece8 0%,#fce8f4 100%)",
    "bg": "135deg,#2a1e10,#180a20",
    "category": "residential designbuild interior",
    "area": "2,625 sq.ft (tender area)",
    "year": "2022",
    "budget": "≈ ₹1.06 Crores",
    "timeline": "330 days",
    "architect": "Ar. Sivaraman & Ar. Shyam",
    "designer": "Team SpaceMush",
    "contractor": "SpaceMush LLP",
    "likes": 0,
    "comments": 0,
    "hasStory": true,
    "storyCaption": "Behind the design — La Perle Residence's signature cantilever staircase in Kolathur 🪞",
    "caption": "La Perle Residence (MUSH 18) — a double-height sunken living room and a dramatic front cantilever staircase. 🪞✨",
    "hashtags": [
      "#LaPerle",
      "#SpaceMush",
      "#Kolathur",
      "#MUSH18",
      "#CantileverStaircase"
    ],
    "desc": "LA PERLE Residence is a highly customized G+1 home featuring a double-height sunken living room, extensive skylight integration, and a dramatic cantilever staircase at the forefront of the property. The layout maximizes spatial flow with an open island kitchen and centralized corridors, while standout visual elements like WPC claddings, CNC metal grilles, and distinct tile work elevate its modern aesthetic. The home includes 3 bedrooms, a study room, a home theatre, and a terrace/headroom.",
    "philosophy": "Crafted around the family's unique lifestyle and day-to-day interactions, the core functional approach ensures every space tells their story. A major guiding design decision occurred during construction when the main staircase was relocated to the front of the building, transforming it into a signature aesthetic statement visible from the main road.",
    "materials": [
      "Ghana / African Teak Wood",
      "UPVC Windows (Fenesta)",
      "HPL Cladding",
      "WPC Louvers",
      "CNC MS Grilles",
      "Toughened Glass",
      "Black Galaxy / Jet Black Granite",
      "Athangudi Tiles",
      "Kota Stone",
      "Red Oxide Flooring",
      "Vitrified Tiles",
      "Exposed Concrete Texture Paint"
    ],
    "palette": [
      "#f5f5f0",
      "#8293a8",
      "#c0c0c0",
      "#5c3a21",
      "#0a0a0a"
    ],
    "gallery": [
      "🪞",
      "🪜",
      "🛋️",
      "🛏️",
      "🎥",
      "🏡"
    ],
    "images": [
      "images/posts/la-perle/01.jpg",
      "images/posts/la-perle/02.jpg",
      "images/posts/la-perle/03.jpg",
      "images/posts/la-perle/04.jpg",
      "images/posts/la-perle/05.jpg",
      "images/posts/la-perle/06.jpg"
    ],
    "brochureKey": "mush18",
    "testimonial": null,
    "client": "— Mr. Boanerges, Mrs. Arunmozhidevi Boanerges & Neo Athwaith, Kolathur",
    "times": "2022",
    "postType": "project",
    "type": "G+1 Residence"
  },
  "contact": {
    "postType": "info",
    "avatarText": "SM",
    "handle": "spacemush_architects_chennai",
    "subtitle": "💬 Start a conversation",
    "caption": "<span class=\"handle\">spacemush_architects_chennai</span> Have a space in mind? Tell us about it. Let’s talk. <span class=\"hashtag\">#ContactSpaceMush</span>",
    "actionOnClick": "bookConsultationWhatsApp()",
    "time": "Start a conversation",
    "slides": [
      {
        "type": "html",
        "html": "<div class=\"info-slide-icon\">💬</div>\n      <div class=\"info-slide-heading\">Reach Us</div>\n      <div class=\"info-slide-tiles\">\n        <div class=\"info-slide-tile\" onclick=\"window.open('https://www.instagram.com/spacemush_architects_chennai/','_blank')\"><div class=\"info-slide-tile-icon\">📸</div><div class=\"info-slide-tile-title\">Instagram</div><div class=\"info-slide-tile-sub\">@spacemush_architects_chennai</div></div>\n        <div class=\"info-slide-tile\" onclick=\"window.open('https://wa.me/919080430134','_blank')\"><div class=\"info-slide-tile-icon\">💬</div><div class=\"info-slide-tile-title\">WhatsApp</div><div class=\"info-slide-tile-sub\">+91 90804 30134</div></div>\n        <div class=\"info-slide-tile\" onclick=\"window.location.href='tel:+919080430134'\"><div class=\"info-slide-tile-icon\">📞</div><div class=\"info-slide-tile-title\">Call Us</div><div class=\"info-slide-tile-sub\">Mon–Sat 10am–7pm</div></div>\n        <div class=\"info-slide-tile\" onclick=\"window.location.href='mailto:ssr@spacemush.com'\"><div class=\"info-slide-tile-icon\">✉️</div><div class=\"info-slide-tile-title\">Email</div><div class=\"info-slide-tile-sub\">ssr@spacemush.com</div></div>\n        <div class=\"info-slide-tile\" onclick=\"window.open('https://maps.app.goo.gl/myANNorCUc2HB3qeA','_blank')\"><div class=\"info-slide-tile-icon\">📍</div><div class=\"info-slide-tile-title\">Office</div><div class=\"info-slide-tile-sub\">Alwarpet, Chennai</div></div>\n        <div class=\"info-slide-tile\" onclick=\"bookConsultationWhatsApp()\"><div class=\"info-slide-tile-icon\">📅</div><div class=\"info-slide-tile-title\">Book a Call</div><div class=\"info-slide-tile-sub\">Free 30-min consult</div></div>\n      </div>"
      },
      {
        "type": "html",
        "formVariant": true,
        "html": "<div class=\"info-slide-icon\">✉️</div>\n      <div class=\"info-slide-heading\">Send a Message</div>\n      <div class=\"fgroup\"><label class=\"flabel\">Your Name</label><input class=\"finput\" id=\"rm-name\" placeholder=\"Ramesh Kumar\"></div>\n      <div class=\"form-row-2\"><div class=\"fgroup\"><label class=\"flabel\">Phone</label><input class=\"finput\" id=\"rm-phone\" placeholder=\"+91 99999 00000\"></div><div class=\"fgroup\"><label class=\"flabel\">Email</label><input class=\"finput\" id=\"rm-email\" placeholder=\"you@example.com\"></div></div>\n      <div class=\"fgroup\"><label class=\"flabel\">Budget Range</label><select class=\"fselect\" id=\"rm-budget\"><option>Select budget</option><option>Under ₹5 Lakhs</option><option>₹5–10 Lakhs</option><option>₹10–25 Lakhs</option><option>₹25–50 Lakhs</option><option>₹50 Lakhs+</option></select></div>\n      <div class=\"fgroup\"><label class=\"flabel\">Message</label><textarea class=\"finput\" id=\"rm-message\" rows=\"3\" placeholder=\"Tell us about your space...\" style=\"resize:vertical\"></textarea></div>\n      <button class=\"auth-submit\" onclick=\"submitReachUsMessage()\">Send Message</button>"
      }
    ]
  }
};

// One canonical content model. Edit CONTENT_POSTS only through the POSTS
// records below; the two derived indexes exist for the existing studio and
// project-detail workflows and never own public content.
const POSTS = Object.fromEntries(
  Object.entries(CONTENT_POSTS).map(([key, post]) => {
    const isProject = post.postType === 'project';
    const project = isProject ? {
      id: post.id,
      title: post.title,
      handle: post.handle,
      location: post.loc,
      client: post.client,
      area: post.area,
      year: post.year,
      budget: post.budget,
      type: post.type,
      timeline: post.timeline,
      architect: post.architect,
      designer: post.designer,
      contractor: post.contractor,
      brochureKey: post.brochureKey,
      gallery: post.gallery,
      testimonial: post.testimonial,
      description: post.desc,
      philosophy: post.philosophy,
      materials: post.materials,
      palette: post.palette,
      category: post.category,
      tag: post.tag,
      emoji: post.emoji,
      gradient: post.gradient,
      background: post.bg,
      times: post.times,
      likes: post.likes,
      comments: post.comments,
      hasStory: post.hasStory,
      storyCaption: post.storyCaption
    } : null;
    const slides = isProject
      ? (post.images || []).map((src, index) => ({
          type: 'image',
          src,
          alt: `${post.title || key} — image ${index + 1}`
        }))
      : (post.slides || []);
    return [key, {
      ...post,
      id: key,
      type: isProject ? 'project' : 'carousel',
      author: {
        name: post.handle || 'spacemush_architects_chennai',
        avatar: post.avatarText || 'SM'
      },
      subtitle: post.subtitle || '',
      caption: post.caption || '',
      action: post.actionOnClick ? {
        onClick: post.actionOnClick,
        title: post.actionTitle || ''
      } : null,
      slides,
      project
    }];
  })
);

const mushData = Object.values(POSTS)
  .filter(post => post.type === 'project')
  .sort((a,b) => Number(a.project.id || 0) - Number(b.project.id || 0))
  .map(post => ({
    ...post,
    ...post.project,
    loc: post.project.location,
    desc: post.project.description,
    bg: post.project.background,
    images: post.slides.filter(slide => slide.type === 'image').map(slide => slide.src),
    avatarText: post.author.avatar,
    postType: 'project'
  }));

// Public feed order. Every item below is simply a POST key.
const FEED_CONFIG = [
  'where-it-all-begins',
  'la-perle',
  'who-ssr',
  'anna-nagar',
  'how-we-design',
  'nathans-home',
  'who-we-are',
  'how-to-find-us',
  'contact',
  'faq'
];

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
// Add new posts to CONTENT_POSTS above; do not edit derived indexes.
// When a new project arrives:
//
// 1. Copy the object below.
// 2. Paste it inside CONTENT_POSTS.
// 3. Replace the example values.
// 4. Create the matching image folder.
//
// Example image folder:
// images/posts/mush-42/
//
// Example photos:
// images/posts/mush-42/01.jpg
// images/posts/mush-42/02.jpg
// images/posts/mush-42/03.jpg
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
    'images/posts/mush-42/01.jpg',
    'images/posts/mush-42/02.jpg',
    'images/posts/mush-42/03.jpg'
  ],

  brochureKey: null,
  testimonial: null,
  client: 'CLIENT NAME / PROJECT NAME',
  times: '2026'
}
*/
