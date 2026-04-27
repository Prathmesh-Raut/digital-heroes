insert into charities (
  id, slug, name, category, country, description, mission, image_url, spotlight, impact_blurb, tags, website_url
)
values
  (
    '11111111-1111-1111-1111-111111111111',
    'birdsong-youth-trust',
    'Birdsong Youth Trust',
    'Youth development',
    'United Kingdom',
    'Birdsong funds after-school creative labs, mentorship circles, and travel grants for young people in under-resourced communities.',
    'Open creative and educational opportunities for young people who have been historically under-served.',
    'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80',
    true,
    '1,420 workshop places funded in the last 12 months.',
    array['Youth','Education','Creativity'],
    'https://example.org/birdsong'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'fairway-food-network',
    'Fairway Food Network',
    'Food security',
    'United States',
    'A distributed food network connecting golfers, clubs, and local kitchens to families facing food insecurity.',
    'Turn recurring sports communities into reliable channels for practical food support.',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
    false,
    '86,000 meals distributed this quarter.',
    array['Community','Meals','Families'],
    'https://example.org/fairway-food'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'watershed-mental-health-fund',
    'Watershed Mental Health Fund',
    'Mental health',
    'Australia',
    'Watershed sponsors trauma-informed counselling, peer support, and crisis transport in rural communities.',
    'Make practical, immediate mental-health support reachable beyond major city centres.',
    'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?auto=format&fit=crop&w=1200&q=80',
    true,
    '3,200 counselling sessions delivered across regional programs.',
    array['Mental health','Rural','Support'],
    'https://example.org/watershed'
  );

insert into charity_events (charity_id, title, starts_at, location, summary)
values
  ('11111111-1111-1111-1111-111111111111', 'Summer Skills Day', '2026-06-21T10:00:00Z', 'Leeds', 'A creative workshop series with local mentors and visiting coaches.'),
  ('22222222-2222-2222-2222-222222222222', 'Nine Holes, Nine Kitchens', '2026-05-19T13:00:00Z', 'Austin', 'A charity golf day paired with mobile pantry collection points.'),
  ('33333333-3333-3333-3333-333333333333', 'Rural Wellbeing Open', '2026-07-10T09:00:00Z', 'Adelaide Hills', 'Peer-support activations, screenings, and fundraising on-course.');

insert into app_users (
  id, email, password_hash, full_name, role, country, selected_charity_id, charity_contribution_percent, avatar_url, created_at
)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'admin@digitalheroes.dev',
    '$2b$10$t3QBsA7sl0fTt4N1Gn9QauAkRz2t0fQ2MCV1jOXXAUPI0dR1vZl6m',
    'Avery Quinn',
    'admin',
    'United Kingdom',
    '11111111-1111-1111-1111-111111111111',
    15,
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    '2026-01-10T10:00:00Z'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'maya@digitalheroes.dev',
    '$2b$10$t3QBsA7sl0fTt4N1Gn9QauAkRz2t0fQ2MCV1jOXXAUPI0dR1vZl6m',
    'Maya Chen',
    'subscriber',
    'United States',
    '22222222-2222-2222-2222-222222222222',
    20,
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    '2026-02-03T08:00:00Z'
  );

insert into subscriptions (
  id, user_id, plan, status, amount_cents, currency_code, started_at, renews_at
)
values
  (
    '44444444-4444-4444-4444-444444444444',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'yearly',
    'active',
    29900,
    'USD',
    '2026-01-10T10:00:00Z',
    '2027-01-10T10:00:00Z'
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'yearly',
    'active',
    29900,
    'USD',
    '2026-02-03T08:00:00Z',
    '2027-02-03T08:00:00Z'
  );

insert into scores (user_id, stableford_score, played_at)
values
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 33, '2026-04-25'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 29, '2026-04-18'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 31, '2026-04-11'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 36, '2026-04-03'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 27, '2026-03-25');

insert into draws (
  id, month_key, label, mode, status, created_by_user_id, participant_count,
  jackpot_rollover_in_cents, jackpot_rollover_out_cents,
  prize_pool_tier3_cents, prize_pool_tier4_cents, prize_pool_tier5_cents, prize_pool_total_cents, published_at
)
values
  (
    '66666666-6666-6666-6666-666666666666',
    '2026-03-01',
    'March 2026',
    'weighted',
    'published',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    2,
    9200,
    0,
    6700,
    9400,
    20000,
    36100,
    '2026-03-31T12:00:00Z'
  );

insert into draw_numbers (draw_id, position, stableford_score)
values
  ('66666666-6666-6666-6666-666666666666', 1, 27),
  ('66666666-6666-6666-6666-666666666666', 2, 29),
  ('66666666-6666-6666-6666-666666666666', 3, 31),
  ('66666666-6666-6666-6666-666666666666', 4, 33),
  ('66666666-6666-6666-6666-666666666666', 5, 35);

insert into draw_entries (id, draw_id, user_id)
values
  ('77777777-7777-7777-7777-777777777777', '66666666-6666-6666-6666-666666666666', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');

insert into draw_entry_numbers (entry_id, position, stableford_score)
values
  ('77777777-7777-7777-7777-777777777777', 1, 27),
  ('77777777-7777-7777-7777-777777777777', 2, 29),
  ('77777777-7777-7777-7777-777777777777', 3, 31),
  ('77777777-7777-7777-7777-777777777777', 4, 33),
  ('77777777-7777-7777-7777-777777777777', 5, 36);

insert into winner_claims (
  draw_id, user_id, match_tier, amount_cents, verification_status, payout_status,
  proof_image_url, submitted_at, reviewed_at, reviewed_by_user_id, paid_at
)
values
  (
    '66666666-6666-6666-6666-666666666666',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    4,
    9400,
    'approved',
    'paid',
    'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80',
    '2026-04-01T10:00:00Z',
    '2026-04-02T10:00:00Z',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '2026-04-04T10:00:00Z'
  );

insert into payments (
  user_id, subscription_id, charity_id, kind, status, amount_cents, charity_amount_cents, currency_code, description, created_at
)
values
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '55555555-5555-5555-5555-555555555555',
    '22222222-2222-2222-2222-222222222222',
    'subscription',
    'succeeded',
    29900,
    5980,
    'USD',
    'yearly membership',
    '2026-02-03T08:00:00Z'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    null,
    '22222222-2222-2222-2222-222222222222',
    'charity',
    'succeeded',
    7500,
    7500,
    'USD',
    'Independent charity donation',
    '2026-04-08T10:00:00Z'
  );
