// DEMO DATA: For development, testing, and UI preview.
// Prices, ratings, and schedules are realistic representations for testing purposes.

export const PARKS_DATA = [
  {
    id: 'imagicaa-khopoli',
    slug: 'imagicaa-theme-park',
    name: 'Imagicaa Theme & Water Park',
    tagline: 'India’s premier international-standard themed entertainment destination',
    description: 'Spread over 130 acres near Lonavala, Imagicaa offers world-class thrill coasters, family rides, an all-weather indoor snow park, and high-energy water rides with international safety certification.',
    city: 'Lonavala',
    district: 'Raigad',
    state: 'Maharashtra',
    address: '30/31 Sangdewadi, Khopoli-Pali Road, Off Mumbai-Pune Expressway, Lonavala 410203',
    coordinates: { lat: 18.7523, lng: 73.3155 },
    category: 'Theme Park',
    listingType: 'DIRECT_MANAGED',
    isDirectManaged: true,
    rating: 4.6,
    reviewCount: 3842,
    startingPricePaise: 139900, // ₹1,399
    isFeatured: true,
    heroImage: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80'
    ],
    operatingHours: {
      open: '10:30 AM',
      close: '07:30 PM',
      days: 'Monday to Sunday',
      ridesClosing: '06:30 PM'
    },
    facilities: [
      'Secure Electronic Lockers',
      'Multi-Cuisine Restaurants',
      'Free Parking',
      'First Aid & Paramedic Centre',
      'Wheelchair Accessibility',
      'AC Rest Areas',
      'Souvenir Shops'
    ],
    activities: [
      'Rollercoasters',
      'Nitro Hyper-Coaster',
      'Water Slides & Wave Pool',
      'Deep Space Indoor Coaster',
      'I For India 4D Ride',
      'Grand Musical Parade'
    ],
    packages: [
      {
        id: 'pkg-theme-reg',
        name: 'Regular Theme Park Pass',
        description: 'Unlimited access to all regular theme park attractions and live performances.',
        pricePaise: 139900,
        includesExpress: false,
        visitorCategories: [
          { type: 'Adult (Above 5ft)', pricePaise: 139900 },
          { type: 'Child (3.3ft - 5ft)', pricePaise: 109900 },
          { type: 'Senior Citizen (60+)', pricePaise: 99900 }
        ],
        features: ['All theme park rides', 'Live entertainment shows', 'Free park re-entry within day']
      },
      {
        id: 'pkg-theme-express',
        name: 'Express Theme Park Pass (Skip The Line)',
        description: 'VIP express line access to top 12 popular rides with zero waiting time.',
        pricePaise: 249900,
        includesExpress: true,
        visitorCategories: [
          { type: 'Adult (Above 5ft)', pricePaise: 249900 },
          { type: 'Child (3.3ft - 5ft)', pricePaise: 199900 }
        ],
        features: ['VIP express queue for top rides', 'Complimentary welcome drink', 'All regular attractions included']
      },
      {
        id: 'pkg-combo-water-theme',
        name: 'Super Combo: Theme + Water Park Pass',
        description: 'Full-day access to both the Theme Park and the adjacent high-energy Water Park.',
        pricePaise: 189900,
        includesExpress: false,
        visitorCategories: [
          { type: 'Adult (Above 5ft)', pricePaise: 189900 },
          { type: 'Child (3.3ft - 5ft)', pricePaise: 149900 }
        ],
        features: ['Unlimited theme park rides', 'Access to all wave pools and water slides', 'Shower & changing room access']
      }
    ],
    safetyGuidelines: [
      'Nitro Coaster requires minimum height of 137 cm.',
      'Synthetic/nylon swimwear required for all water rides.',
      'Guests with heart ailments or high blood pressure are advised to avoid high-G rides.',
      'Outside food and glassware strictly prohibited inside park premises.'
    ],
    cancellationPolicy: 'Free cancellation with 100% refund up to 48 hours prior to booking date. 50% refund between 24-48 hours. Non-refundable within 24 hours of visit date.',
    contact: {
      phone: '+91 22 4213 0405',
      email: 'guestrelations@imagicaaworld.com',
      website: 'https://www.imagicaaworld.com'
    }
  },
  {
    id: 'wetnjoy-lonavala',
    slug: 'wetnjoy-water-park-lonavala',
    name: 'Wet’nJoy Water & Amusement Park',
    tagline: 'Home to India’s Largest Wave Pool & Tornado Slides',
    description: 'Nestled in the lush hills of Lonavala along the Old Mumbai-Pune Highway, Wet’nJoy features a massive 60,000 sq.ft. wave pool, India’s first Master Blaster water coaster, and over 25 international thrill attractions.',
    city: 'Lonavala',
    district: 'Pune',
    state: 'Maharashtra',
    address: 'Old Pune-Mumbai Highway, Post-Takve, Mundhaware, Lonavala 410405',
    coordinates: { lat: 18.7350, lng: 73.4589 },
    category: 'Water Park',
    listingType: 'AUTHORIZED_THIRD_PARTY',
    isDirectManaged: false,
    rating: 4.5,
    reviewCount: 2940,
    startingPricePaise: 109900, // ₹1,099
    isFeatured: true,
    heroImage: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1520255870062-bd79d3865de7?auto=format&fit=crop&w=800&q=80'
    ],
    operatingHours: {
      open: '10:00 AM',
      close: '06:00 PM',
      days: 'Monday to Sunday',
      ridesClosing: '05:30 PM'
    },
    facilities: [
      'Locker Rental System',
      'Costume Rentals (Lycra/Nylon)',
      'Food Courts & Juice Bars',
      'Life Jackets Provided Free',
      'Ample Vehicle Parking',
      'Ambulance on Standby'
    ],
    activities: [
      'Wave Pool with DJ Rain Dance',
      'Tornado Mega Slide',
      'Crazy River Lazy Float',
      'Master Blaster Coaster',
      'Free Fall Vertical Drop',
      'Kids Aqua Splash Zone'
    ],
    packages: [
      {
        id: 'pkg-wet-water',
        name: 'All-Day Water Park Pass',
        description: 'Access to India’s biggest wave pool, all water slides, and rain dance with live DJ.',
        pricePaise: 109900,
        includesExpress: false,
        visitorCategories: [
          { type: 'Adult (Above 4.5ft)', pricePaise: 109900 },
          { type: 'Child (3.3ft - 4.5ft)', pricePaise: 89900 }
        ],
        features: ['Full day water slides', 'Wave pool entry', 'DJ Rain Dance party', 'Free life jacket use']
      },
      {
        id: 'pkg-wet-combo',
        name: 'Water + Amusement Ride Combo Pass',
        description: 'Enjoy both the aqua attractions and dry rides in the newly launched adventure zone.',
        pricePaise: 149900,
        includesExpress: false,
        visitorCategories: [
          { type: 'Adult (Above 4.5ft)', pricePaise: 149900 },
          { type: 'Child (3.3ft - 4.5ft)', pricePaise: 119900 }
        ],
        features: ['Water park entry', 'Dry thrill rides access', 'Costume & towel discount coupon']
      }
    ],
    safetyGuidelines: [
      'Strictly nylon or lycra swimwear required. Cotton clothing not permitted on slides.',
      'Children must be supervised by an adult at all times in wave pools.',
      'No personal footwear permitted on aqua ride towers.'
    ],
    cancellationPolicy: 'Cancellations allowed up to 24 hours prior to visit date with 85% refund. 15% cancellation charge applies.',
    contact: {
      phone: '+91 91122 11225',
      email: 'bookings@wetnjoy.in',
      website: 'https://wetnjoy.in'
    }
  },
  {
    id: 'della-adventure-lonavala',
    slug: 'della-adventure-park',
    name: 'Della Adventure Park',
    tagline: 'India’s largest extreme adventure park with 50+ adrenaline rushes',
    description: 'Located amidst the scenic Sahyadris in Kunegaon, Della Adventure offers extreme thrills including India’s longest Flying Fox (1260 ft), 150 ft Bungee Jumping, Swoop swing, ATV 700cc dirt tracks, and luxury resort facilities.',
    city: 'Lonavala',
    district: 'Pune',
    state: 'Maharashtra',
    address: 'Kunegaon, Lonavala, Maharashtra 410401',
    coordinates: { lat: 18.7752, lng: 73.4093 },
    category: 'Adventure Park',
    listingType: 'AUTHORIZED_THIRD_PARTY',
    isDirectManaged: false,
    rating: 4.7,
    reviewCount: 4210,
    startingPricePaise: 175000, // ₹1,750
    isFeatured: true,
    heroImage: 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80'
    ],
    operatingHours: {
      open: '11:00 AM',
      close: '09:00 PM',
      days: 'Monday to Sunday',
      ridesClosing: '08:30 PM'
    },
    facilities: [
      'Professional Harnessing & Safety Gear',
      '5 Multi-Cuisine Fine Dining Lounges',
      'Pet Friendly Zones',
      'Night-Lit Adventure Arenas',
      'Valet Parking',
      'Resort Spa & Cabanas'
    ],
    activities: [
      'Flying Fox (1260 ft Zipline)',
      'Bungee Jumping (150 ft)',
      'Swoop Swing (100 ft)',
      '700cc ATV Dirt Track',
      'Paintball War Games',
      'High Rope Challenge Course',
      'Archery & Crossbow'
    ],
    packages: [
      {
        id: 'pkg-della-day',
        name: 'Day Adventure Pass',
        description: 'Unlimited access to 30+ signature adventure activities and gaming zones.',
        pricePaise: 175000,
        includesExpress: false,
        visitorCategories: [
          { type: 'General Guest (Above 10 yrs)', pricePaise: 175000 },
          { type: 'Kids Pass (5-10 yrs)', pricePaise: 125000 }
        ],
        features: ['30+ Adventure Activities', 'Rope courses, zorbing, archery', 'Free harness safety checks']
      },
      {
        id: 'pkg-della-extreme',
        name: 'Extreme Adrenaline Bundle',
        description: 'Includes Bungee Jumping, Swoop Swing, and ATV 700cc along with the Day Pass.',
        pricePaise: 420000,
        includesExpress: true,
        visitorCategories: [
          { type: 'Extreme Thrill Seeker (16+ yrs)', pricePaise: 420000 }
        ],
        features: ['150ft Bungee Jump with certificate', '1260ft Flying Fox', '700cc ATV Lap', 'Full Day Pass included']
      }
    ],
    safetyGuidelines: [
      'Sports shoes compulsory for all activities. Sandals, crocs, or heels strictly not allowed.',
      'Bungee jumping weight restriction: 35 kg to 110 kg.',
      'Signed liability waiver mandatory before high-risk activities.'
    ],
    cancellationPolicy: 'Free cancellation up to 48 hours prior to booking. Rescheduling permitted once within 30 days.',
    contact: {
      phone: '+91 22 6845 1234',
      email: 'adventure@dellaresorts.com',
      website: 'https://www.dellaadventure.com'
    }
  },
  {
    id: 'sunnys-world-pune',
    slug: 'sunnys-world-adventure-park',
    name: 'Sunny’s World Adventure & Resort',
    tagline: 'Pune’s hilltop mega-resort with 100+ thrilling land, air & water activities',
    description: 'Set across 133 acres in Sus, Pune with panoramic views of the valley, Sunny’s World offers dirt-bike tracks, artificial ice skating, mountain ropeway, high ziplines, and luxury hilltop glamping.',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    address: 'Highway Sus, Pashan - Sus Rd, near Pune-Bangalore Highway, Pune 411021',
    coordinates: { lat: 18.5529, lng: 73.7483 },
    category: 'Adventure Park',
    listingType: 'AUTHORIZED_THIRD_PARTY',
    isDirectManaged: false,
    rating: 4.4,
    reviewCount: 1870,
    startingPricePaise: 99900, // ₹999
    isFeatured: true,
    heroImage: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
    ],
    operatingHours: {
      open: '09:00 AM',
      close: '08:00 PM',
      days: 'Tuesday to Sunday (Closed Mondays)',
      ridesClosing: '07:30 PM'
    },
    facilities: [
      'Hilltop Dining with Valley View',
      'Luxury Tent Camping',
      'Corporate Team Building Arenas',
      'Conference Rooms',
      'EV Charging Stations'
    ],
    activities: [
      'High Velocity Zipline',
      'ATV Off-Road Circuit',
      'Rope Course Matrix',
      'Giant Sky Swing',
      'Paintball Arena',
      'Rifle Shooting Range'
    ],
    packages: [
      {
        id: 'pkg-sunny-classic',
        name: 'Hilltop Adventure Pass',
        description: 'Access to 20 signature rope courses, rifle shooting, and valley zipline.',
        pricePaise: 99900,
        includesExpress: false,
        visitorCategories: [
          { type: 'Standard Entry (All Ages)', pricePaise: 99900 }
        ],
        features: ['Valley Zipline', '20-element rope course', 'Rifle Shooting', 'Archery']
      },
      {
        id: 'pkg-sunny-all-inclusive',
        name: 'Sunset Adventure + Dinner Buffet Combo',
        description: 'Complete afternoon adventure activities followed by an evening multi-cuisine hilltop buffet.',
        pricePaise: 189900,
        includesExpress: false,
        visitorCategories: [
          { type: 'Adult Pass + Buffet', pricePaise: 189900 },
          { type: 'Child Pass + Buffet', pricePaise: 139900 }
        ],
        features: ['Full Adventure access', 'Grand Dinner Buffet', 'Live acoustic music on weekends']
      }
    ],
    safetyGuidelines: [
      'Safety briefing compulsory before embarking on rope courses.',
      'Age limit for high zipline: 10 years and above.',
      'Sports footwear required.'
    ],
    cancellationPolicy: 'Cancellations before 24 hours receive 90% refund. Same day cancellations are non-refundable.',
    contact: {
      phone: '+91 96675 55555',
      email: 'events@sunnysworldpune.com',
      website: 'https://sunnysworldpune.com'
    }
  },
  {
    id: 'tikuji-ni-wadi-thane',
    slug: 'tikuji-ni-wadi-amusement-water-park',
    name: 'Tikuji-Ni-Wadi Fun Resort',
    tagline: 'Mumbai & Thane’s favorite evergreen family amusement & water park',
    description: 'Set against the lush backdrop of Yeoor Hills in Thane, Tikuji-Ni-Wadi has delighted families for decades with its massive wave pools, lazy river, dinosaur park, go-karting, and shaded picnic groves.',
    city: 'Mumbai',
    district: 'Thane',
    state: 'Maharashtra',
    address: 'Ghodbunder Road, Manpada, Chitrathani, Thane West, Maharashtra 400607',
    coordinates: { lat: 19.2393, lng: 72.9736 },
    category: 'Amusement Park',
    listingType: 'AUTHORIZED_THIRD_PARTY',
    isDirectManaged: false,
    rating: 4.2,
    reviewCount: 2450,
    startingPricePaise: 79900, // ₹799
    isFeatured: false,
    heroImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
    ],
    operatingHours: {
      open: '09:00 AM',
      close: '06:30 PM',
      days: 'Monday to Sunday',
      ridesClosing: '06:00 PM'
    },
    facilities: [
      'Pure Veg Multi-Cuisine Dining',
      'Locker Rooms',
      'Family Picnic Lawns',
      'Rain Dance Stage',
      'Shuttle Cart Services'
    ],
    activities: [
      'Wave Pool & Water Slides',
      'Giant Ferris Wheel',
      'Dinosaur Park Experience',
      'Go-Karting Speedway',
      'Bumping Cars'
    ],
    packages: [
      {
        id: 'pkg-tikuji-combo',
        name: 'Amusement + Water Park Pass',
        description: 'Complete day pass covering both water rides and the amusement park.',
        pricePaise: 79900,
        includesExpress: false,
        visitorCategories: [
          { type: 'Per Head (Above 3 yrs)', pricePaise: 79900 }
        ],
        features: ['All water park slides', 'Wave pool entry', 'Amusement dry rides access']
      }
    ],
    safetyGuidelines: [
      'Lycra swimwear required in water park.',
      'Outside cooked food allowed in designated garden picnic spots only.'
    ],
    cancellationPolicy: 'Cancellations 48 hours prior receive 80% refund. 20% administrative retention applies.',
    contact: {
      phone: '+91 22 2589 2061',
      email: 'info@tikujiniwadi.com',
      website: 'https://tikujiniwadi.com'
    }
  },
  {
    id: 'zonkers-adventure-nashik',
    slug: 'zonkers-adventure-park-nashik',
    name: 'Zonkers Adventure Park',
    tagline: 'Adrenaline on the banks of Gangapur Dam in wine country',
    description: 'Situated near Sula Vineyards along the picturesque Gangapur Dam backwaters, Zonkers offers quad-bike rallying, go-karting, 500-meter ziplining over water canals, and rock climbing walls.',
    city: 'Nashik',
    district: 'Nashik',
    state: 'Maharashtra',
    address: 'Near Sula Vineyards, Gangapur Dam Road, Nashik, Maharashtra 422222',
    coordinates: { lat: 19.9882, lng: 73.7058 },
    category: 'Adventure Park',
    listingType: 'DIRECT_MANAGED',
    isDirectManaged: true,
    rating: 4.5,
    reviewCount: 1320,
    startingPricePaise: 85000, // ₹850
    isFeatured: false,
    heroImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?auto=format&fit=crop&w=800&q=80'
    ],
    operatingHours: {
      open: '10:00 AM',
      close: '07:30 PM',
      days: 'Monday to Sunday',
      ridesClosing: '07:00 PM'
    },
    facilities: [
      'Dam View Cafe',
      'Safety Gear & Helmets',
      'Free Parking',
      'Camping Ground'
    ],
    activities: [
      'Water Canal Zipline',
      'Go-Karting Track',
      'ATV Quad Bike Trail',
      'Artificial Rock Climbing Wall',
      'Rope Balance Bridge'
    ],
    packages: [
      {
        id: 'pkg-zonkers-explorer',
        name: 'Adventure Explorer Package',
        description: 'Includes 1 round of Go-Karting, Canal Zipline, and Rock Climbing.',
        pricePaise: 85000,
        includesExpress: false,
        visitorCategories: [
          { type: 'Standard (Above 8 yrs)', pricePaise: 85000 }
        ],
        features: ['Go-karting 6 laps', 'Water Zipline', 'Rock Wall Climb', 'Equipment provided']
      }
    ],
    safetyGuidelines: [
      'Helmets and safety gear mandatory for all motorized and aerial sports.',
      'Age limit for Go-Karting: 12 years and above.'
    ],
    cancellationPolicy: 'Full refund if cancelled at least 24 hours before the activity slot.',
    contact: {
      phone: '+91 98222 34567',
      email: 'bookings@zonkers.in',
      website: 'https://zonkers.in'
    }
  },
  {
    id: 'sayaji-water-park-kolhapur',
    slug: 'sayaji-water-fun-park-kolhapur',
    name: 'Sayaji Water Fun World',
    tagline: 'Southern Maharashtra’s ultimate family water kingdom',
    description: 'Located in the historic city of Kolhapur, Sayaji Water Fun World features thrilling multi-lane water slides, a family splash pool, wave generators, and landscaped gardens.',
    city: 'Kolhapur',
    district: 'Kolhapur',
    state: 'Maharashtra',
    address: 'Near Shivaji University, Old Pune-Bangalore Road, Kolhapur 416004',
    coordinates: { lat: 16.6780, lng: 74.2546 },
    category: 'Water Park',
    listingType: 'AUTHORIZED_THIRD_PARTY',
    isDirectManaged: false,
    rating: 4.3,
    reviewCount: 960,
    startingPricePaise: 65000, // ₹650
    isFeatured: false,
    heroImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'
    ],
    operatingHours: {
      open: '10:00 AM',
      close: '06:00 PM',
      days: 'Monday to Sunday',
      ridesClosing: '05:30 PM'
    },
    facilities: [
      'Locker Facilities',
      'Kolhapuri Specialty Food Counters',
      'Life Guards',
      'Changing Rooms'
    ],
    activities: [
      'Multi-Lane Slide',
      'Wave Pool',
      'Rain Dance',
      'Kids Splash Tower'
    ],
    packages: [
      {
        id: 'pkg-sayaji-entry',
        name: 'Full Day Water Splash Pass',
        description: 'Unlimited access to all water slides, rain dance and wave pool.',
        pricePaise: 65000,
        includesExpress: false,
        visitorCategories: [
          { type: 'Adult Entry', pricePaise: 65000 },
          { type: 'Child Entry (Under 4ft)', pricePaise: 45000 }
        ],
        features: ['All slides included', 'Wave pool access', 'Rain dance access']
      }
    ],
    safetyGuidelines: [
      'Proper swimwear required.',
      'Follow lifeguard instructions at all times.'
    ],
    cancellationPolicy: 'Refunds permitted up to 24 hours prior to visit date minus 10% handling fee.',
    contact: {
      phone: '+91 231 260 5500',
      email: 'sayajiwaterpark@kolhapur.com',
      website: 'https://sayajipark.in'
    }
  }
];

export const CITIES = [
  'All Cities',
  'Lonavala',
  'Pune',
  'Mumbai',
  'Nashik',
  'Kolhapur',
  'Chhatrapati Sambhajinagar'
];

export const CATEGORIES = [
  'All Categories',
  'Theme Park',
  'Water Park',
  'Adventure Park',
  'Amusement Park',
  'Recreational Resort'
];
