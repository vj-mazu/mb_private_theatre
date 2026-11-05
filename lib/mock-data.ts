export interface Branch {
  id: number;
  name: string;
  slug: string;
  address: string;
  phone: string;
  map_url: string;
  image_url: string;
  is_active: number;
}

export interface Theatre {
  id: number;
  branch_id: number;
  name: string;
  slug: string;
  emoji: string;
  capacity: number;
  base_price: number;
  extra_person_price: number;
  amenities: string;
  image_url: string;
  is_active: number;
}

export interface TimeSlot {
  id: number;
  theatre_id: number;
  start_time: string;
  end_time: string;
  crosses_midnight: number;
  is_active: number;
  sort_order: number;
}

export interface Occasion {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  image_url: string;
  is_active: number;
  sort_order: number;
}

export interface Addon {
  id: number;
  category: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_active: number;
}

export interface MockStore {
  branches: Branch[];
  theatres: Theatre[];
  timeSlots: TimeSlot[];
  occasions: Occasion[];
  addons: Addon[];
  bookings: any[];
  customers: any[];
  adminUsers: any[];
  coupons: any[];
  faqs: any[];
  testimonials: any[];
  siteSettings: Record<string, any>;
  auditLogs: any[];
  enquiries: any[];
  subscribers: any[];
  [key: string]: any;
}

export const initialMockStore: MockStore = {
  branches: [
    {
      id: 1,
      name: 'Movie Bash – Electronic City',
      slug: 'electronic-city',
      address: 'MovieBash, 4th Floor, Srinivasam, Nagananthapura Main Road, Beside Sri Vishnu Grand, Electronic City Post, Bengaluru 560100',
      phone: '+91 99029 23656',
      map_url: 'https://maps.google.com/?q=Movie+Bash+Electronic+City',
      image_url: '/images/couple_1.webp',
      is_active: 1
    },
    {
      id: 2,
      name: 'Movie Bash – BTM 2nd Stage',
      slug: 'btm-stage-2',
      address: 'MovieBash, 2nd Floor, 16th Main Road, Near Udupi Garden Signal, BTM 2nd Stage, Bengaluru 560076 (Owner editable)',
      phone: '+91 99029 23656',
      map_url: 'https://maps.google.com/?q=BTM+2nd+Stage+Bengaluru',
      image_url: '/images/celebration_1.webp',
      is_active: 1
    }
  ],
  theatres: [
    {
      id: 1,
      branch_id: 1,
      name: 'Couple Theater',
      slug: 'couple-theater-ecity',
      emoji: '🎬',
      capacity: 2,
      base_price: 899.00,
      extra_person_price: 150.00,
      amenities: 'Ultra HD 4K Projection, Recliner Sofas, Dolby Atmos Sound, Private Climate Control, OTT Ready',
      image_url: '/images/couple_1.webp',
      is_active: 1
    },
    {
      id: 2,
      branch_id: 1,
      name: 'Celebration Theater',
      slug: 'celebration-theater-ecity',
      emoji: '🎉',
      capacity: 6,
      base_price: 1499.00,
      extra_person_price: 150.00,
      amenities: '135-inch Cinema Screen, JBL Pro Sound, Party Ambient Lighting, Fog Entry Compatible',
      image_url: '/images/celebration_2.webp',
      is_active: 1
    },
    {
      id: 3,
      branch_id: 1,
      name: 'Family Theater',
      slug: 'family-theater-ecity',
      emoji: '👨‍👩‍👧‍👦',
      capacity: 12,
      base_price: 1699.00,
      extra_person_price: 150.00,
      amenities: 'Giant 150-inch Screen, Multi-tier Luxury Seating, Karaoke Microphones, Cake Podium',
      image_url: '/images/ambience_2.webp',
      is_active: 1
    },
    {
      id: 4,
      branch_id: 2,
      name: 'Couple Theater',
      slug: 'couple-theater-btm',
      emoji: '🎬',
      capacity: 2,
      base_price: 899.00,
      extra_person_price: 150.00,
      amenities: 'Ultra HD 4K Projection, Recliner Sofas, Dolby Atmos Sound, Romantic Lighting, OTT Apps Logged-in',
      image_url: '/images/couple_2.webp',
      is_active: 1
    },
    {
      id: 5,
      branch_id: 2,
      name: 'Celebration Theater',
      slug: 'celebration-theater-btm',
      emoji: '🎉',
      capacity: 6,
      base_price: 1499.00,
      extra_person_price: 150.00,
      amenities: '135-inch Screen, JBL High Fidelity Audio, Party Strobe & Glow Lighting, Stage Backdrop',
      image_url: '/images/celebration_3.webp',
      is_active: 1
    },
    {
      id: 6,
      branch_id: 2,
      name: 'Family Theater',
      slug: 'family-theater-btm',
      emoji: '👨‍👩‍👧‍👦',
      capacity: 12,
      base_price: 1699.00,
      extra_person_price: 150.00,
      amenities: '150-inch Curved Screen, Recliners + Loungers, Private Dining Table, Cake Podium',
      image_url: '/images/ambience_3.webp',
      is_active: 1
    },
    {
      id: 7,
      branch_id: 2,
      name: 'VIP Celebration Suite',
      slug: 'vip-celebration-suite-btm',
      emoji: '✨',
      capacity: 8,
      base_price: 1599.00,
      extra_person_price: 150.00,
      amenities: '140-inch Laser 4K Screen, Luxury Recliner Suite, Dolby Audio, Private Party Dining, Fog Entry Ready',
      image_url: '/images/celebration_6.webp',
      is_active: 1
    }
  ],
  timeSlots: [
    // --- Electronic City (Branch 1) ---
    // 🎬 Couple Theater (theatre_id: 1) - 7 Slots Exactly as specified
    { id: 1, theatre_id: 1, start_time: '10:00 AM', end_time: '12:00 PM', crosses_midnight: 0, is_active: 1, sort_order: 1 },
    { id: 2, theatre_id: 1, start_time: '12:15 PM', end_time: '02:15 PM', crosses_midnight: 0, is_active: 1, sort_order: 2 },
    { id: 3, theatre_id: 1, start_time: '02:30 PM', end_time: '04:30 PM', crosses_midnight: 0, is_active: 1, sort_order: 3 },
    { id: 4, theatre_id: 1, start_time: '05:00 PM', end_time: '06:00 PM', crosses_midnight: 0, is_active: 1, sort_order: 4 },
    { id: 5, theatre_id: 1, start_time: '06:30 PM', end_time: '08:30 PM', crosses_midnight: 0, is_active: 1, sort_order: 5 },
    { id: 6, theatre_id: 1, start_time: '08:45 PM', end_time: '10:45 PM', crosses_midnight: 0, is_active: 1, sort_order: 6 },
    { id: 7, theatre_id: 1, start_time: '11:00 PM', end_time: '01:00 AM', crosses_midnight: 1, is_active: 1, sort_order: 7 },

    // 🎉 Celebration Theater (theatre_id: 2) - 7 Slots Exactly as specified
    { id: 8, theatre_id: 2, start_time: '09:30 AM', end_time: '11:30 AM', crosses_midnight: 0, is_active: 1, sort_order: 1 },
    { id: 9, theatre_id: 2, start_time: '12:00 PM', end_time: '02:00 PM', crosses_midnight: 0, is_active: 1, sort_order: 2 },
    { id: 10, theatre_id: 2, start_time: '02:30 PM', end_time: '04:30 PM', crosses_midnight: 0, is_active: 1, sort_order: 3 },
    { id: 11, theatre_id: 2, start_time: '04:45 PM', end_time: '06:45 PM', crosses_midnight: 0, is_active: 1, sort_order: 4 },
    { id: 12, theatre_id: 2, start_time: '07:00 PM', end_time: '09:00 PM', crosses_midnight: 0, is_active: 1, sort_order: 5 },
    { id: 13, theatre_id: 2, start_time: '09:15 PM', end_time: '11:15 PM', crosses_midnight: 0, is_active: 1, sort_order: 6 },
    { id: 14, theatre_id: 2, start_time: '11:30 PM', end_time: '01:00 AM', crosses_midnight: 1, is_active: 1, sort_order: 7 },

    // 👨‍👩‍👧‍👦 Family Theater (theatre_id: 3) - 6 Slots Exactly as specified
    { id: 15, theatre_id: 3, start_time: '10:00 AM', end_time: '12:00 PM', crosses_midnight: 0, is_active: 1, sort_order: 1 },
    { id: 16, theatre_id: 3, start_time: '12:30 PM', end_time: '02:30 PM', crosses_midnight: 0, is_active: 1, sort_order: 2 },
    { id: 17, theatre_id: 3, start_time: '03:00 PM', end_time: '05:00 PM', crosses_midnight: 0, is_active: 1, sort_order: 3 },
    { id: 18, theatre_id: 3, start_time: '06:00 PM', end_time: '08:00 PM', crosses_midnight: 0, is_active: 1, sort_order: 4 },
    { id: 19, theatre_id: 3, start_time: '08:30 PM', end_time: '10:30 PM', crosses_midnight: 0, is_active: 1, sort_order: 5 },
    { id: 20, theatre_id: 3, start_time: '10:45 PM', end_time: '12:45 AM', crosses_midnight: 1, is_active: 1, sort_order: 6 },

    // --- BTM 2nd Stage (Branch 2) ---
    // 🎬 Couple Theater (theatre_id: 4)
    { id: 21, theatre_id: 4, start_time: '10:00 AM', end_time: '12:00 PM', crosses_midnight: 0, is_active: 1, sort_order: 1 },
    { id: 22, theatre_id: 4, start_time: '12:15 PM', end_time: '02:15 PM', crosses_midnight: 0, is_active: 1, sort_order: 2 },
    { id: 23, theatre_id: 4, start_time: '02:30 PM', end_time: '04:30 PM', crosses_midnight: 0, is_active: 1, sort_order: 3 },
    { id: 24, theatre_id: 4, start_time: '05:00 PM', end_time: '06:00 PM', crosses_midnight: 0, is_active: 1, sort_order: 4 },
    { id: 25, theatre_id: 4, start_time: '06:30 PM', end_time: '08:30 PM', crosses_midnight: 0, is_active: 1, sort_order: 5 },
    { id: 26, theatre_id: 4, start_time: '08:45 PM', end_time: '10:45 PM', crosses_midnight: 0, is_active: 1, sort_order: 6 },
    { id: 27, theatre_id: 4, start_time: '11:00 PM', end_time: '01:00 AM', crosses_midnight: 1, is_active: 1, sort_order: 7 },

    // 🎉 Celebration Theater (theatre_id: 5)
    { id: 28, theatre_id: 5, start_time: '09:30 AM', end_time: '11:30 AM', crosses_midnight: 0, is_active: 1, sort_order: 1 },
    { id: 29, theatre_id: 5, start_time: '12:00 PM', end_time: '02:00 PM', crosses_midnight: 0, is_active: 1, sort_order: 2 },
    { id: 30, theatre_id: 5, start_time: '02:30 PM', end_time: '04:30 PM', crosses_midnight: 0, is_active: 1, sort_order: 3 },
    { id: 31, theatre_id: 5, start_time: '04:45 PM', end_time: '06:45 PM', crosses_midnight: 0, is_active: 1, sort_order: 4 },
    { id: 32, theatre_id: 5, start_time: '07:00 PM', end_time: '09:00 PM', crosses_midnight: 0, is_active: 1, sort_order: 5 },
    { id: 33, theatre_id: 5, start_time: '09:15 PM', end_time: '11:15 PM', crosses_midnight: 0, is_active: 1, sort_order: 6 },
    { id: 34, theatre_id: 5, start_time: '11:30 PM', end_time: '01:00 AM', crosses_midnight: 1, is_active: 1, sort_order: 7 },

    // 👨‍👩‍👧‍👦 Family Theater (theatre_id: 6)
    { id: 35, theatre_id: 6, start_time: '10:00 AM', end_time: '12:00 PM', crosses_midnight: 0, is_active: 1, sort_order: 1 },
    { id: 36, theatre_id: 6, start_time: '12:30 PM', end_time: '02:30 PM', crosses_midnight: 0, is_active: 1, sort_order: 2 },
    { id: 37, theatre_id: 6, start_time: '03:00 PM', end_time: '05:00 PM', crosses_midnight: 0, is_active: 1, sort_order: 3 },
    { id: 38, theatre_id: 6, start_time: '06:00 PM', end_time: '08:00 PM', crosses_midnight: 0, is_active: 1, sort_order: 4 },
    { id: 39, theatre_id: 6, start_time: '08:30 PM', end_time: '10:30 PM', crosses_midnight: 0, is_active: 1, sort_order: 5 },
    { id: 40, theatre_id: 6, start_time: '10:45 PM', end_time: '12:45 AM', crosses_midnight: 1, is_active: 1, sort_order: 6 },

    // ✨ VIP Celebration Suite (theatre_id: 7) - 4th Theatre for BTM
    { id: 41, theatre_id: 7, start_time: '10:00 AM', end_time: '12:00 PM', crosses_midnight: 0, is_active: 1, sort_order: 1 },
    { id: 42, theatre_id: 7, start_time: '12:15 PM', end_time: '02:15 PM', crosses_midnight: 0, is_active: 1, sort_order: 2 },
    { id: 43, theatre_id: 7, start_time: '02:30 PM', end_time: '04:30 PM', crosses_midnight: 0, is_active: 1, sort_order: 3 },
    { id: 44, theatre_id: 7, start_time: '04:45 PM', end_time: '06:45 PM', crosses_midnight: 0, is_active: 1, sort_order: 4 },
    { id: 45, theatre_id: 7, start_time: '07:00 PM', end_time: '09:00 PM', crosses_midnight: 0, is_active: 1, sort_order: 5 },
    { id: 46, theatre_id: 7, start_time: '09:15 PM', end_time: '11:15 PM', crosses_midnight: 0, is_active: 1, sort_order: 6 },
    { id: 47, theatre_id: 7, start_time: '11:30 PM', end_time: '01:00 AM', crosses_midnight: 1, is_active: 1, sort_order: 7 }
  ],
  occasions: [
    { id: 1, name: 'Anniversary', slug: 'anniversary', icon: 'Heart', description: 'Celebrate your love milestone with fairy lights and rose petals.', image_url: '/images/couple_3.webp', is_active: 1, sort_order: 1 },
    { id: 2, name: 'Birthday Party', slug: 'birthday-party', icon: 'Cake', description: 'Make their birthday unforgettable with grand balloon decor.', image_url: '/images/celebration_4.webp', is_active: 1, sort_order: 2 },
    { id: 3, name: 'Date & Proposal', slug: 'date-and-proposal', icon: 'Sparkles', description: 'The most romantic ambiance in Bangalore for dream proposals.', image_url: '/images/couple_4.webp', is_active: 1, sort_order: 3 },
    { id: 4, name: 'Bachelorette Party', slug: 'bachelorette-party', icon: 'Wine', description: 'Glamorous private night with karaoke and fun photo props.', image_url: '/images/celebration_5.webp', is_active: 1, sort_order: 4 },
    { id: 5, name: 'Farewell', slug: 'farewell', icon: 'Award', description: 'Bid farewell to friends with cherished moments on screen.', image_url: '/images/ambience_4.webp', is_active: 1, sort_order: 5 },
    { id: 6, name: 'Baby Shower', slug: 'baby-shower', icon: 'Baby', description: 'Pastel balloons and fairy buggy entry for mothers-to-be.', image_url: '/images/celebration_6.webp', is_active: 1, sort_order: 6 },
    { id: 7, name: 'Corporate Event', slug: 'corporate-event', icon: 'Briefcase', description: 'Private presentations with Dolby sound and big screens.', image_url: '/images/ambience_5.webp', is_active: 1, sort_order: 7 }
  ],
  addons: [
    { id: 1, category: 'Cakes', name: 'Fresh Cream Truffle Cake (0.5 Kg)', description: 'Rich Dutch chocolate truffle cake baked fresh with custom name.', price: 499.00, image_url: '/images/celebration_7.webp', is_active: 1 },
    { id: 2, category: 'Cakes', name: 'Red Velvet Heart Cake (1 Kg)', description: 'Fluffy red velvet layered with premium cream cheese and topper.', price: 899.00, image_url: '/images/celebration_1.webp', is_active: 1 },
    { id: 3, category: 'Special Effects', name: 'Magical Fog Entry', description: 'Dense dramatic ground fog effect for an enchanting cinematic walk-in.', price: 499.00, image_url: '/images/ambience_6.webp', is_active: 1 },
    { id: 4, category: 'Special Effects', name: 'Cold Fire Pyro Sparklers (2 Pots)', description: 'Safe indoor pyrotechnic sparklers shooting golden fountains.', price: 399.00, image_url: '/images/ambience_7.webp', is_active: 1 },
    { id: 5, category: 'Decor', name: 'Neon LED Number / Name Light', description: 'Glowing LED name letters or milestone numbers on backdrop.', price: 299.00, image_url: '/images/ambience_8.webp', is_active: 1 },
    { id: 6, category: 'Decor', name: 'Premium Metallic Balloon Arch & Ribbons', description: 'Custom color theme balloon arches, metallic curtains, and ribbons.', price: 599.00, image_url: '/images/ambience_9.webp', is_active: 1 },
    { id: 7, category: 'Flowers', name: 'Fresh Red Rose Bouquet (15 Stems)', description: 'Hand-tied vibrant Dutch roses with personalized card.', price: 399.00, image_url: '/images/couple_5.webp', is_active: 1 },
    { id: 8, category: 'Photography', name: 'Professional Candid Photo & Reel Session', description: '1 Hour dedicated photographer shooting 25 photos & 1 reel.', price: 1199.00, image_url: '/images/ambience_10.webp', is_active: 1 },
    { id: 9, category: 'Entry', name: 'Romantic Rose Petal & Candle Aisle', description: 'Candle lanterns with fresh red rose petals walkway.', price: 499.00, image_url: '/images/couple_6.webp', is_active: 1 },
    { id: 10, category: 'Entry', name: 'Baby Cart / Fairy Carriage Entry', description: 'Specially decorated motorized fairy buggy for celebrations.', price: 699.00, image_url: '/images/celebration_2.webp', is_active: 1 },
    { id: 11, category: 'Snacks', name: 'Popcorn & Soft Drinks Combo (For 4)', description: 'Large tubs of buttery caramel popcorn with chilled drinks.', price: 349.00, image_url: '/images/ambience_11.webp', is_active: 1 }
  ],
  bookings: [
    {
      id: 1,
      booking_ref: 'MB-20261104-0001',
      customer_id: 1,
      branch_id: 1,
      theatre_id: 1,
      slot_id: 4,
      booking_date: new Date().toISOString().split('T')[0],
      customer_name: 'Rahul Sharma',
      customer_phone: '9876543210',
      customer_email: 'rahul.sharma@gmail.com',
      screen_name: 'Happy 1st Anniversary Rahul & Sneha',
      guests: 2,
      occasion_id: 1,
      subtotal: 899.00,
      addons_total: 898.00,
      discount: 200.00,
      total: 1597.00,
      advance_paid: 500.00,
      balance: 1097.00,
      status: 'confirmed' as 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show',
      payment_status: 'advance_paid' as 'unpaid' | 'advance_paid' | 'fully_paid' | 'refunded',
      source: 'web' as 'web' | 'phone' | 'walk_in',
      notes: 'Romantic red roses theme request',
      cancelled_reason: '',
      refund_amount: 0,
      is_deleted: 0,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      booking_ref: 'MB-20261104-0002',
      customer_id: 2,
      branch_id: 1,
      theatre_id: 2,
      slot_id: 9,
      booking_date: new Date().toISOString().split('T')[0],
      customer_name: 'Priya Nair',
      customer_phone: '9812345678',
      customer_email: 'priya.nair@outlook.com',
      screen_name: 'Happy 25th Birthday Priya',
      guests: 6,
      occasion_id: 2,
      subtotal: 1499.00,
      addons_total: 898.00,
      discount: 0.00,
      total: 2397.00,
      advance_paid: 500.00,
      balance: 1897.00,
      status: 'confirmed' as 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show',
      payment_status: 'advance_paid' as 'unpaid' | 'advance_paid' | 'fully_paid' | 'refunded',
      source: 'web' as 'web' | 'phone' | 'walk_in',
      notes: 'Need cold pyro during cake cutting',
      cancelled_reason: '',
      refund_amount: 0,
      is_deleted: 0,
      created_at: new Date().toISOString()
    },
    {
      id: 3,
      booking_ref: 'MB-20261105-0003',
      customer_id: 3,
      branch_id: 2,
      theatre_id: 4,
      slot_id: 20,
      booking_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      customer_name: 'Arjun Reddy',
      customer_phone: '9988776655',
      customer_email: 'arjun.reddy@gmail.com',
      screen_name: 'Movie Night with Ananya',
      guests: 2,
      occasion_id: 3,
      subtotal: 899.00,
      addons_total: 499.00,
      discount: 0.00,
      total: 1398.00,
      advance_paid: 1398.00,
      balance: 0.00,
      status: 'confirmed' as 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show',
      payment_status: 'fully_paid' as 'unpaid' | 'advance_paid' | 'fully_paid' | 'refunded',
      source: 'phone' as 'web' | 'phone' | 'walk_in',
      notes: 'Popcorn and beverages pre-arranged',
      cancelled_reason: '',
      refund_amount: 0,
      is_deleted: 0,
      created_at: new Date().toISOString()
    }
  ],
  customers: [
    { id: 1, name: 'Rahul Sharma', phone: '9876543210', email: 'rahul.sharma@gmail.com', total_bookings: 2, lifetime_spend: 2798.00, is_blocked: 0, created_at: '2026-01-10' },
    { id: 2, name: 'Priya Nair', phone: '9812345678', email: 'priya.nair@outlook.com', total_bookings: 1, lifetime_spend: 2398.00, is_blocked: 0, created_at: '2026-02-14' },
    { id: 3, name: 'Arjun Reddy', phone: '9988776655', email: 'arjun.reddy@gmail.com', total_bookings: 1, lifetime_spend: 1398.00, is_blocked: 0, created_at: '2026-03-01' }
  ],
  faqs: [
    { id: 1, question: 'How many screens do you have?', answer: 'Movie Bash consists of 3 screens per branch (Couple, Celebration, Family).', category: 'theatre' },
    { id: 2, question: 'What if we book and postpone the event date?', answer: 'Must be informed at least 72 hours before your scheduled time slot.', category: 'booking' },
    { id: 3, question: 'Is alcohol served / smoking permitted?', answer: 'No, strictly prohibited across all premises.', category: 'policies' },
    { id: 4, question: 'Age restrictions?', answer: '18 and above. Below 18 allowed with family members.', category: 'policies' },
    { id: 5, question: 'Is outside food allowed?', answer: 'Yes, outside food is allowed and you can also order via Swiggy/Zomato.', category: 'food' },
    { id: 6, question: 'Is 2-wheeler & 4-wheeler parking available?', answer: 'Yes, convenient parking is available at both branches.', category: 'amenities' },
    { id: 7, question: 'Can we bring pets?', answer: 'No pets are allowed inside the theatres.', category: 'policies' },
    { id: 8, question: 'What if a technical issue occurs during the event?', answer: 'Partial refund or rescheduling is provided as per terms and conditions.', category: 'policies' },
    { id: 9, question: 'What decorations do you have?', answer: 'Love, Birthday, Anniversary, Celebration themes etc., and custom as per customer requirements.', category: 'addons' },
    { id: 10, question: 'What add-ons do you have?', answer: 'Cake, snacks, food, fog entry, cold fire, special decoration, baby cart entry, car entry etc.', category: 'addons' },
    { id: 11, question: 'When can we book add-ons?', answer: 'While booking the room or anytime up to 24 hours before the event.', category: 'booking' }
  ],
  testimonials: [
    { id: 1, author_name: 'Kavin', occasion: 'Family Gathering', rating: 5.0, review_text: 'Great place to spend time with friends and family on a special day. Lovely decoration, cozy and neat, great service, easy to book and add on. Outside food is allowed and you can use your own OTT platforms.', avatar_url: '/images/couple_7.webp' },
    { id: 2, author_name: 'Shreya', occasion: 'Couple Celebration', rating: 5.0, review_text: 'One of the best places to celebrate. Booked the couple theatre for 4 members; the fog effect and everything was amazing.', avatar_url: '/images/couple_8.webp' },
    { id: 3, author_name: 'Mani', occasion: 'Birthday Surprise', rating: 5.0, review_text: "Good arrangements, great for surprising loved ones. Thanks for making my husband's birthday memorable.", avatar_url: '/images/celebration_3.webp' },
    { id: 4, author_name: 'Kumar', occasion: 'Anniversary', rating: 5.0, review_text: 'Amazing experience for our anniversary. Fog entry, cake, decoration and photo shoot were fabulous.', avatar_url: '/images/celebration_4.webp' }
  ],
  siteSettings: {
    announcement_text: '✨ Book your private celebration at Movie Bash Bengaluru! Flat ₹200 OFF with code MOVIEBASH200 ✨',
    announcement_enabled: 'true',
    business_phone: '+91 99029 23656',
    business_email: 'bookmoviebash@gmail.com',
    whatsapp_number: '+919902923656',
    google_reviews_count: '850+',
    google_rating: '4.9',
    bookings_completed_count: '12,500+',
    max_capacity_per_theatre: '20',
    branches_count: '2',
    advance_amount_flat: '500',
    advance_type: 'flat',
    cancellation_window_hours: '72',
    payment_gateway_enabled: 'false',
    instagram_followers_count: '24.5K',
    facebook_url: 'https://facebook.com/moviebashprivatetheatre',
    twitter_url: 'https://x.com/Moviebashblr',
    instagram_url: 'https://instagram.com/moviebash_privatetheatre',
    youtube_url: 'https://youtube.com/@MovieBashPrivateTheatre'
  },
  coupons: [
    { id: 1, code: 'MOVIEBASH200', discount_type: 'flat', discount_value: 200, min_booking_amount: 899, is_active: 1 },
    { id: 2, code: 'CELEBRATE10', discount_type: 'percentage', discount_value: 10, min_booking_amount: 1499, is_active: 1 }
  ],
  enquiries: [] as Array<any>,
  subscribers: [] as Array<any>,
  adminUsers: [
    {
      id: 1,
      name: 'Super Admin',
      email: 'admin@moviebash.in',
      password_hash: '$2a$12$L7R2Qo4mQYV8QZtY8uWfPeU38e3m0q1Q8V0V3x9i7Y6t3fX2U5vW2', // Admin@MovieBash2026!
      role: 'super_admin' as const,
      branch_id: null,
      is_active: 1,
      created_at: '2026-01-01'
    }
  ],
  auditLogs: [] as Array<any>
};
