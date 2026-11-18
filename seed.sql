-- Movie Bash SQLite Seed Data
PRAGMA foreign_keys = OFF;

-- 1. Branches
INSERT OR IGNORE INTO branches (id, name, slug, address, phone, map_url, image_url, is_active) VALUES
(1, 'Movie Bash – Electronic City', 'electronic-city', 'MovieBash, 4th Floor, Srinivasam, Nagananthapura Main Road, Beside Sri Vishnu Grand, Electronic City Post, Bengaluru 560100', '+91 99029 23656', 'https://maps.google.com/?q=Movie+Bash+Electronic+City', '/images/ambience_1.webp', 1),
(2, 'Movie Bash – BTM 2nd Stage', 'btm-stage-2', 'MovieBash, 2nd Floor, 16th Main Road, Near Udupi Garden Signal, BTM 2nd Stage, Bengaluru 560076', '+91 99029 23656', 'https://maps.google.com/?q=BTM+2nd+Stage+Bengaluru', '/images/celebration_1.webp', 1);

-- 2. Theatres (Electronic City)
INSERT OR IGNORE INTO theatres (id, branch_id, name, slug, emoji, capacity, base_price, extra_person_price, amenities, image_url, is_active) VALUES
(1, 1, 'Couple Theater', 'couple-theater-ecity', '🎬', 2, 899.00, 150.00, 'Ultra HD 4K Projection, Recliner Sofas, Dolby Atmos Sound, Private Climate Control, Netflix/Prime/Hotstar Ready', '/images/couple_1.webp', 1),
(2, 1, 'Celebration Theater', 'celebration-theater-ecity', '🎉', 6, 1499.00, 150.00, '135-inch Cinema Screen, JBL Pro Sound, Party Ambient Lighting, Fog Entry Compatible, Balloon Setup Space', '/images/celebration_2.webp', 1),
(3, 1, 'Family Theater', 'family-theater-ecity', '👨‍👩‍👧‍👦', 12, 1699.00, 150.00, 'Giant 150-inch Screen, Multi-tier Luxury Seating, Karaoke Microphones, Spacious Cake Cutting Stage', '/images/celebration_1.webp', 1),

-- Theatres (BTM 2nd Stage)
(4, 2, 'Butterfly Blush', 'butterfly-blush-btm', '🦋', 2, 899.00, 150.00, 'Signature Blush Glow, 4K Laser Projection, Dolby Atmos Surround, Luxury Recliner Loungers, Private Climate Control, OTT Ready', '/images/rooms/btm-butterfly-blush.webp', 1),
(5, 2, 'Lavender Mist', 'lavender-mist-btm', '🪻', 6, 1499.00, 150.00, 'Aesthetic Lavender Hues, 135-inch Cinema Display, High-Fidelity Audio, Fog Entry Compatible, Ambient LED Setup', '/images/rooms/btm-lavender-mist.webp', 1),
(6, 2, 'Scarlet Red', 'scarlet-red-btm', '🌹', 12, 1699.00, 150.00, 'Passionate Scarlet Theme, 150-inch 4K Cinema Screen, Recliners + Loungers, Private Dining Table, Cake Cutting Stage', '/images/rooms/btm-scarlet-red.webp', 1),
(7, 2, 'Shadow Suit', 'shadow-suit-btm', '🎬', 8, 1599.00, 150.00, 'Stealth Cinema Suite, Deep Contrast Acoustic Acoustic Walls, 140-inch Laser 4K Screen, VIP Recliner Suite, Dolby Audio', '/images/rooms/btm-shadow-suit.webp', 1);

-- 3. Time Slots
INSERT OR IGNORE INTO time_slots (theatre_id, start_time, end_time, crosses_midnight, price_override, weekend_price, is_active, sort_order) VALUES
-- Electronic City - Couple Theater (ID: 1)
(1, '10:00 AM', '12:00 PM', 0, NULL, NULL, 1, 1),
(1, '12:15 PM', '02:15 PM', 0, NULL, NULL, 1, 2),
(1, '02:30 PM', '04:30 PM', 0, NULL, NULL, 1, 3),
(1, '05:00 PM', '06:00 PM', 0, NULL, NULL, 1, 4),
(1, '06:30 PM', '08:30 PM', 0, NULL, NULL, 1, 5),
(1, '08:45 PM', '10:45 PM', 0, NULL, NULL, 1, 6),
(1, '11:00 PM', '01:00 AM', 1, NULL, NULL, 1, 7),

-- Electronic City - Celebration Theater (ID: 2)
(2, '09:30 AM', '11:30 AM', 0, NULL, NULL, 1, 1),
(2, '12:00 PM', '02:00 PM', 0, NULL, NULL, 1, 2),
(2, '02:30 PM', '04:30 PM', 0, NULL, NULL, 1, 3),
(2, '04:45 PM', '06:45 PM', 0, NULL, NULL, 1, 4),
(2, '07:00 PM', '09:00 PM', 0, NULL, NULL, 1, 5),
(2, '09:15 PM', '11:15 PM', 0, NULL, NULL, 1, 6),
(2, '11:30 PM', '01:00 AM', 1, NULL, NULL, 1, 7),

-- Electronic City - Family Theater (ID: 3)
(3, '10:00 AM', '12:00 PM', 0, NULL, NULL, 1, 1),
(3, '12:30 PM', '02:30 PM', 0, NULL, NULL, 1, 2),
(3, '03:00 PM', '05:00 PM', 0, NULL, NULL, 1, 3),
(3, '06:00 PM', '08:00 PM', 0, NULL, NULL, 1, 4),
(3, '08:30 PM', '10:30 PM', 0, NULL, NULL, 1, 5),
(3, '10:45 PM', '12:45 AM', 1, NULL, NULL, 1, 6),

-- BTM 2nd Stage - Butterfly Blush (ID: 4)
(4, '10:00 AM', '12:00 PM', 0, NULL, NULL, 1, 1),
(4, '12:30 PM', '02:30 PM', 0, NULL, NULL, 1, 2),
(4, '03:00 PM', '05:00 PM', 0, NULL, NULL, 1, 3),
(4, '05:30 PM', '07:30 PM', 0, NULL, NULL, 1, 4),
(4, '08:00 PM', '10:00 PM', 0, NULL, NULL, 1, 5),
(4, '11:00 PM', '01:00 AM', 1, NULL, NULL, 1, 6),

-- BTM 2nd Stage - Lavender Mist (ID: 5)
(5, '10:30 AM', '12:30 PM', 0, NULL, NULL, 1, 1),
(5, '01:00 PM', '03:00 PM', 0, NULL, NULL, 1, 2),
(5, '03:30 PM', '05:30 PM', 0, NULL, NULL, 1, 3),
(5, '06:00 PM', '08:00 PM', 0, NULL, NULL, 1, 4),
(5, '08:30 PM', '10:30 PM', 0, NULL, NULL, 1, 5),
(5, '11:00 PM', '01:00 AM', 1, NULL, NULL, 1, 6),

-- BTM 2nd Stage - Scarlet Red (ID: 6)
(6, '10:30 AM', '12:30 PM', 0, NULL, NULL, 1, 1),
(6, '01:00 PM', '03:00 PM', 0, NULL, NULL, 1, 2),
(6, '03:30 PM', '05:30 PM', 0, NULL, NULL, 1, 3),
(6, '06:00 PM', '08:00 PM', 0, NULL, NULL, 1, 4),
(6, '08:30 PM', '10:30 PM', 0, NULL, NULL, 1, 5),
(6, '11:00 PM', '01:00 AM', 1, NULL, NULL, 1, 6),

-- BTM 2nd Stage - Shadow Suit (ID: 7)
(7, '10:00 AM', '12:00 PM', 0, NULL, NULL, 1, 1),
(7, '12:30 PM', '02:30 PM', 0, NULL, NULL, 1, 2),
(7, '03:00 PM', '05:00 PM', 0, NULL, NULL, 1, 3),
(7, '05:30 PM', '07:30 PM', 0, NULL, NULL, 1, 4),
(7, '08:00 PM', '10:00 PM', 0, NULL, NULL, 1, 5),
(7, '11:00 PM', '01:00 AM', 1, NULL, NULL, 1, 6);

-- 4. Occasions
INSERT OR IGNORE INTO occasions (id, name, slug, icon, description, image_url, is_active, sort_order) VALUES
(1, 'Anniversary', 'anniversary', 'Heart', 'Celebrate your love milestone with fairy lights, rose petals, and a romantic screening.', '/images/couple_3.webp', 1, 1),
(2, 'Birthday Party', 'birthday-party', 'Cake', 'Make their birthday unforgettable with grand balloon decor, music, and custom video wishes.', '/images/celebration_4.webp', 1, 2),
(3, 'Date & Proposal', 'date-and-proposal', 'Sparkles', 'The most romantic ambiance in Bangalore for dream proposals and private couple movie dates.', '/images/couple_4.webp', 1, 3),
(4, 'Bachelorette Party', 'bachelorette-party', 'Wine', 'Glamorous private night with your girl gang with fun karaoke, photo props, and favourite movies.', '/images/celebration_5.webp', 1, 4),
(5, 'Farewell', 'farewell', 'Award', 'Bid farewell to your friends or colleagues with memories playing big on the screen.', '/images/celebration_4.webp', 1, 5),
(6, 'Baby Shower', 'baby-shower', 'Baby', 'Joyous intimate celebration with pastel themed balloons and baby cart entry.', '/images/celebration_6.webp', 1, 6),
(7, 'Corporate Event', 'corporate-event', 'Briefcase', 'Team bonding, product launches, or private presentations with Dolby sound and big screens.', '/images/ambience_5.webp', 1, 7);

-- 5. Addons
INSERT OR IGNORE INTO addons (id, category, name, description, price, image_url, is_active, sort_order) VALUES
(1, 'Cakes', 'Fresh Cream Truffle Cake (0.5 Kg)', 'Rich Dutch chocolate truffle cake baked fresh with custom name writing.', 499.00, '/images/celebration_7.webp', 1, 1),
(2, 'Cakes', 'Red Velvet Heart Cake (0.5 Kg)', 'Luscious red velvet sponge layered with cream cheese frosting.', 549.00, '/images/celebration_8.webp', 1, 2),
(3, 'Entry', 'Grand Cinematic Fog / Dry Ice Entry', 'Step into a cloud of low-lying mystical smoke like movie stars.', 499.00, '/images/fog_entry_1.webp', 1, 3),
(4, 'Decor', 'Rose Petal Heart Pathway', 'Aisle adorned with 100+ fresh Dutch roses leading to your screen.', 399.00, '/images/couple_4.webp', 1, 4),
(5, 'Decor', 'LED Number / Letter Neon Display', 'Luminous marquee letters and numbers for anniversary years or names.', 299.00, '/images/celebration_3.webp', 1, 5),
(6, 'Photography', 'Professional 30-min Photo & Video Shoot', 'DSLR portrait shoot with professionally edited candid memories.', 799.00, '/images/celebration_5.webp', 1, 6),
(7, 'Food', 'Gourmet Cheese Burst Popcorn Bucket', 'Jumbo warm theater-style tub popped in pure butter.', 199.00, '/images/celebration_7.webp', 1, 7),
(8, 'Food', 'Loaded Nachos with Warm Cheese Dip', 'Crispy corn tortilla chips with Mexican salsa and cheddar drizzle.', 249.00, '/images/celebration_7.webp', 1, 8),
(9, 'Decor', 'Helium Floating Ceiling Balloons (25 Pcs)', 'Shimmering metallic balloons covering the private lounge ceiling.', 349.00, '/images/celebration_2.webp', 1, 9),
(10, 'Gifts', 'Surprise Gift Bouquet with Roses', 'Artisanal wrapped bouquet of 12 fresh long-stem roses.', 399.00, '/images/couple_3.webp', 1, 10),
(11, 'Entry', 'Cold Fire / Sparkler Pyro Entry (2 Shots)', 'Indoor safe pyrotechnic spark fountains for dramatic cake cutting.', 399.00, '/images/celebration_6.webp', 1, 11);

-- 6. Coupons
INSERT OR IGNORE INTO coupons (id, code, discount_type, discount_value, min_booking_amount, valid_from, valid_until, usage_limit, used_count, branch_id, is_active) VALUES
(1, 'FIRSTBASH', 'flat', 150.00, 1000.00, '2026-01-01', '2026-12-31', 500, 24, NULL, 1),
(2, 'CELEBRATE20', 'percentage', 10.00, 1500.00, '2026-01-01', '2026-12-31', 200, 15, NULL, 1);

PRAGMA foreign_keys = ON;
