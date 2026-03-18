const db = require('./db');
async function setup() {
  await db.query("CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT DEFAULT 'owner', created_at TIMESTAMPTZ DEFAULT NOW())");
  await db.query("CREATE TABLE IF NOT EXISTS properties (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, address TEXT, type TEXT, beds INTEGER DEFAULT 1, status TEXT DEFAULT 'active', emoji TEXT, notes TEXT, tags TEXT DEFAULT '[]', spent TEXT DEFAULT '$0', service_count INTEGER DEFAULT 0, user_id UUID REFERENCES users(id) ON DELETE CASCADE, created_at TIMESTAMPTZ DEFAULT NOW())");
  await db.query("CREATE TABLE IF NOT EXISTS bookings (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), service TEXT NOT NULL, provider TEXT, property TEXT, date TEXT NOT NULL, time TEXT, notes TEXT, status TEXT DEFAULT 'pending', user_id UUID REFERENCES users(id) ON DELETE CASCADE, created_at TIMESTAMPTZ DEFAULT NOW())");
  await db.query("CREATE TABLE IF NOT EXISTS contacts (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL, type TEXT, phone TEXT NOT NULL, website TEXT, emoji TEXT DEFAULT '🔧', rating FLOAT DEFAULT 5.0, user_id UUID REFERENCES users(id) ON DELETE CASCADE, created_at TIMESTAMPTZ DEFAULT NOW())");
  console.log('Tables ready');
  process.exit(0);
}
setup().catch(e => { console.error(e); process.exit(1); });