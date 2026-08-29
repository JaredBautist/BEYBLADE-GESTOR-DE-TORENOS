<div align="center">

# ⚡ BEYBLADE X TOURNAMENT MANAGER ⚡
### Plataforma SaaS Oficial de Gestión de Torneos, Brackets, Decks 3on3 y Armería de Combos
**Comunidad Beyblade X Cúcuta**

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

---

<p align="center">
  <b>Sistema integral de nivel competitivo profesional diseñado para organizar torneos oficiales de Beyblade X con reglamentos oficiales WBO y Takara Tomy.</b>
</p>

</div>

---

## 🌪️ Características Principales

### 🎮 **Battle Console en Tiempo Real**
* **Marcador Oficial WBO:** Puntuación reglamentaria con botones oficiales de finalización:
  * 💥 **Xtreme Dash / Xtreme Finish:** 3 Puntos
  * 💣 **Burst Finish:** 2 Puntos
  * 🌀 **Over Finish:** 2 Puntos
  * 🔄 **Spin Finish:** 1 Punto
* **Cronómetro y Registro de Eventos:** Historial segundo a segundo de cada round disputado.
* **Audio FX Inmersivo:** Efectos sonoros integrados (cuenta regresiva *"3, 2, 1... Go Shoot!"*, impactos de metal, *Xtreme Dash*, victoria y ovaciones).

### 🌳 **Generador Dinámico de Brackets (Árbol Eliminatorio)**
* Generación instantánea de cuadros de **Eliminación Directa** (Single Elimination) y **Doble Eliminación** escalables (4, 8, 16, 32 participantes).
* Avance automatizado de ganadores con propagación fluida entre rondas (Cuartos, Semifinales, Final y Tercer Lugar).
* Detección y coronación del campeón con **podio interactivo y lluvia de confeti**.

### 👥 **Padrón de Bladers & Decks 3on3**
* Registro de jugadores con foto de perfil (subida directa con compresión inteligente en el navegador).
* Configuración de **Decks de Combate 3on3** (Slot 1, Slot 2 y Slot 3) por Blader.
* **Insignias de Honor Oficiales:** Asignación dinámica de medallas y condecoraciones de la comunidad (*X-Champion, Burst Master, Leyenda Local, Juez Oficial, etc.*).
* Estadísticas automáticas por jugador (Partidas jugadas, Victorias, Derrotas, Puntos anotados, Tipos de Finishes).

### ⚔️ **Equipamiento X & Trazabilidad de Piezas (100% Automatizado)**
* **Padrón y Galería de Combos:** Visualización de los Beyblades de la comunidad con arquetipos inteligentes (*Ataque, Defensa, Resistencia, Equilibrio*), propietario y visor de fotos en alta resolución (*Lightbox Zoom*).
* **Catálogo de Piezas Inteligente:** Deduplicación automática de Blades, Ratchets y Bits extraídos directamente de los combos inscritos.
* **Trazabilidad Total:** Registro histórico de cada pieza que vio acción en la arena.

### 📜 **Historial de Torneos (SaaS Recapitulativo)**
* Almacén inmutable de torneos finalizados.
* Visualización en modo solo lectura de cómo se desarrollaron los torneos pasados, campeones históricos, cantidad de puntos y estadísticas globales.

### 🏢 **SaaS Multi-Comunidad (White-Label)**
* Personalización completa de la Liga: Nombre de la comunidad, eslogan, ciudad, organizador oficial, logotipo personalizado, enlaces a redes sociales y grupo oficial de WhatsApp.

### ☁️ **Sincronización Dual (Supabase + Offline Fallback)**
* Arquitectura híbrida: Conexión en tiempo real con **Supabase PostgreSQL** y respaldo offline automático en `localStorage`.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Frontend** | React 18 + TypeScript |
| **Empaquetador** | Vite 6 |
| **Estilos & UI** | Tailwind CSS + Google Material Symbols + Inter & Montserrat Fonts |
| **Efectos Visuales** | Canvas Confetti + CSS Keyframe Animations |
| **Audio Engine** | Web Audio API / HTML5 Audio Manager |
| **Base de Datos** | Supabase (PostgreSQL con Row Level Security) |
| **Despliegue** | Vercel / Netlify / Cloudflare Pages |

---

## 🚀 Instalación y Ejecución Local

### Prerrequisitos
* [Node.js](https://nodejs.org/) v18+ o [Bun](https://bun.sh/)

### 1. Clonar el repositorio
```bash
git clone https://github.com/JaredBautist/BEYBLADE-GESTOR-DE-TORENOS.git
cd BEYBLADE-GESTOR-DE-TORENOS
```

### 2. Instalar dependencias
```bash
# Con Bun (recomendado)
bun install

# O con npm
npm install
```

### 3. Variables de Entorno (Opcional)
Crea un archivo `.env` en la raíz del proyecto si deseas conectar tu propia instancia de Supabase:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
```

### 4. Iniciar el servidor de desarrollo
```bash
# Con Bun
bun run dev

# Con npm
npm run dev
```
Abre tu navegador en `http://localhost:3000`.

---

## 🗄️ Esquema de Base de Datos (Supabase SQL)

Si deseas inicializar las tablas en tu propia base de datos de Supabase, ejecuta el siguiente script en el **SQL Editor** de Supabase:

```sql
-- 1. BLADERS
CREATE TABLE IF NOT EXISTS bladers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  alias TEXT,
  team TEXT,
  avatar_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  combos JSONB DEFAULT '[]'::jsonb,
  badges JSONB DEFAULT '[]'::jsonb,
  stats JSONB DEFAULT '{"matchesPlayed":0,"wins":0,"losses":0,"pointsScored":0,"xtremeFinishes":0,"burstFinishes":0,"overFinishes":0,"spinFinishes":0}'::jsonb,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PIEZAS
CREATE TABLE IF NOT EXISTS parts (
  name TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  category TEXT,
  weight TEXT,
  description TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COMBOS
CREATE TABLE IF NOT EXISTS combos (
  id TEXT PRIMARY KEY,
  blader_id TEXT,
  blader_name TEXT NOT NULL,
  blade TEXT NOT NULL,
  ratchet TEXT NOT NULL,
  bit TEXT NOT NULL,
  type TEXT NOT NULL,
  weight TEXT,
  image TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PARTIDAS
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

-- 5. HISTORIAL DE TORNEOS
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

-- 6. CONFIGURACIÓN DE COMUNIDAD
CREATE TABLE IF NOT EXISTS community_config (
  id TEXT PRIMARY KEY DEFAULT 'main_community',
  league_name TEXT NOT NULL,
  community_tagline TEXT,
  community_city TEXT,
  organizer_name TEXT,
  event_name TEXT,
  season TEXT,
  logo_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- POLÍTICAS PÚBLICAS
ALTER TABLE bladers DISABLE ROW LEVEL SECURITY;
ALTER TABLE parts DISABLE ROW LEVEL SECURITY;
ALTER TABLE combos DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE community_config DISABLE ROW LEVEL SECURITY;
```

---

## 🌐 Despliegue en Vercel

1. Ve a [vercel.com/new](https://vercel.com/new).
2. Importa el repositorio **`BEYBLADE-GESTOR-DE-TORENOS`**.
3. Vercel detectará la configuración automáticamente:
   * **Framework Preset:** `Vite`
   * **Build Command:** `vite build`
   * **Output Directory:** `dist`
4. Haz clic en **Deploy** y tu sistema estará en vivo para toda tu comunidad.

---

## 🏆 Créditos y Comunidad

Desarrollado con pasión para la comunidad de **Beyblade X Cúcuta** y organizadores de torneos de Beyblade en toda Latinoamérica.

* **Organización:** Comunidad Beyblade X Cúcuta
* **Reglamento:** WBO / Takara Tomy Beyblade X Official Rules
* **Licencia:** MIT License

---

<div align="center">
  <b>3... 2... 1... GO SHOOT! 🔥</b>
</div>