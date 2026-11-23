import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import Park from '../models/Park.js';
import Package from '../models/Package.js';
import Destination from '../models/Destination.js';
import Coupon from '../models/Coupon.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import Ticket from '../models/Ticket.js';
import Review from '../models/Review.js';

dotenv.config();

const SEED_ACTIVITIES = [
  {
    name: 'Water Rides & Wave Pools',
    slug: 'water-rides',
    category: 'Water Sports',
    description: 'High-octane wave pools, tornado drops, multi-lane slides, and rain dances with live DJs.',
    iconName: 'Waves',
    image: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=800&q=80',
    intensity: 'High'
  },
  {
    name: 'Mega Rollercoasters',
    slug: 'rollercoasters',
    category: 'Thrill Rides',
    description: 'International-grade looping coasters, floorless drops, and indoor dark coasters.',
    iconName: 'Zap',
    image: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=800&q=80',
    intensity: 'Extreme'
  },
  {
    name: 'High-Altitude Zipline',
    slug: 'zipline',
    category: 'Aerial Adventure',
    description: 'Soar across valleys and water canals on safety-certified flying foxes up to 1,260 feet long.',
    iconName: 'Wind',
    image: 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?auto=format&fit=crop&w=800&q=80',
    intensity: 'High'
  },
  {
    name: 'ATV & Quad Bike Off-Roading',
    slug: 'atv-off-roading',
    category: 'Motor Sports',
    description: 'Conquer rugged mountain tracks, mud pits, and steep banking corners on 700cc quad bikes.',
    iconName: 'Compass',
    image: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=800&q=80',
    intensity: 'Extreme'
  },
  {
    name: '150ft Bungee Jumping & Swoop',
    slug: 'bungee-jumping',
    category: 'Extreme Thrills',
    description: 'Leap from a 150-foot tower over scenic valleys with certified jump masters.',
    iconName: 'Flame',
    image: 'https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=800&q=80',
    intensity: 'Extreme'
  },
  {
    name: 'High Rope & Obstacle Courses',
    slug: 'rope-course-challenges',
    category: 'Physical Challenge',
    description: 'Burma bridges, swinging logs, horizontal nets, and zip crosses test your agility and balance.',
    iconName: 'ShieldCheck',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80',
    intensity: 'Medium'
  },
  {
    name: 'Go-Karting Speedway',
    slug: 'go-karting',
    category: 'Racing',
    description: 'High-speed asphalt circuits with precision timing sensors and performance karts.',
    iconName: 'Trophy',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    intensity: 'High'
  },
  {
    name: 'Kids Wonderlands & Gentle Rides',
    slug: 'kids-amusement',
    category: 'Family Friendly',
    description: 'Mini coasters, merry-go-rounds, splash buckets, bumper cars, and dinosaur animatronics.',
    iconName: 'Smile',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    intensity: 'Low'
  }
];

const SEED_DESTINATIONS = [
  {
    name: 'Lonavala & Khandala',
    slug: 'lonavala',
    tagline: 'Mist-Covered Valleys & Thrilling Water Parks',
    description: 'Maharashtra’s top weekend retreat nestled along the Mumbai-Pune Expressway, featuring world-class theme parks, gigantic wave pools, and adventure resorts.',
    image: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=1200&q=80',
    bestTimeToVisit: 'July to March',
    popularActivities: ['Water Rides', 'Theme Park Coasters', 'Zipline', 'Bungee Jumping'],
    coordinates: { lat: 18.7523, lng: 73.3155 },
    parkSlugs: ['imagicaa-theme-park', 'wetnjoy-water-park-lonavala', 'della-adventure-park']
  },
  {
    name: 'Pune & Mulshi',
    slug: 'pune',
    tagline: 'Adventure Hubs & Sahyadri Foothill Trails',
    description: 'The cultural capital blends hillside adventure sports, dirt-track racing, high ropes, and scenic lakefront activities just minutes from the city.',
    image: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1200&q=80',
    bestTimeToVisit: 'October to February',
    popularActivities: ['ATV Off-Roading', 'Rope Course', 'Valley Zipline', 'Hilltop Dining'],
    coordinates: { lat: 18.5529, lng: 73.7483 },
    parkSlugs: ['sunnys-world-adventure-park']
  },
  {
    name: 'Mumbai & Thane',
    slug: 'mumbai',
    tagline: 'Mega Wave Pools & High-Octane Thrills',
    description: 'Experience exciting water worlds, wave pools, and nostalgic amusement parks close to the financial capital and nestled against the lush Yeoor Hills.',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80',
    bestTimeToVisit: 'All Year Round',
    popularActivities: ['Wave Pool', 'Amusement Rides', 'Go-Karting', 'Dinosaur Park'],
    coordinates: { lat: 19.2393, lng: 72.9736 },
    parkSlugs: ['tikuji-ni-wadi-amusement-water-park']
  },
  {
    name: 'Nashik & Igatpuri',
    slug: 'nashik',
    tagline: 'Vineyard Adventures & Mountain Climbing',
    description: 'Known as the wine capital of India, Nashik pairs vineyard tourism with adrenaline-packed dam-side adventure parks and rock climbing.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    bestTimeToVisit: 'September to March',
    popularActivities: ['Water Canal Zipline', 'Go-Karting', 'Quad Biking', 'Rock Climbing'],
    coordinates: { lat: 19.9882, lng: 73.7058 },
    parkSlugs: ['zonkers-adventure-park-nashik']
  },
  {
    name: 'Kolhapur & Panhala',
    slug: 'kolhapur',
    tagline: 'Historic Fort Gateways & Family Splash Fun',
    description: 'A vibrant historic region offering family water resorts, scenic mountain passes, and authentic Maharashtrian hospitality.',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    bestTimeToVisit: 'October to April',
    popularActivities: ['Multi-Lane Water Slides', 'Wave Pool', 'Rain Dance'],
    coordinates: { lat: 16.6780, lng: 74.2546 },
    parkSlugs: ['sayaji-water-fun-park-kolhapur']
  }
];

const SEED_COUPONS = [
  {
    code: 'ADVENTURE25',
    title: 'Weekday Explorer Special',
    tagline: 'Flat 25% Off on All Weekday Visits',
    description: 'Book for Monday through Thursday visits and unlock 25% instant discount on entry passes across all participating parks.',
    discountType: 'PERCENTAGE',
    discountValue: 25,
    minBookingAmountPaise: 150000,
    validUntil: new Date('2026-11-30'),
    applicableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    badge: 'Popular',
    terms: 'Valid on regular and combo packages. Cannot be combined with group pass offers.'
  },
  {
    code: 'GROUP500',
    title: 'Squad & Gang Bundle',
    tagline: 'Flat ₹500 Off on 4+ Passes',
    description: 'Adventure is best shared! Grab your friends or family and get flat ₹500 discount when reserving 4 or more passes together.',
    discountType: 'FLAT_AMOUNT',
    discountValue: 50000,
    minPassCount: 4,
    validUntil: new Date('2026-12-31'),
    applicableDays: ['All Days'],
    badge: 'Group Special',
    terms: 'Minimum 4 tickets in a single booking reference. Valid across theme and water parks.'
  },
  {
    code: 'STUDENT20',
    title: 'Student Adrenaline Pass',
    tagline: '20% Off with Valid College/School ID',
    description: 'Blow off exam steam! College and school students enjoy 20% off upon presenting valid photo ID at park turnstiles.',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    minBookingAmountPaise: 100000,
    validUntil: new Date('2026-12-15'),
    applicableDays: ['All Days'],
    badge: 'Student Perk',
    terms: 'Physical student ID required at entry gate for each discounted visitor.'
  },
  {
    code: 'FAMILYFUN',
    title: 'Family Feast Combo Pass',
    tagline: 'Save 15% + Free Lunch Vouchers',
    description: 'Ideal for 2 adults and up to 2 kids. Includes free food court meal coupons at partner parks.',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    minBookingAmountPaise: 300000,
    validUntil: new Date('2026-11-15'),
    applicableDays: ['Friday', 'Saturday', 'Sunday'],
    badge: 'Family Favorite',
    terms: 'Must include at least 1 child pass in the booking.'
  }
];

export async function seedDatabase() {
  console.log('--- Starting Adventure Maharashtra Database Seeding ---');
  await connectDB();

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Activity.deleteMany({}),
    Destination.deleteMany({}),
    Coupon.deleteMany({}),
    Package.deleteMany({}),
    Park.deleteMany({}),
    Booking.deleteMany({}),
    Payment.deleteMany({}),
    Ticket.deleteMany({}),
    Review.deleteMany({})
  ]);
  console.log('[Seed]: Cleared existing collections.');

  // Create Users
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Admin@12345', salt);
  const userHash = await bcrypt.hash('Password@123', salt);

  const [superAdmin, parkOwner, staffUser, traveler] = await User.insertMany([
    {
      name: 'State Tourism Administrator',
      email: 'admin@adventuremaharashtra.in',
      normalizedEmail: 'admin@adventuremaharashtra.in',
      passwordHash,
      role: 'SUPER_ADMIN',
      phone: '+91 22 2202 4444',
      isVerified: true
    },
    {
      name: 'Imagicaa Park Manager',
      email: 'owner.imagicaa@adventuremaharashtra.in',
      normalizedEmail: 'owner.imagicaa@adventuremaharashtra.in',
      passwordHash: userHash,
      role: 'PARK_ADMIN',
      phone: '+91 22 4213 0405',
      isVerified: true
    },
    {
      name: 'Lonavala Gate Staff',
      email: 'gate.staff@adventuremaharashtra.in',
      normalizedEmail: 'gate.staff@adventuremaharashtra.in',
      passwordHash: userHash,
      role: 'ENTRY_STAFF',
      phone: '+91 98230 11223',
      isVerified: true
    },
    {
      name: 'Aarav Deshmukh',
      email: 'aarav@example.com',
      normalizedEmail: 'aarav@example.com',
      passwordHash: userHash,
      role: 'CUSTOMER',
      phone: '+91 98765 43210',
      isVerified: true
    }
  ]);
  console.log('[Seed]: Created system users (Super Admin, Park Admin, Entry Staff, Customer).');

  // Insert Activities
  const createdActivities = await Activity.insertMany(SEED_ACTIVITIES);
  console.log(`[Seed]: Created ${createdActivities.length} activities.`);

  // Insert Destinations
  const createdDestinations = await Destination.insertMany(SEED_DESTINATIONS);
  console.log(`[Seed]: Created ${createdDestinations.length} destinations.`);

  // Insert Coupons
  const createdCoupons = await Coupon.insertMany(SEED_COUPONS);
  console.log(`[Seed]: Created ${createdCoupons.length} promotional coupons.`);

  // Seed Parks
  const PARKS_DEFINITIONS = [
    {
      name: 'Imagicaa Theme & Water Park',
      slug: 'imagicaa-theme-park',
      tagline: 'India’s premier international-standard themed entertainment destination',
      description: 'Spread over 130 acres near Lonavala, Imagicaa offers world-class thrill coasters, family rides, an all-weather indoor snow park, and high-energy water rides with international safety certification.',
      city: 'Lonavala',
      district: 'Raigad',
      state: 'Maharashtra',
      address: '30/31 Sangdewadi, Khopoli-Pali Road, Off Mumbai-Pune Expressway, Lonavala 410203',
      location: { type: 'Point', coordinates: [73.3155, 18.7523] },
      category: 'Theme Park',
      listingType: 'DIRECT_MANAGED',
      isDirectManaged: true,
      isFeatured: true,
      rating: 4.6,
      reviewCount: 3842,
      startingPricePaise: 139900,
      heroImage: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=800&q=80'
      ],
      operatingHours: { open: '10:30 AM', close: '07:30 PM', days: 'Monday to Sunday', ridesClosing: '06:30 PM' },
      facilities: ['Secure Electronic Lockers', 'Multi-Cuisine Restaurants', 'Free Parking', 'First Aid & Paramedic Centre', 'Wheelchair Accessibility', 'AC Rest Areas', 'Souvenir Shops'],
      activityNames: ['Rollercoasters', 'Nitro Hyper-Coaster', 'Water Rides & Wave Pools', 'Kids Wonderlands & Gentle Rides'],
      safetyGuidelines: [
        'Nitro Coaster requires minimum height of 137 cm.',
        'Synthetic/nylon swimwear required for all water rides.',
        'Guests with heart ailments or high blood pressure are advised to avoid high-G rides.',
        'Outside food and glassware strictly prohibited inside park premises.'
      ],
      cancellationPolicy: 'Free cancellation with 100% refund up to 48 hours prior to booking date. 50% refund between 24-48 hours. Non-refundable within 24 hours of visit date.',
      contact: { phone: '+91 22 4213 0405', email: 'guestrelations@imagicaaworld.com', website: 'https://www.imagicaaworld.com' },
      owners: [parkOwner._id],
      packagesData: [
        {
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
      ]
    },
    {
      name: 'Wet’nJoy Water & Amusement Park',
      slug: 'wetnjoy-water-park-lonavala',
      tagline: 'Home to India’s Largest Wave Pool & Tornado Slides',
      description: 'Nestled in the lush hills of Lonavala along the Old Mumbai-Pune Highway, Wet’nJoy features a massive 60,000 sq.ft. wave pool, India’s first Master Blaster water coaster, and over 25 international thrill attractions.',
      city: 'Lonavala',
      district: 'Pune',
      state: 'Maharashtra',
      address: 'Old Pune-Mumbai Highway, Post-Takve, Mundhaware, Lonavala 410405',
      location: { type: 'Point', coordinates: [73.4589, 18.7350] },
      category: 'Water Park',
      listingType: 'AUTHORIZED_THIRD_PARTY',
      isDirectManaged: false,
      isFeatured: true,
      rating: 4.5,
      reviewCount: 2940,
      startingPricePaise: 109900,
      heroImage: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1520255870062-bd79d3865de7?auto=format&fit=crop&w=800&q=80'
      ],
      operatingHours: { open: '10:00 AM', close: '06:00 PM', days: 'Monday to Sunday', ridesClosing: '05:30 PM' },
      facilities: ['Locker Rental System', 'Costume Rentals (Lycra/Nylon)', 'Food Courts & Juice Bars', 'Life Jackets Provided Free', 'Ample Vehicle Parking'],
      activityNames: ['Water Rides & Wave Pools', 'Kids Wonderlands & Gentle Rides'],
      safetyGuidelines: [
        'Strictly nylon or lycra swimwear required. Cotton clothing not permitted on slides.',
        'Children must be supervised by an adult at all times in wave pools.'
      ],
      cancellationPolicy: 'Cancellations allowed up to 24 hours prior to visit date with 85% refund. 15% cancellation charge applies.',
      contact: { phone: '+91 91122 11225', email: 'bookings@wetnjoy.in', website: 'https://wetnjoy.in' },
      packagesData: [
        {
          name: 'All-Day Water Park Pass',
          description: 'Access to India’s biggest wave pool, all water slides, and rain dance with live DJ.',
          pricePaise: 109900,
          includesExpress: false,
          visitorCategories: [
            { type: 'Adult (Above 4.5ft)', pricePaise: 109900 },
            { type: 'Child (3.3ft - 4.5ft)', pricePaise: 89900 }
          ],
          features: ['Full day water slides', 'Wave pool entry', 'DJ Rain Dance party', 'Free life jacket use']
        }
      ]
    },
    {
      name: 'Della Adventure Park',
      slug: 'della-adventure-park',
      tagline: 'India’s largest extreme adventure park with 50+ adrenaline rushes',
      description: 'Located amidst the scenic Sahyadris in Kunegaon, Della Adventure offers extreme thrills including India’s longest Flying Fox (1260 ft), 150 ft Bungee Jumping, Swoop swing, ATV 700cc dirt tracks, and luxury resort facilities.',
      city: 'Lonavala',
      district: 'Pune',
      state: 'Maharashtra',
      address: 'Kunegaon, Lonavala, Maharashtra 410401',
      location: { type: 'Point', coordinates: [73.4093, 18.7752] },
      category: 'Adventure Park',
      listingType: 'AUTHORIZED_THIRD_PARTY',
      isDirectManaged: false,
      isFeatured: true,
      rating: 4.7,
      reviewCount: 4210,
      startingPricePaise: 175000,
      heroImage: 'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1533587851505-d119e13fa0d7?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=800&q=80'
      ],
      operatingHours: { open: '11:00 AM', close: '09:00 PM', days: 'Monday to Sunday', ridesClosing: '08:30 PM' },
      facilities: ['Professional Harnessing & Safety Gear', '5 Multi-Cuisine Fine Dining Lounges', 'Pet Friendly Zones', 'Valet Parking'],
      activityNames: ['High-Altitude Zipline', '150ft Bungee Jumping & Swoop', 'ATV & Quad Bike Off-Roading', 'High Rope & Obstacle Courses'],
      safetyGuidelines: [
        'Sports shoes compulsory for all activities. Sandals, crocs, or heels strictly not allowed.',
        'Bungee jumping weight restriction: 35 kg to 110 kg.'
      ],
      cancellationPolicy: 'Free cancellation up to 48 hours prior to booking. Rescheduling permitted once within 30 days.',
      contact: { phone: '+91 22 6845 1234', email: 'adventure@dellaresorts.com', website: 'https://www.dellaadventure.com' },
      packagesData: [
        {
          name: 'Day Adventure Pass',
          description: 'Unlimited access to 30+ signature adventure activities and gaming zones.',
          pricePaise: 175000,
          includesExpress: false,
          visitorCategories: [
            { type: 'General Guest (Above 10 yrs)', pricePaise: 175000 },
            { type: 'Kids Pass (5-10 yrs)', pricePaise: 125000 }
          ],
          features: ['30+ Adventure Activities', 'Rope courses, zorbing, archery', 'Free harness safety checks']
        }
      ]
    },
    {
      name: 'Sunny’s World Adventure & Resort',
      slug: 'sunnys-world-adventure-park',
      tagline: 'Pune’s hilltop mega-resort with 100+ thrilling land, air & water activities',
      description: 'Set across 133 acres in Sus, Pune with panoramic views of the valley, Sunny’s World offers dirt-bike tracks, artificial ice skating, mountain ropeway, high ziplines, and luxury hilltop glamping.',
      city: 'Pune',
      district: 'Pune',
      state: 'Maharashtra',
      address: 'Highway Sus, Pashan - Sus Rd, near Pune-Bangalore Highway, Pune 411021',
      location: { type: 'Point', coordinates: [73.7483, 18.5529] },
      category: 'Adventure Park',
      listingType: 'AUTHORIZED_THIRD_PARTY',
      isDirectManaged: false,
      isFeatured: true,
      rating: 4.4,
      reviewCount: 1870,
      startingPricePaise: 99900,
      heroImage: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=800&q=80'
      ],
      operatingHours: { open: '09:00 AM', close: '08:00 PM', days: 'Tuesday to Sunday', ridesClosing: '07:30 PM' },
      facilities: ['Hilltop Dining with Valley View', 'Luxury Tent Camping', 'Conference Rooms', 'EV Charging Stations'],
      activityNames: ['High-Altitude Zipline', 'ATV & Quad Bike Off-Roading', 'High Rope & Obstacle Courses'],
      safetyGuidelines: ['Safety briefing compulsory before embarking on rope courses.', 'Sports footwear required.'],
      cancellationPolicy: 'Cancellations before 24 hours receive 90% refund. Same day cancellations are non-refundable.',
      contact: { phone: '+91 96675 55555', email: 'events@sunnysworldpune.com', website: 'https://sunnysworldpune.com' },
      packagesData: [
        {
          name: 'Hilltop Adventure Pass',
          description: 'Access to 20 signature rope courses, rifle shooting, and valley zipline.',
          pricePaise: 99900,
          includesExpress: false,
          visitorCategories: [{ type: 'Standard Entry (All Ages)', pricePaise: 99900 }],
          features: ['Valley Zipline', '20-element rope course', 'Rifle Shooting', 'Archery']
        }
      ]
    },
    {
      name: 'Tikuji-Ni-Wadi Fun Resort',
      slug: 'tikuji-ni-wadi-amusement-water-park',
      tagline: 'Mumbai & Thane’s favorite evergreen family amusement & water park',
      description: 'Set against the lush backdrop of Yeoor Hills in Thane, Tikuji-Ni-Wadi has delighted families for decades with its massive wave pools, lazy river, dinosaur park, go-karting, and shaded picnic groves.',
      city: 'Mumbai',
      district: 'Thane',
      state: 'Maharashtra',
      address: 'Ghodbunder Road, Manpada, Chitrathani, Thane West, Maharashtra 400607',
      location: { type: 'Point', coordinates: [72.9736, 19.2393] },
      category: 'Amusement Park',
      listingType: 'AUTHORIZED_THIRD_PARTY',
      isDirectManaged: false,
      isFeatured: false,
      rating: 4.2,
      reviewCount: 2450,
      startingPricePaise: 79900,
      heroImage: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80'
      ],
      operatingHours: { open: '09:00 AM', close: '06:30 PM', days: 'Monday to Sunday', ridesClosing: '06:00 PM' },
      facilities: ['Pure Veg Multi-Cuisine Dining', 'Locker Rooms', 'Family Picnic Lawns', 'Rain Dance Stage'],
      activityNames: ['Water Rides & Wave Pools', 'Go-Karting Speedway', 'Kids Wonderlands & Gentle Rides'],
      safetyGuidelines: ['Lycra swimwear required in water park.'],
      cancellationPolicy: 'Cancellations 48 hours prior receive 80% refund.',
      contact: { phone: '+91 22 2589 2061', email: 'info@tikujiniwadi.com', website: 'https://tikujiniwadi.com' },
      packagesData: [
        {
          name: 'Amusement + Water Park Pass',
          description: 'Complete day pass covering both water rides and the amusement park.',
          pricePaise: 79900,
          includesExpress: false,
          visitorCategories: [{ type: 'Per Head (Above 3 yrs)', pricePaise: 79900 }],
          features: ['All water park slides', 'Wave pool entry', 'Amusement dry rides access']
        }
      ]
    },
    {
      name: 'Zonkers Adventure Park',
      slug: 'zonkers-adventure-park-nashik',
      tagline: 'Adrenaline on the banks of Gangapur Dam in wine country',
      description: 'Situated near Sula Vineyards along the picturesque Gangapur Dam backwaters, Zonkers offers quad-bike rallying, go-karting, 500-meter ziplining over water canals, and rock climbing walls.',
      city: 'Nashik',
      district: 'Nashik',
      state: 'Maharashtra',
      address: 'Near Sula Vineyards, Gangapur Dam Road, Nashik, Maharashtra 422222',
      location: { type: 'Point', coordinates: [73.7058, 19.9882] },
      category: 'Adventure Park',
      listingType: 'DIRECT_MANAGED',
      isDirectManaged: true,
      isFeatured: false,
      rating: 4.5,
      reviewCount: 1320,
      startingPricePaise: 85000,
      heroImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80'
      ],
      operatingHours: { open: '10:00 AM', close: '07:30 PM', days: 'Monday to Sunday', ridesClosing: '07:00 PM' },
      facilities: ['Dam View Cafe', 'Safety Gear & Helmets', 'Free Parking', 'Camping Ground'],
      activityNames: ['High-Altitude Zipline', 'Go-Karting Speedway', 'ATV & Quad Bike Off-Roading', 'High Rope & Obstacle Courses'],
      safetyGuidelines: ['Helmets and safety gear mandatory for all motorized and aerial sports.'],
      cancellationPolicy: 'Full refund if cancelled at least 24 hours before the activity slot.',
      contact: { phone: '+91 98222 34567', email: 'bookings@zonkers.in', website: 'https://zonkers.in' },
      packagesData: [
        {
          name: 'Adventure Explorer Package',
          description: 'Includes 1 round of Go-Karting, Canal Zipline, and Rock Climbing.',
          pricePaise: 85000,
          includesExpress: false,
          visitorCategories: [{ type: 'Standard (Above 8 yrs)', pricePaise: 85000 }],
          features: ['Go-karting 6 laps', 'Water Zipline', 'Rock Wall Climb', 'Equipment provided']
        }
      ]
    },
    {
      name: 'Sayaji Water Fun World',
      slug: 'sayaji-water-fun-park-kolhapur',
      tagline: 'Southern Maharashtra’s ultimate family water kingdom',
      description: 'Located in the historic city of Kolhapur, Sayaji Water Fun World features thrilling multi-lane water slides, a family splash pool, wave generators, and landscaped gardens.',
      city: 'Kolhapur',
      district: 'Kolhapur',
      state: 'Maharashtra',
      address: 'Near Shivaji University, Old Pune-Bangalore Road, Kolhapur 416004',
      location: { type: 'Point', coordinates: [74.2546, 16.6780] },
      category: 'Water Park',
      listingType: 'AUTHORIZED_THIRD_PARTY',
      isDirectManaged: false,
      isFeatured: false,
      rating: 4.3,
      reviewCount: 960,
      startingPricePaise: 65000,
      heroImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
      gallery: [
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80'
      ],
      operatingHours: { open: '10:00 AM', close: '06:00 PM', days: 'Monday to Sunday', ridesClosing: '05:30 PM' },
      facilities: ['Locker Facilities', 'Kolhapuri Specialty Food Counters', 'Life Guards', 'Changing Rooms'],
      activityNames: ['Water Rides & Wave Pools'],
      safetyGuidelines: ['Proper swimwear required.', 'Follow lifeguard instructions at all times.'],
      cancellationPolicy: 'Refunds permitted up to 24 hours prior to visit date minus 10% handling fee.',
      contact: { phone: '+91 231 260 5500', email: 'sayajiwaterpark@kolhapur.com', website: 'https://sayajipark.in' },
      packagesData: [
        {
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
      ]
    }
  ];

  // Insert parks and their packages
  for (const parkDef of PARKS_DEFINITIONS) {
    const { packagesData, ...parkData } = parkDef;
    const park = new Park(parkData);
    await park.save();

    // Create Packages linked to this park
    const createdPackages = [];
    for (const pkgData of packagesData) {
      const pkg = new Package({
        ...pkgData,
        park: park._id
      });
      await pkg.save();
      createdPackages.push(pkg._id);
    }

    // Update park with package references
    park.packages = createdPackages;
    await park.save();
    console.log(`[Seed]: Created Park '${park.name}' with ${createdPackages.length} package(s).`);
  }

  // Create Demo Customer Bookings, Digital Tickets, and Verified Reviews
  const demoCustomer = await User.findOne({ email: 'aarav@example.com' });
  const imagicaa = await Park.findOne({ slug: 'imagicaa-theme-park' }).populate('packages');

  if (demoCustomer && imagicaa && imagicaa.packages?.length > 0) {
    const pkg1 = imagicaa.packages[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 1. Confirmed Booking at Imagicaa (Upcoming Visit)
    const booking1 = await Booking.create({
      bookingReference: 'AM-20261026-IMAG01',
      user: demoCustomer._id,
      park: imagicaa._id,
      package: pkg1._id,
      packageSnapshot: {
        name: pkg1.name,
        pricePaise: pkg1.pricePaise,
        includesExpress: pkg1.includesExpress || false
      },
      visitDate: tomorrow,
      visitorQuantities: { adults: 2, children: 1, seniors: 0 },
      customerDetails: {
        name: demoCustomer.name,
        email: demoCustomer.email,
        phone: demoCustomer.phone
      },
      priceBreakdown: {
        subtotalPaise: 449700,
        basePassesPaise: 449700,
        addonsPaise: 0,
        discountPaise: 0,
        taxPaise: 80946,
        totalAmountPaise: 530646
      },
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'SUCCESS'
    });

    const payment1 = await Payment.create({
      orderId: 'order_imagicaa_seed_01',
      paymentId: 'pay_imagicaa_mock_01',
      booking: booking1._id,
      user: demoCustomer._id,
      amountPaise: 530646,
      currency: 'INR',
      status: 'SUCCESS',
      method: 'UPI',
      idempotencyKey: 'idemp_seed_01'
    });

    const ticket1 = await Ticket.create({
      ticketReference: 'TK-AM-20261026-IMAG01',
      booking: booking1._id,
      park: imagicaa._id,
      visitDate: booking1.visitDate,
      qrToken: 'qr_token_imagicaa_seed_01',
      totalAdmissions: 3,
      admissionsRedeemed: 0,
      isFullyRedeemed: false
    });

    booking1.paymentReference = payment1._id;
    booking1.ticketReference = ticket1._id;
    await booking1.save();

    // 2. Completed / Checked-In Booking at Imagicaa with 5-Star Verified Review
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 2);

    const booking2 = await Booking.create({
      bookingReference: 'AM-20261023-IMAG02',
      user: demoCustomer._id,
      park: imagicaa._id,
      package: pkg1._id,
      packageSnapshot: {
        name: pkg1.name,
        pricePaise: pkg1.pricePaise,
        includesExpress: true
      },
      visitDate: yesterday,
      visitorQuantities: { adults: 2, children: 0, seniors: 0 },
      customerDetails: {
        name: demoCustomer.name,
        email: demoCustomer.email,
        phone: demoCustomer.phone
      },
      priceBreakdown: {
        subtotalPaise: 399800,
        basePassesPaise: 399800,
        addonsPaise: 0,
        discountPaise: 0,
        taxPaise: 71964,
        totalAmountPaise: 471764
      },
      bookingStatus: 'CHECKED_IN',
      paymentStatus: 'SUCCESS'
    });

    const ticket2 = await Ticket.create({
      ticketReference: 'TK-AM-20261023-IMAG02',
      booking: booking2._id,
      park: imagicaa._id,
      visitDate: booking2.visitDate,
      qrToken: 'qr_token_imagicaa_seed_02',
      totalAdmissions: 2,
      admissionsRedeemed: 2,
      isFullyRedeemed: true,
      redemptionHistory: [{
        redeemedAt: yesterday,
        redeemedCount: 2,
        staffId: imagicaa.owner,
        gateNumber: 'Gate 01 - Main North Turnstile'
      }]
    });

    booking2.ticketReference = ticket2._id;
    await booking2.save();

    // Verified Reviews for Imagicaa
    await Review.create({
      park: imagicaa._id,
      user: demoCustomer._id,
      booking: booking2._id,
      rating: 5,
      comment: 'Incredible international-grade rollercoasters like Nitro and Deep Space! The optical QR turnstile gate scanning was instantaneous and hassle-free.',
      isVerifiedBooking: true,
      moderationStatus: 'APPROVED'
    });

    console.log('[Seed]: Created demo bookings, digital QR tickets, payments, and verified reviews.');
  }

  console.log('--- Database Seeding Completed Successfully! ---');
  await mongoose.disconnect();
}

// Allow direct CLI invocation: node src/scripts/seed.js
if (process.argv[1]?.includes('seed.js')) {
  seedDatabase().catch((err) => {
    console.error('[Seed Error]:', err);
    process.exit(1);
  });
}

export default seedDatabase;