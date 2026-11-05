-- Movie Bash Seed Data
-- MySQL 8.0+

USE `movie_bash`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Branches
INSERT INTO `branches` (`id`, `name`, `slug`, `address`, `phone`, `map_url`, `image_url`, `is_active`) VALUES
(1, 'Movie Bash – Electronic City', 'electronic-city', 'MovieBash, 4th Floor, Srinivasam, Nagananthapura Main Road, Beside Sri Vishnu Grand, Electronic City Post, Bengaluru 560100', '+91 99029 23656', 'https://maps.google.com/?q=Movie+Bash+Electronic+City', '/images/ambience_1.webp', 1),
(2, 'Movie Bash – BTM 2nd Stage', 'btm-stage-2', 'MovieBash, 2nd Floor, 16th Main Road, Near Udupi Garden Signal, BTM 2nd Stage, Bengaluru 560076 (Placeholder - editable in admin)', '+91 99029 23656', 'https://maps.google.com/?q=BTM+2nd+Stage+Bengaluru', '/images/celebration_1.webp', 1)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 2. Theatres (Electronic City)
INSERT INTO `theatres` (`id`, `branch_id`, `name`, `slug`, `emoji`, `capacity`, `base_price`, `extra_person_price`, `amenities`, `image_url`, `is_active`) VALUES
(1, 1, 'Couple Theater', 'couple-theater-ecity', '🎬', 2, 899.00, 150.00, 'Ultra HD 4K Projection, Recliner Sofas, Dolby Atmos Sound, Private Climate Control, Netflix/Prime/Hotstar Ready', '/images/couple_1.webp', 1),
(2, 1, 'Celebration Theater', 'celebration-theater-ecity', '🎉', 6, 1499.00, 150.00, '135-inch Cinema Screen, JBL Pro Sound, Party Ambient Lighting, Fog Entry Compatible, Balloon Setup Space', '/images/celebration_2.webp', 1),
(3, 1, 'Family Theater', 'family-theater-ecity', '👨‍👩‍👧‍👦', 12, 1699.00, 150.00, 'Giant 150-inch Screen, Multi-tier Luxury Seating, Karaoke Microphones, Spacious Cake Cutting Stage', '/images/ambience_2.webp', 1),

-- Theatres (BTM 2nd Stage)
(4, 2, 'Couple Theater', 'couple-theater-btm', '🎬', 2, 899.00, 150.00, 'Ultra HD 4K Projection, Recliner Sofas, Dolby Atmos Sound, Romantic Lighting, OTT Apps Logged-in', '/images/couple_2.webp', 1),
(5, 2, 'Celebration Theater', 'celebration-theater-btm', '🎉', 6, 1499.00, 150.00, '135-inch Screen, JBL High Fidelity Audio, Party Strobe & Glow Lighting, Stage Backdrop', '/images/celebration_3.webp', 1),
(6, 2, 'Family Theater', 'family-theater-btm', '👨‍👩‍👧‍👦', 12, 1699.00, 150.00, '150-inch Curved Screen, Recliners + Loungers, Private Dining Table, Cake Podium', '/images/ambience_3.webp', 1),
(7, 2, 'VIP Celebration Suite', 'vip-celebration-suite-btm', '✨', 8, 1599.00, 150.00, '140-inch Laser 4K Screen, Luxury Recliner Suite, Dolby Audio, Private Party Dining, Fog Entry Ready', '/images/celebration_6.webp', 1)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 3. Time Slots
-- Electronic City - Couple Theater (ID: 1)
INSERT INTO `time_slots` (`theatre_id`, `start_time`, `end_time`, `crosses_midnight`, `price_override`, `weekend_price`, `is_active`, `sort_order`) VALUES
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

-- BTM 2nd Stage - Couple Theater (ID: 4)
(4, '10:00 AM', '12:00 PM', 0, NULL, NULL, 1, 1),
(4, '12:15 PM', '02:15 PM', 0, NULL, NULL, 1, 2),
(4, '02:30 PM', '04:30 PM', 0, NULL, NULL, 1, 3),
(4, '05:00 PM', '06:00 PM', 0, NULL, NULL, 1, 4),
(4, '06:30 PM', '08:30 PM', 0, NULL, NULL, 1, 5),
(4, '08:45 PM', '10:45 PM', 0, NULL, NULL, 1, 6),
(4, '11:00 PM', '01:00 AM', 1, NULL, NULL, 1, 7),

-- BTM 2nd Stage - Celebration Theater (ID: 5)
(5, '09:30 AM', '11:30 AM', 0, NULL, NULL, 1, 1),
(5, '12:00 PM', '02:00 PM', 0, NULL, NULL, 1, 2),
(5, '02:30 PM', '04:30 PM', 0, NULL, NULL, 1, 3),
(5, '04:45 PM', '06:45 PM', 0, NULL, NULL, 1, 4),
(5, '07:00 PM', '09:00 PM', 0, NULL, NULL, 1, 5),
(5, '09:15 PM', '11:15 PM', 0, NULL, NULL, 1, 6),
(5, '11:30 PM', '01:00 AM', 1, NULL, NULL, 1, 7),

-- BTM 2nd Stage - Family Theater (ID: 6)
(6, '10:00 AM', '12:00 PM', 0, NULL, NULL, 1, 1),
(6, '12:30 PM', '02:30 PM', 0, NULL, NULL, 1, 2),
(6, '03:00 PM', '05:00 PM', 0, NULL, NULL, 1, 3),
(6, '06:00 PM', '08:00 PM', 0, NULL, NULL, 1, 4),
(6, '08:30 PM', '10:30 PM', 0, NULL, NULL, 1, 5),
(6, '10:45 PM', '12:45 AM', 1, NULL, NULL, 1, 6),

-- BTM 2nd Stage - VIP Celebration Suite (ID: 7)
(7, '10:00 AM', '12:00 PM', 0, NULL, NULL, 1, 1),
(7, '12:15 PM', '02:15 PM', 0, NULL, NULL, 1, 2),
(7, '02:30 PM', '04:30 PM', 0, NULL, NULL, 1, 3),
(7, '04:45 PM', '06:45 PM', 0, NULL, NULL, 1, 4),
(7, '07:00 PM', '09:00 PM', 0, NULL, NULL, 1, 5),
(7, '09:15 PM', '11:15 PM', 0, NULL, NULL, 1, 6),
(7, '11:30 PM', '01:00 AM', 1, NULL, NULL, 1, 7);

-- 4. Occasions
INSERT INTO `occasions` (`id`, `name`, `slug`, `icon`, `description`, `image_url`, `is_active`, `sort_order`) VALUES
(1, 'Anniversary', 'anniversary', 'Heart', 'Celebrate your love milestone with fairy lights, rose petals, and a romantic screening.', '/images/couple_3.webp', 1, 1),
(2, 'Birthday Party', 'birthday-party', 'Cake', 'Make their birthday unforgettable with grand balloon decor, music, and custom video wishes.', '/images/celebration_4.webp', 1, 2),
(3, 'Date & Proposal', 'date-and-proposal', 'Sparkles', 'The most romantic ambiance in Bangalore for dream proposals and private couple movie dates.', '/images/couple_4.webp', 1, 3),
(4, 'Bachelorette Party', 'bachelorette-party', 'Wine', 'Glamorous private night with your girl gang with fun karaoke, photo props, and favourite movies.', '/images/celebration_5.webp', 1, 4),
(5, 'Farewell', 'farewell', 'Award', 'Bid farewell to your friends or colleagues with memories playing big on the screen.', '/images/ambience_4.webp', 1, 5),
(6, 'Baby Shower', 'baby-shower', 'Baby', 'Joyous intimate celebration with pastel themed balloons and baby cart entry.', '/images/celebration_6.webp', 1, 6),
(7, 'Corporate Event', 'corporate-event', 'Briefcase', 'Team bonding, product launches, or private presentations with Dolby sound and big screens.', '/images/ambience_5.webp', 1, 7)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 5. Addons
INSERT INTO `addons` (`id`, `category`, `name`, `description`, `price`, `image_url`, `is_active`, `sort_order`) VALUES
(1, 'Cakes', 'Fresh Cream Truffle Cake (0.5 Kg)', 'Rich Dutch chocolate truffle cake baked fresh with custom name writing.', 499.00, '/images/celebration_7.webp', 1, 1),
(2, 'Cakes', 'Red Velvet Heart Cake (1 Kg)', 'Fluffy red velvet layered with premium cream cheese and birthday topper.', 899.00, '/images/celebration_1.webp', 1, 2),
(3, 'Special Effects', 'Magical Fog Entry', 'Dense dramatic ground fog effect for an enchanting cinematic walk-in experience.', 499.00, '/images/ambience_6.webp', 1, 3),
(4, 'Special Effects', 'Cold Fire Pyro Sparklers (2 Pots)', 'Safe indoor pyrotechnic sparklers shooting golden fountains during cake cutting.', 399.00, '/images/ambience_7.webp', 1, 4),
(5, 'Decor', 'Neon LED Number / Name Light', 'Glowing LED name letters or milestone numbers (e.g. 25, 18, I LOVE U) on the backdrop.', 299.00, '/images/ambience_8.webp', 1, 5),
(6, 'Decor', 'Premium Metallic Balloon Arch & Ribbons', 'Custom color theme balloon arches, metallic curtains, and ribbon styling.', 599.00, '/images/ambience_9.webp', 1, 6),
(7, 'Flowers', 'Fresh Red Rose Bouquet (15 Stems)', 'Hand-tied vibrant Dutch roses with personalized greetings card.', 399.00, '/images/couple_5.webp', 1, 7),
(8, 'Photography', 'Professional Candid Photo & Reel Session', '1 Hour dedicated photographer shooting 25 edited high-res photos and 1 Instagram reel.', 1199.00, '/images/ambience_10.webp', 1, 8),
(9, 'Entry', 'Romantic Rose Petal & Candle Aisle', 'Illuminated candle lanterns with a carpet of fresh red rose petals from entrance to seat.', 499.00, '/images/couple_6.webp', 1, 9),
(10, 'Entry', 'Baby Cart / Fairy Carriage Entry', 'Specially decorated motorized fairy buggy for baby shower and kids birthdays.', 699.00, '/images/celebration_2.webp', 1, 10),
(11, 'Snacks', 'Popcorn & Soft Drinks Combo (For 4)', 'Large tubs of buttery caramel & salted popcorn with cold beverages.', 349.00, '/images/ambience_11.webp', 1, 11)
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 6. FAQs (Exact from brief)
INSERT INTO `faqs` (`id`, `question`, `answer`, `category`, `sort_order`, `is_active`) VALUES
(1, 'How many screens do you have?', 'Movie Bash consists of 3 screens per branch: Couple Theater (up to 2 guests), Celebration Theater (up to 6 guests), and Family Theater (up to 12-20 guests).', 'theatre', 1, 1),
(2, 'What if we book and postpone the event date?', 'Must be informed at least 72 hours before your scheduled time slot to reschedule with zero penalty fee.', 'booking', 2, 1),
(3, 'Is alcohol served / smoking permitted?', 'No, alcohol consumption and smoking are strictly prohibited across all Movie Bash premises.', 'policies', 3, 1),
(4, 'Age restrictions?', '18 and above. Guests below 18 years are warmly allowed when accompanied by family members.', 'policies', 4, 1),
(5, 'Is outside food allowed?', 'Yes, outside food and beverages are fully allowed! You are also free to order from Swiggy or Zomato to our address.', 'food', 5, 1),
(6, 'Is 2-wheeler & 4-wheeler parking available?', 'Yes, ample dedicated parking space for both two-wheelers and four-wheelers is available at both branches.', 'amenities', 6, 1),
(7, 'Can we bring pets?', 'No, pets are currently not permitted inside the private screening rooms to maintain allergen-free hygiene.', 'policies', 7, 1),
(8, 'What if a technical issue occurs during the event?', 'In the rare event of an unresolved technical disruption, a partial refund or priority free slot reschedule is provided as per our terms.', 'policies', 8, 1),
(9, 'What decorations do you have?', 'We provide Love, Birthday, Anniversary, Celebration themes, Neon lights, Balloon arches, and custom decors personalized to your preference.', 'addons', 9, 1),
(10, 'What add-ons do you have?', 'We offer Fresh Cakes, Snacks & Beverages, Magical Fog Entry, Cold Fire Pyro, Special Decor, Baby Cart Entry, Photography, and Floral Bouquets.', 'addons', 10, 1),
(11, 'When can we book add-ons?', 'You can book add-ons directly during room booking or anytime up to 24 hours before your event by contacting our support team.', 'booking', 11, 1)
ON DUPLICATE KEY UPDATE `question`=VALUES(`question`);

-- 7. Testimonials (Exact from brief)
INSERT INTO `testimonials` (`id`, `author_name`, `occasion`, `rating`, `review_text`, `avatar_url`, `is_active`, `sort_order`) VALUES
(1, 'Kavin', 'Family Gathering', 5.0, 'Great place to spend time with friends and family on a special day. Lovely decoration, cozy and neat, great service, easy to book and add on. Outside food is allowed and you can use your own OTT platforms.', '/images/couple_7.webp', 1, 1),
(2, 'Shreya', 'Couple Celebration', 5.0, 'One of the best places to celebrate. Booked the couple theatre for 4 members; the fog effect and everything was amazing.', '/images/couple_8.webp', 1, 2),
(3, 'Mani', 'Birthday Surprise', 5.0, 'Good arrangements, great for surprising loved ones. Thanks for making my husband\'s birthday memorable.', '/images/celebration_3.webp', 1, 3),
(4, 'Kumar', 'Wedding Anniversary', 5.0, 'Amazing experience for our anniversary. Fog entry, cake, decoration and photo shoot were fabulous.', '/images/celebration_4.webp', 1, 4)
ON DUPLICATE KEY UPDATE `author_name`=VALUES(`author_name`);

-- 8. Admin Users (Password: Admin@MovieBash2026!)
-- bcrypt hash for 'Admin@MovieBash2026!' is $2a$12$6BvN5Y4/p1.r1W2U1oT9yeBw1fFhA2q1e1Xq7.Z2lH1xV5aP/Y5rW (or bcryptjs standard)
INSERT INTO `admin_users` (`id`, `name`, `email`, `password_hash`, `role`, `branch_id`, `is_active`) VALUES
(1, 'Super Admin', 'admin@moviebash.in', '$2b$10$wN1d12l9/jXvI.WqZvxY7.rZ56xJ264v3i8d53K7J0d1E2f3g4h5i', 'super_admin', NULL, 1),
(2, 'Electronic City Manager', 'ecity@moviebash.in', '$2b$10$wN1d12l9/jXvI.WqZvxY7.rZ56xJ264v3i8d53K7J0d1E2f3g4h5i', 'branch_manager', 1, 1),
(3, 'BTM Manager', 'btm@moviebash.in', '$2b$10$wN1d12l9/jXvI.WqZvxY7.rZ56xJ264v3i8d53K7J0d1E2f3g4h5i', 'branch_manager', 2, 1)
ON DUPLICATE KEY UPDATE `email`=VALUES(`email`);

-- 9. Site Settings
INSERT INTO `site_settings` (`key_name`, `value_content`) VALUES
('announcement_text', '✨ Book your private celebration at Movie Bash Bengaluru! Flat ₹200 OFF with code MOVIEBASH200 ✨'),
('announcement_enabled', 'true'),
('business_phone', '+91 99029 23656'),
('business_email', 'bookmoviebash@gmail.com'),
('whatsapp_number', '+919902923656'),
('google_reviews_count', '850+'),
('google_rating', '4.9'),
('bookings_completed_count', '12,500+'),
('max_capacity_per_theatre', '20'),
('branches_count', '2'),
('advance_amount_flat', '500'),
('advance_type', 'flat'),
('cancellation_window_hours', '72'),
('payment_gateway_enabled', 'false'),
('instagram_followers_count', '24.5K'),
('facebook_url', 'https://facebook.com/moviebashprivatetheatre'),
('twitter_url', 'https://x.com/Moviebashblr'),
('instagram_url', 'https://instagram.com/moviebash_privatetheatre'),
('youtube_url', 'https://youtube.com/@MovieBashPrivateTheatre')
ON DUPLICATE KEY UPDATE `value_content`=VALUES(`value_content`);

-- 10. Coupons
INSERT INTO `coupons` (`id`, `code`, `discount_type`, `discount_value`, `min_booking_amount`, `valid_from`, `valid_until`, `usage_limit`, `used_count`, `branch_id`, `is_active`) VALUES
(1, 'MOVIEBASH200', 'flat', 200.00, 899.00, '2026-01-01', '2027-12-31', 500, 24, NULL, 1),
(2, 'CELEBRATE10', 'percentage', 10.00, 1499.00, '2026-01-01', '2027-12-31', 200, 15, NULL, 1)
ON DUPLICATE KEY UPDATE `code`=VALUES(`code`);

-- 11. Sample Customers
INSERT INTO `customers` (`id`, `name`, `phone`, `email`, `total_bookings`, `lifetime_spend`) VALUES
(1, 'Rahul Sharma', '9876543210', 'rahul.sharma@gmail.com', 2, 2798.00),
(2, 'Priya Nair', '9812345678', 'priya.nair@outlook.com', 1, 2398.00),
(3, 'Arjun Reddy', '9988776655', 'arjun.reddy@gmail.com', 1, 1499.00)
ON DUPLICATE KEY UPDATE `phone`=VALUES(`phone`);

-- 12. Sample Bookings (Providing rich dashboard analytics)
INSERT INTO `bookings` (`id`, `booking_ref`, `customer_id`, `branch_id`, `theatre_id`, `slot_id`, `booking_date`, `customer_name`, `customer_phone`, `customer_email`, `screen_name`, `guests`, `occasion_id`, `subtotal`, `addons_total`, `discount`, `total`, `advance_paid`, `balance`, `status`, `payment_status`, `source`, `notes`) VALUES
(1, 'MB-20261104-0001', 1, 1, 1, 4, CURRENT_DATE, 'Rahul Sharma', '9876543210', 'rahul.sharma@gmail.com', 'Happy 1st Anniversary Rahul & Sneha', 2, 1, 899.00, 898.00, 200.00, 1597.00, 500.00, 1097.00, 'confirmed', 'advance_paid', 'web', 'Romantic red roses theme request'),
(2, 'MB-20261104-0002', 2, 1, 2, 9, CURRENT_DATE, 'Priya Nair', '9812345678', 'priya.nair@outlook.com', 'Happy 25th Birthday Priya', 6, 2, 1499.00, 898.00, 0.00, 2397.00, 500.00, 1897.00, 'confirmed', 'advance_paid', 'web', 'Need cold pyro during cake cutting'),
(3, 'MB-20261105-0003', 3, 2, 4, 20, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY), 'Arjun Reddy', '9988776655', 'arjun.reddy@gmail.com', 'Movie Night with Ananya', 2, 3, 899.00, 499.00, 0.00, 1398.00, 1398.00, 0.00, 'confirmed', 'fully_paid', 'phone', 'Popcorn and beverages pre-arranged')
ON DUPLICATE KEY UPDATE `booking_ref`=VALUES(`booking_ref`);

-- 13. Gallery Images (using real WebP optimized images)
INSERT INTO `gallery_images` (`id`, `category`, `title`, `image_url`, `thumb_url`, `is_featured`, `sort_order`) VALUES
(1, 'Couple', 'Romantic Couple Suite Decor', '/images/couple_1.webp', '/images/couple_1_thumb.webp', 1, 1),
(2, 'Couple', 'Private Screening for Two', '/images/couple_2.webp', '/images/couple_2_thumb.webp', 1, 2),
(3, 'Celebration', 'Grand Birthday Balloon Decor', '/images/celebration_1.webp', '/images/celebration_1_thumb.webp', 1, 3),
(4, 'Celebration', 'Anniversary Neon Setup', '/images/celebration_2.webp', '/images/celebration_2_thumb.webp', 1, 4),
(5, 'Family', 'Luxury Family Theater Seating', '/images/ambience_1.webp', '/images/ambience_1_thumb.webp', 1, 5),
(6, 'Fog Entry', 'Cinematic Cloud Fog Walkway', '/images/ambience_6.webp', '/images/ambience_6_thumb.webp', 1, 6),
(7, 'Cakes', 'Celebration Cakes & Sweets', '/images/celebration_7.webp', '/images/celebration_7_thumb.webp', 1, 7),
(8, 'Decor', 'Heart Arch & Ambient Lanterns', '/images/ambience_9.webp', '/images/ambience_9_thumb.webp', 1, 8)
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- 14. Blog Categories & Sample Posts
INSERT INTO `blog_categories` (`id`, `name`, `slug`) VALUES
(1, 'Celebration Ideas', 'celebration-ideas'),
(2, 'Movie Nights', 'movie-nights'),
(3, 'Venues & Ambience', 'venues-ambience')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

INSERT INTO `blog_posts` (`id`, `category_id`, `title`, `slug`, `excerpt`, `content`, `cover_image`, `status`, `published_at`) VALUES
(1, 1, 'Top 5 Surprise Anniversary Ideas in Bengaluru', 'top-5-surprise-anniversary-ideas-bengaluru', 'Discover how booking a private cinema with magical fog entry and personalized videos creates an unforgettable anniversary.', '<p>Celebrating an anniversary in Bengaluru should be as unique as your love story. Instead of noisy public restaurants or crowded halls, private theatres like Movie Bash offer a secluded, personalized sanctuary.</p><h3>1. Private Screen, Endless Memories</h3><p>Relive your wedding video, montage of trips, or your favorite romantic film in 4K resolution on a 135-inch screen.</p><h3>2. Magical Fog Entry & Candles</h3><p>Walk hand-in-hand through dense dramatic cloud fog with candlelit aisles and glowing neon letters.</p>', '/images/couple_3.webp', 'published', NOW()),
(2, 2, 'Why Private Theatres are the Best Place for Birthday Celebrations', 'why-private-theatres-best-birthday-celebration', 'From zero crowd hassle to playing your own OTT watchlist, here is why Bengaluru is falling in love with private screenings.', '<p>Birthdays are meant to be enjoyed with the people who matter most. At Movie Bash, you get the entire theater exclusively for your circle. Bring your own food, sing karaoke, and celebrate without time pressure or interruptions.</p>', '/images/celebration_4.webp', 'published', NOW())
ON DUPLICATE KEY UPDATE `slug`=VALUES(`slug`);

SET FOREIGN_KEY_CHECKS = 1;
