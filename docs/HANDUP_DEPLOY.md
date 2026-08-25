# Deployment Handup — Complete State for New Chat

## Project
**ZarrinPal Analytics Dashboard** (Elcamp 1405)
- GitHub: `https://github.com/Armoyas/zarrinpal-analytics`
- Repo path (local sandbox): `/opt/data/zarrinpal-analytics/`
- Git branch: `main` — **all commits merged & pushed** ✅

## Latest Commits on main
```
181ab77 fix: package.json dependency versions for frontend Docker build   ← JUST PUSHED
ae0dd01 fix: deploy.sh seed script path relative to project root
5b8970b docs: update AGENTS.md with AI dashboard conventions and Tailwind CSS v4
5952be7 fix: deploy.sh Docker startup handle non-systemd environments
841df6b fix: deploy.sh Docker package conflict resolution
a50c7fd Merge pull request #15 from Armoyas/feature/ai-analytical-dashboard
```

## What’s Done
| Area | Status | Commit(s) |
|---|---|---|
| AI Backend (FastAPI + DuckDB) | ✅ Done | `8735e3f`, `ae0dd01` |
| AI Frontend (Next.js + shadcn/ui) | ✅ Done | `8735e3f`, `181ab77` |
| Persian RTL + Vazirmatn theme | ✅ Done | `8735e3f` |
| 5 AI insights endpoints | ✅ Done | `8735e3f` |
| DuckDBManager 6 AI methods | ✅ Done | `8735e3f` |
| Nowruz analytics (4 routes) | ✅ Done | `8735e3f` |
| deploy.sh Docker package fix | ✅ Done | `841df6b` |
| deploy.sh non-systemd fix | ✅ Done | `5952be7` |
| deploy.sh seed script path fix | ✅ Done | `ae0dd01` |
| package.json version fix | ✅ Done | `181ab77` |
| README + AGENTS.md docs | ✅ Done | `77793ba`, `3268515`, `5b8970b` |
| Skills (vercel-react-best-practices, kiranism-shadcn-dashboard) | ✅ Installed | — |

## What’s Left — Server Deployment
**Server**: `62.60.198.209` (Ubuntu, SSH root@62.60.198.209)
- Docker + Node.js installed ✅
- Repo cloned ✅
- Frontend Docker build failed (`@radix-ui/react-icons@^1.4.0` — now fixed on main) ⚠️→✅
- Seed script path fixed (`../../scripts/seed_demo.py`) ✅
- Services NOT started yet ❌

### Remaining Steps (run on server — use docker-compose, NOT systemd)
```bash
# 1. Pull latest (includes package.json + seed script fixes)
cd /var/www/zarrinpal && git pull origin main

# 2. Seed the database (using venv, not inside Docker)
source venv/bin/activate
cd services/api
PYTHONPATH=.:./app/db python ../../scripts/seed_demo.py

# 3. Build & start with docker compose (NOT systemd)
cd /var/www/zarrinpal
docker compose build
docker compose up -d

# 4. Verify
docker compose ps
curl http://localhost:8000/api/v1/health
curl http://localhost:8000/api/v1/insights/spending-patterns
curl http://localhost:8000/api/v1/insights/risk-alerts
curl http://localhost:8020/ai-dashboard   # if nginx routes it
# Or: curl http://localhost:3000/ai-dashboard
```

### Docker Compose Configuration
- **docker-compose.yml**: api→:8000, frontend→:3000, nginx→:80
- **nginx.conf**: proxies `/api/` → `http://api:8000/api/`, `/` → `http://frontend:3000`
- Volumes: `./services/api:/app`, `./frontend:/app`, `./data:/app/data`

### Deploy Script Notes
- `deploy.sh` currently uses **systemd** (lines 96-178) — user wants **docker-compose only**
- The docker-compose.yml is already correctly configured for non-systemd deployment
- No changes needed to docker-compose.yml for the docker-compose approach

## Skills Installed
- `/opt/data/zarrinpal-analytics/skills/vercel-react-best-practices`
- `/opt/data/zarrinpal-analytics/skills/kiranism-shadcn-dashboard`

## Environment Notes
- Sandbox: Docker Linux, root user, `/root` home
- GitHub auth: HTTPS token (user's, kept safe)
- Server SSH: `root@62.60.198.209`, password available in context

## Next Action
Complete server deployment using `docker compose up -d` after `git pull origin main` + seed script.
```
