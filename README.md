# NachtVeilig (MVP)

Community-gedreven veiligheidsplatform (web/PWA) om onveilige situaties in publieke ruimte te melden zonder melders onnodig te identificeren.

## Productdoel

**Vraag:** kan een community-platform helpen om onveilige locaties en patronen zichtbaar te maken, zonder identiteits- of locatieprivacy onnodig te schaden?  
**Antwoord in dit MVP:** ja, via geanonimiseerde kaartweergave, moderatie, anonieme meldingen en tijdelijke veiligheidsdeling.

---

## Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, MapLibre GL
- **Backend:** Next.js route handlers, Prisma ORM
- **Database:** PostgreSQL
- **Auth:** NextAuth (credentials)
- **Validatie:** Zod + React Hook Form
- **Tests:** Vitest + Playwright

---

## Kernfunctionaliteit (geïmplementeerd)

- Landingspagina met disclaimers, map preview en CTA's
- `/kaart` interactieve map:
  - marker/heatmap mode
  - tijdsfilter
  - locatiezoekveld (Nominatim via `GeocodingService`)
  - current location (browser geolocation)
- `/melden` multi-step meldflow (anoniem of ingelogd)
- Bescherming van exacte locatie:
  - publieke kaartcoördinaten gejitterd via `LocationPrivacyService`
  - originele coördinaten alleen server-side opgeslagen
- PII-detectie (`PIIDetectionService`) met waarschuwingen
- Anonieme access token bij anonieme melding (alleen hash in DB)
- Moderatie:
  - `/admin`, `/admin/meldingen`
  - approve/reject/hide/remove
  - audit logging via `AdminAuditLog`
- Publieke feed `/meldingen` + detail `/melding/[publicId]`
- Account flows:
  - registratie + login + logout
  - account dashboard
  - saved locations API
- Safety session:
  - `/veilig` start route-sharing sessie
  - tijdelijke share-link `/volg/[token]`
  - sessie stop + expiry
- Hulp- en privacypagina:
  - `/hulp`
  - `/privacy`
- PWA basis:
  - `manifest.webmanifest`
  - service worker registratie
- Security baseline:
  - server-side authorization checks
  - Zod input validation
  - rate limiting abstraction voor anonieme meldingen
  - security headers

---

## Architectuur

```text
src/
  app/
    (pages + api routes)
  components/
  lib/
    auth.ts
    env.ts
    prisma.ts
    schemas.ts
    permissions.ts
  services/
    location-privacy-service.ts
    report-service.ts
    report-moderation-service.ts
    duplicate-detection-service.ts
    pii-detection-service.ts
    rate-limit-service.ts
    safety-score-service.ts
    safety-session-service.ts
    geocoding-service.ts
    notification-service.ts
prisma/
  schema.prisma
  seed.ts
tests/
  services.test.ts
  e2e/report-flow.spec.ts
scripts/
  cleanup.ts
```

---

## Environment variabelen

Gebruik `.env.example` als basis:

- `DATABASE_URL`
- `AUTH_SECRET`
- `APP_NAME`
- `APP_URL`
- `DEFAULT_COUNTRY`
- `DEFAULT_LANGUAGE`
- `PUBLIC_LOCATION_RADIUS_METERS`
- `MIN_REPORTS_FOR_AREA_STATISTICS`
- `LIVE_LOCATION_RETENTION_HOURS`
- `PRIVATE_EVIDENCE_RETENTION_DAYS`
- `ABUSE_IDENTIFIER_RETENTION_DAYS`
- `UPLOAD_MAX_MB`
- `RATE_LIMIT_REPORTS_PER_HOUR`
- `MAP_TILE_URL`
- `GEOCODING_PROVIDER`
- `NEXT_PUBLIC_MAP_TILE_URL`

---

## Installatie

```bash
npm install
```

## Database setup

1. Start PostgreSQL
2. Configureer `DATABASE_URL` in `.env`
3. Draai migraties:

```bash
npx prisma migrate dev
```

4. Seed demo-data:

```bash
npx prisma db seed
```

of:

```bash
npm run prisma:seed
```

---

## Ontwikkelen

```bash
npm run dev
```

Open: `http://localhost:3000`

---

## Testen

```bash
npm run typecheck
npm run lint
npm run test
npm run test:e2e
```

---

## Productie

```bash
npm run build
npm run start
```

---

## Demo admin

Na seeden:

- **email:** `admin@nachtveilig.local`
- **password hash** staat seeded; maak lokaal evt. nieuw admin-account en promoteer rol in DB voor echte tests.

---

## Privacy & veiligheid (MVP)

- Publieke locaties zijn benaderd, niet exact
- Community data is niet hetzelfde als officiële misdaadstatistiek
- Geen publieke daderprofielen of identiteitspublicatie
- Tijdelijke live locatie links met token + expiry
- Geen fake emergency-integraties

---

## Data retention / cleanup

Cleanup job:

```bash
npm run cleanup:sensitive
```

Doet o.a.:

- verlopen safety sessions verwijderen
- oude abuse identifiers schonen

---

## Bekende MVP-beperkingen

- Geen complete password-reset flow (architectuur voorbereid, endpoint nog niet uitgewerkt)
- Geen e-mailverificatie verzendprovider geïntegreerd
- Evidence upload metadata-model aanwezig, volledige secure upload pipeline nog basisniveau
- E2E tests vereisen draaiende DB en ontwikkelserver
- Rate limiting is momenteel in-memory (voor productie vervangen met gedeelde store zoals Redis)

---

## Belangrijke disclaimers in de app

- "Deze informatie is gebaseerd op meldingen van gebruikers en is niet onafhankelijk geverifieerd."
- "Locaties worden bij benadering weergegeven om de privacy van melders te beschermen."
- "Deze app vervangt geen hulpdiensten. Ben je in direct gevaar? Neem direct contact op met de hulpdiensten."

