// DEMO DATA: Promotional offers & valid coupons
export const OFFERS_DATA = [
  {
    id: 'off-monsoon-madness',
    code: 'ADVENTURE25',
    title: 'Weekday Explorer Special',
    tagline: 'Flat 25% Off on All Weekday Visits',
    description: 'Book for Monday through Thursday visits and unlock 25% instant discount on entry passes across all participating parks.',
    discountType: 'PERCENTAGE',
    discountValue: 25,
    minBookingAmountPaise: 150000,
    validUntil: '2026-11-30',
    applicableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    badge: 'Popular',
    terms: 'Valid on regular and combo packages. Cannot be combined with group pass offers.'
  },
  {
    id: 'off-group-fun',
    code: 'GROUP500',
    title: 'Squad & Gang Bundle',
    tagline: 'Flat ₹500 Off on 4+ Passes',
    description: 'Adventure is best shared! Grab your friends or family and get flat ₹500 cashback/discount when reserving 4 or more passes together.',
    discountType: 'FLAT_AMOUNT',
    discountValuePaise: 50000,
    minPassCount: 4,
    validUntil: '2026-12-31',
    applicableDays: ['All Days'],
    badge: 'Group Special',
    terms: 'Minimum 4 tickets in a single booking reference. Valid across theme and water parks.'
  },
  {
    id: 'off-student-rush',
    code: 'STUDENT20',
    title: 'Student Adrenaline Pass',
    tagline: '20% Off with Valid College/School ID',
    description: 'Blow off exam steam! College and school students enjoy 20% off upon presenting valid photo ID at park turnstiles.',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    minBookingAmountPaise: 100000,
    validUntil: '2026-12-15',
    applicableDays: ['All Days'],
    badge: 'Student Perk',
    terms: 'Physical student ID required at entry gate for each discounted visitor.'
  },
  {
    id: 'off-family-pass',
    code: 'FAMILYFUN',
    title: 'Family Feast Combo Pass',
    tagline: 'Save 15% + Free Lunch Vouchers',
    description: 'Ideal for 2 adults and up to 2 kids. Includes free food court meal coupons at partner parks.',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    minBookingAmountPaise: 300000,
    validUntil: '2026-11-15',
    applicableDays: ['Friday', 'Saturday', 'Sunday'],
    badge: 'Family Favorite',
    terms: 'Must include at least 1 child pass in the booking.'
  }
];
