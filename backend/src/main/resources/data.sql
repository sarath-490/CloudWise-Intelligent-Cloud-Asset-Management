INSERT INTO users (
  name,
  email,
  password,
  role,
  ai_classification_enabled,
  email_notifications_enabled,
  active,
  storage_limit_bytes,
  reset_token,
  reset_token_expires_at,
  created_at,
  updated_at
) VALUES (
  'Admin',
  'admin@cloudwise.local',
  '$2b$12$C5zmTIvYrZ9Ef1SwX8y3T.OCnYNZkf7i1U732gfJFsg5szKTGEbI6',
  'ADMIN',
  true,
  true,
  true,
  NULL,
  NULL,
  NULL,
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;
