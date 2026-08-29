-- ============================================================================
-- SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS SUPABASE
-- PROYECTO: beybladetorneo (Comunidad Beyblade Cúcuta)
-- ============================================================================
-- INSTRUCCIONES:
-- 1. Ve a tu panel de Supabase: https://supabase.com/dashboard/project/xpvecyvaoldgqkgflczn
-- 2. En el menú izquierdo, haz clic en "SQL Editor"
-- 3. Crea una nueva consulta (New Query)
-- 4. Pega todo este código y presiona "RUN"
-- ============================================================================

-- 1. TABLA DE CONFIGURACIÓN DE COMUNIDAD (Multi-Comunidad)
CREATE TABLE IF NOT EXISTS community_config (
  id TEXT PRIMARY KEY DEFAULT 'main_config',
  league_name TEXT NOT NULL,
  community_tagline TEXT,
  community_city TEXT,
  organizer_name TEXT,
  tournament_name TEXT,
  season TEXT,
  logo_url TEXT, -- Almacena imágenes en formato Base64 o URL directa de Supabase Storage
  type TEXT DEFAULT 'elimination',
  battle_scale TEXT DEFAULT '3v3',
  victory_conditions JSONB,
  max_participants INTEGER DEFAULT 32,
  arena_status TEXT DEFAULT 'Xtreme Stadium A',
  is_started BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA DE BLADERS (Padrón de Jugadores con Avatar / Foto)
CREATE TABLE IF NOT EXISTS bladers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  alias TEXT,
  team TEXT,
  avatar_url TEXT, -- Almacena avatar en Base64 o URL
  verified BOOLEAN DEFAULT FALSE,
  combos JSONB DEFAULT '[]'::jsonb,
  badges JSONB DEFAULT '[]'::jsonb,
  stats JSONB DEFAULT '{"matchesPlayed":0,"wins":0,"losses":0,"pointsScored":0,"xtremeFinishes":0,"burstFinishes":0,"overFinishes":0,"spinFinishes":0}'::jsonb,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA DE PIEZAS (Blades, Ratchets, Bits con Foto)
CREATE TABLE IF NOT EXISTS parts (
  name TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  category TEXT,
  weight TEXT,
  description TEXT,
  image TEXT, -- Imagen del componente
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA DE COMBOS
CREATE TABLE IF NOT EXISTS combos (
  id TEXT PRIMARY KEY,
  blader_id TEXT,
  blader_name TEXT NOT NULL,
  blade TEXT NOT NULL,
  ratchet TEXT NOT NULL,
  bit TEXT NOT NULL,
  type TEXT NOT NULL,
  weight TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA DE HISTORIAL DE TORNEOS
CREATE TABLE IF NOT EXISTS tournament_history (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  season TEXT,
  type TEXT NOT NULL,
  format TEXT NOT NULL,
  winner_name TEXT NOT NULL,
  runner_up_name TEXT,
  third_place_name TEXT,
  total_matches INTEGER DEFAULT 0,
  total_bladers INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  winner_avatar TEXT,
  matches_summary JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA DE PARTIDAS EN VIVO
CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  round_number INTEGER,
  round_name TEXT,
  match_number INTEGER,
  blader_a JSONB,
  blader_b JSONB,
  score_a INTEGER DEFAULT 0,
  score_b INTEGER DEFAULT 0,
  target_score INTEGER DEFAULT 4,
  status TEXT DEFAULT 'upcoming',
  winner_id TEXT,
  winner_name TEXT,
  corner_a TEXT DEFAULT 'Red',
  corner_b TEXT DEFAULT 'Blue',
  events JSONB DEFAULT '[]'::jsonb,
  is_casual BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. DESACTIVAR RLS Y OTORGAR PERMISOS PÚBLICOS
ALTER TABLE community_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE bladers DISABLE ROW LEVEL SECURITY;
ALTER TABLE parts DISABLE ROW LEVEL SECURITY;
ALTER TABLE combos DISABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE community_config TO anon, authenticated, service_role;
GRANT ALL ON TABLE bladers TO anon, authenticated, service_role;
GRANT ALL ON TABLE parts TO anon, authenticated, service_role;
GRANT ALL ON TABLE combos TO anon, authenticated, service_role;
GRANT ALL ON TABLE tournament_history TO anon, authenticated, service_role;
GRANT ALL ON TABLE matches TO anon, authenticated, service_role;
