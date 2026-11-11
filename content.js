// ALL SITE CONTENT LIVES HERE. Edit this file only.
// Agent copy: adriannawigzell.exprealty.com. Listing: RMLS #355146663.
window.SITE = {
  name: "Adrianna Wigzell",
  title: "REALTOR®",
  brokerage: "eXp Realty in Oregon",
  tagline: "Real estate that feels clear and manageable",

  // Drop a square-ish portrait here, e.g. "assets/adrianna.jpg". Empty = gold monogram.
  headshot: "",

  listing: {
    mls: "355146663",
    address: "11490 SW Crown Dr #2",
    city: "King City",
    state: "OR",
    zip: "97224",
    price: 149900,
    beds: 1,
    baths: 1,
    sqft: 771,
    built: 1967,
    type: "Condo",
    style: "Common wall",
    hoa: 453,
    blurb: "A single-level 771 sq ft condo in the King City Civic Association — one bedroom, one bath, a new vinyl slider to a private patio, and a park-greenbelt view.",
    features: [
      "Private patio + green space",
      "55+ community: golf, pool, clubhouse",
      "Carport available · park view",
      "HOA covers water, sewer, cable, internet",
    ],
    url: "https://adriannawigzell.exprealty.com/property/65-355146663-11490-sw-crown-dr-2-king-city-OR-97224",
  },

  // ---------------------------------------------------------------------------
  // The 3D model is built from this single-floor layout. Feet, origin top-left in
  // plan view. x runs left→right, z runs front(patio, 0) → back(parking, 24).
  // Rooms must tile the footprint without overlapping.
  // ---------------------------------------------------------------------------
  floor: {
    name: "Main floor",
    width: 32,
    depth: 24,
    rooms: [
      { name: "Living Room", x: 0,  z: 0,  w: 20, d: 14, kind: "living" },
      { name: "Dining",      x: 20, z: 0,  w: 12, d: 8,  kind: "dining" },
      { name: "Kitchen",     x: 20, z: 8,  w: 12, d: 8,  kind: "kitchen" },
      { name: "Bedroom",     x: 0,  z: 14, w: 13, d: 10, kind: "bed" },
      { name: "Hall",        x: 13, z: 14, w: 7,  d: 10, kind: "hall" },
      { name: "Bath",        x: 20, z: 16, w: 7,  d: 5,  kind: "bath" },
      { name: "Closet",      x: 27, z: 16, w: 5,  d: 5,  kind: "closet" },
      { name: "Laundry",     x: 20, z: 21, w: 12, d: 3,  kind: "utility" },
    ],
    doors: [
      { o: "h", at: 24, a: 14,   b: 17,   front: true },  // front door, off the parking walk
      { o: "h", at: 0,  a: 5,    b: 11,   slider: true }, // patio slider
      { o: "v", at: 20, a: 1.5,  b: 6.5 },                // living → dining
      { o: "v", at: 20, a: 9,    b: 13 },                 // living → kitchen
      { o: "h", at: 8,  a: 20.4, b: 23.4 },               // dining → kitchen
      { o: "h", at: 14, a: 14,   b: 18 },                 // living → hall
      { o: "v", at: 13, a: 16,   b: 19 },                 // hall → bedroom
      { o: "v", at: 20, a: 18.6, b: 20.8 },               // hall → bath
      { o: "v", at: 27, a: 17,   b: 19.5 },               // bath → closet
      { o: "v", at: 20, a: 21.5, b: 23.5 },               // hall → laundry
    ],
    windows: [
      { o: "h", at: 0,  a: 1.5, b: 4.5,  sill: 3, head: 7 },   // living, patio side
      { o: "h", at: 0,  a: 13,  b: 18,   sill: 3, head: 7 },   // living, patio side
      { o: "h", at: 0,  a: 22,  b: 30,   sill: 3, head: 7 },   // dining
      { o: "v", at: 32, a: 10,  b: 14,   sill: 3, head: 7 },   // kitchen
      { o: "v", at: 0,  a: 16,  b: 20,   sill: 3, head: 7 },   // bedroom, side
      { o: "h", at: 24, a: 3,   b: 9,    sill: 3, head: 7 },   // bedroom, parking side
      { o: "h", at: 24, a: 24,  b: 30,   sill: 3, head: 7 },   // laundry
    ],
  },

  tour: {
    url: "tour.html",
    eyebrow: "3D walkthrough",
    title: "Walk the condo, room by room",
    body: "A first-person pass through the 771 sq ft floor plan, built from the listing photos and the published square footage. The layout is approximate — a way to get your bearings, not a measured survey.",
    cta: "Launch the 3D tour",
  },

  about: [
    "Hi,",
    "My name is Adrianna and I am a real estate agent with eXp Realty serving Eugene and the surrounding communities in Lane County.",
    "I got into real estate because I care about the process feeling clear and manageable. Whether you're buying your first home, selling and moving on, or just exploring what's possible, my goal is to give you straightforward guidance, solid local knowledge, and the kind of communication that keeps you informed without the overwhelm.",
    "I'm building my business with a focus on responsiveness, honesty, and treating every client like a person—not a transaction. Outside of work you'll usually find me staying active and enjoying time with family.",
    "If you're thinking about a move, or just want to talk through the market, I'm happy to connect. Let's figure out the next step together.",
  ],
  phone: "541-285-8217",
  officePhone: "888-814-9613",
  email: "",                       // the live site shows an envelope icon only; add the address here
  areas: ["Albany", "Aloha", "Amity", "Ashland", "Aumsville", "Aurora", "Azalea", "Baker City", "Bandon", "Banks", "Beavercreek", "Beaverton", "Bend", "Blachly", "Blue River", "Boring", "Brightwood", "Brownsville", "Camas Valley", "Canby", "King City", "Tigard", "Tualatin", "Wilsonville"],
  services: ["Buying", "Selling", "Exploring the market"],
  searchUrl: "https://adriannawigzell.exprealty.com/",
  social: {},                      // live site has Facebook, LinkedIn, Instagram icons; paste the URLs here
  accent: "#c9922e",      // bright gold: buttons, rules, accents
  blueprint: "#0a2a66",   // blueprint paper colour inside the 3D scene
  disclaimer: "All information provided is deemed reliable but is not guaranteed and should be independently verified. Listing data comes in part from the IDX program of RMLS™ of Portland, Oregon. Some properties which appear for sale may subsequently have sold or may no longer be available.",

  // -------------------------------------------------------------------------
  // Placeholder deck below the animation. Option B: not real listings — mock
  // property-type cards, Our Listings / Just Listed / Just Reduced rows, a demo
  // About paragraph, a demo Areas line, and a demo disclaimer, so the layout
  // reads end to end. Swap these for the real listings copy when ready.
  // -------------------------------------------------------------------------
  demo: {
    propertyTypes: [
      { name: "Multi Family", list: "31 Listings" },
      { name: "Houses",     list: "25,794 Listings" },
      { name: "Land",       list: "1,000+ Listings" },
      { name: "Condos",     list: "671 Listings", wide: true },
    ],
    rows: [
      {
        eyebrow: "Our Listings", title: "Our Listings",
        cards: [
          { tag: "FOR SALE", place: "Milton-Freewater", price: "$ 5,500,000", type: "Single Family", size: "1,896 SqFt", rooms: "3 Beds • 2 Baths", comp: "eXp Realty in Oregon" },
          { tag: "WATER FRONT", place: "Lakeview", price: "$ 4,350,000", type: "Single Family", size: "1,896 SqFt", rooms: "3 Beds • 2 Baths", comp: "eXp Realty in Oregon" },
          { tag: "WATERFRONT", place: "West Linn", price: "$ 4,700,000", type: "Single Family", size: "11,508 SqFt", rooms: "3 Beds • 13.5 Baths", comp: "eXp Realty in Oregon" },
          { tag: "WATERFRONT", place: "Vancouver", price: "$ 3,495,000", type: "Condos", size: "4,019 SqFt", rooms: "3 Beds • 3.5 Baths", comp: "eXp Realty in Oregon" },
        ],
      },
      {
        eyebrow: "Just Listed", title: "Just Listed",
        cards: [
          { tag: "JUST LISTED", place: "Hillsboro", price: "$ 620,000", type: "Single Family", size: "1,490 SqFt", rooms: "3 Beds • 2 Baths", comp: "Markel Williams Sunset Corridor" },
          { tag: "JUST LISTED", place: "Eugene", price: "$ 425,000", type: "Single Family", size: "1,862 SqFt", rooms: "4 Beds • 1.5 Baths", comp: "The Cooley Real Estate Group" },
          { tag: "JUST LISTED", place: "Beaverton", price: "$ 479,900", type: "Single Family", size: "1,754 SqFt", rooms: "3 Beds • 2.5 Baths", comp: "MORE, Realty" },
          { tag: "JUST LISTED", place: "Happy Valley", price: "$ 619,500", type: "Condos", size: "1,282 SqFt", rooms: "3 Beds • 2 Baths", comp: "Real Estate Network Group, LLC" },
        ],
      },
      {
        eyebrow: "Just Reduced", title: "Just Reduced",
        cards: [
          { tag: "REDUCED", place: "Eugene", price: "$ 550,000", type: "Single Family", size: "1,042 SqFt", rooms: "3 Beds • 2.5 Baths", comp: "Triple Oaks Realty LLC" },
          { tag: "REDUCED", place: "Lake Oswego", price: "$ 759,000", type: "Condos", size: "843 SqFt", rooms: "2 Beds • 2 Baths", comp: "Berkshire Hathaway HomeServices NW Real Estate" },
          { tag: "REDUCED", place: "Albany", price: "$ 660,000", type: "Single Family", size: "3,323 SqFt", rooms: "4 Beds • 3.5 Baths", comp: "Keller Realty, RMLS Powered" },
          { tag: "REDUCED", place: "Beaverton", price: "$ 254,900", type: "Manufactured", size: "1,418 SqFt", rooms: "3 Beds • 2 Baths", comp: "Biyan City Realty" },
        ],
      },
    ],
    demoAbout: [
      "Hi,",
      "My name is Adrianna and I am a real estate agent with eXp Realty serving Eugene and the surrounding communities in Lane County.",
      "I got into real estate because I care about the process feeling clear and manageable. Whether you're buying your first home, selling and moving on, or just exploring what's possible, my goal is to give you straightforward guidance, solid local knowledge, and the kind of communication that keeps you informed without the overwhelm.",
      "I'm building my business with a focus on responsiveness, honesty, and treating every client like a person—not a transaction. Outside of work you'll usually find me staying active and enjoying time with family.",
      "If you're thinking about a move, or just want to talk through the market, I'm happy to connect. Let's figure out the next step together.",
    ],
    demoAreas: "Albany · Aloha · Amity · Ashland · Aumsville · Aurora · Baker City · Bandon · Banks · Beaverton · Bend · Boring · Brooks · Brownsville · Burns · Canby",
    demoFooterDisclaimer: "All information provided is deemed reliable but is not guaranteed and should be independently verified. IDX information is provided exclusively for consumers' personal, non-commercial use and may not be used for any purpose other than to identify prospective properties. Listing content is copyright © 2026 RMLS, Portland, Oregon. This is a placeholder; the live IDX feed is not connected.",
  },
};
