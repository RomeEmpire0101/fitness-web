# FormForge — Probabilistic Physique Lab

A single-screen web app that turns a resistance-training program and a set of
body measurements into a **per-muscle hypertrophy projection with calibrated
prediction intervals**, and renders the result on a 3D body whose geometry is
deformed by the model's own output.

The estimate is study-anchored and probabilistic. It is not a diagnosis, a
guarantee, or a claim of personal point accuracy — see
[docs/SCIENTIFIC_MODEL.md](docs/SCIENTIFIC_MODEL.md).

Model version: `FF-HBM 1.0`

## What it does

- **The body is the navigation.** Each of the 11 muscle groups has a callout
  beside the 3D figure showing its projected volume change and 80% interval,
  joined to the region by a leader line that follows rotation and zoom.
  Clicking a callout, or the muscle itself on the body, opens that group's
  weekly dose. The 18 global inputs sit as chips in the top strip; the headline
  estimate and its full breakdown sit bottom-left.
- **Per-muscle projection.** 11 muscle groups (chest, back, shoulders, biceps,
  triceps, forearms, core, quads, hamstrings, glutes, calves), each with its own
  regional hypertrophy distribution driven by exercise selection, direct and
  indirect sets, reps, RIR, and frequency.
- **Explicit uncertainty.** Outputs are 50%, 80%, 95%, and 99% prediction
  intervals. Every unconfirmed input widens them.
- **Required confirmation.** Age, sex, training history, energy intake, protein,
  sleep, adherence, projection length, measurements, body-fat method, and each
  muscle row must be explicitly confirmed before the UI reports a
  complete-input estimate. Editing a field invalidates its confirmation.
- **Body-component accounting.** The scale projection is broken into mutually
  exclusive rows: fat tissue, wet skeletal muscle, glycogen shift,
  glycogen-bound water shift, and other lean/residual mass.
- **Calibrated 3D deformation.** Regional MRI volume change is converted to a
  linear mesh change via `cube_root(1 + volume change) - 1` and applied against
  radii measured from the source mesh — no arbitrary visual growth multipliers.
  Starting bodies blend toward a neutralized mesh based on measured starting
  muscularity, so the projected view adds only the study-derived delta.

## Stack

| Concern | Choice |
| --- | --- |
| UI | React 19, Next.js App Router source layout, TypeScript (strict) |
| Build / dev server | [vinext](https://www.npmjs.com/package/vinext) on Vite 8 |
| 3D | three.js via `@react-three/fiber` + `@react-three/drei` |
| Runtime target | Cloudflare Workers (Wrangler) |
| Styling | Hand-written CSS — `src/app/globals.css` plus one CSS module |
| Persistence | `localStorage`, read through `useSyncExternalStore` |

There is no backend and no database. All state lives in the browser under the
key `formforge:fitness-data:v1`.

## Getting started

```bash
npm install
```

```bash
npm run dev
```

The dev server runs on http://localhost:3000.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | vinext dev server on port 3000 |
| `npm run build` | Runs both model checks, then `vinext build`, then stages the Sites hosting manifest |
| `npm start` | Serves the built app |
| `npm run typecheck` | `tsc --noEmit`, no incremental cache |
| `npm run lint` | ESLint across the repo |
| `npm run check:model` | Holdout validation of the scientific model |
| `npm run check:anatomy` | Anatomy deformation safety bounds |
| `npm run dev:next` / `build:next` | Alternate Next.js/webpack path, kept as a fallback |
| `npm run build:vercel` | Both gates, then a standard Next.js build — what Vercel runs |
| `npm run deploy:vinext` | Deploys the Cloudflare Worker build |

### Build gates

`npm run build` will not proceed unless both checks pass:

- **`check:model`** re-fits the central regional coefficients and validates them
  against at least 10 reserved cohort-level outcomes, reporting mean absolute
  error, signed bias, and nominal-vs-observed interval coverage. This is study-level
  holdout validation — it cannot establish personal accuracy.
- **`check:anatomy`** asserts that mesh deformation stays inside
  `src/features/characters/scene/anatomyLimits.json` under extreme inputs, so no
  combination of values can balloon or invert the model.

Run them directly while iterating on `src/lib/simulation.ts` or the mesh code.

## Project layout

```
src/
  app/                      Route entry, root layout, global CSS
  components/
    FitnessLab.tsx          App shell: sidebar, topbar, mobile nav
    lab/LabScreen.tsx       The workspace — inputs, projection, 3D stage
  features/characters/
    config.ts               Measurement definitions, wardrobe, defaults
    morphology.ts           Projection output -> morph parameters
    useCharacterProfile.ts  Character profile state
    CharacterEditor.tsx     Character profile editor
    scene/                  three.js scene, GLB bodies, mesh neutralization
  hooks/                    localStorage-backed data, reduced-motion
  lib/
    simulation.ts           The FF-HBM 1.0 model (the core of the app)
    fitnessData.ts          Persisted shape, migrations, normalization
scripts/                    Build-gate checks and one-off mesh tooling
docs/SCIENTIFIC_MODEL.md    Model documentation and evidence anchors
public/models/              Male and female base GLB meshes (see LICENSE files)
```

The `@/*` path alias maps to `src/*`.

## Where to change things

- **Model behavior, priors, intervals** — `src/lib/simulation.ts`. Re-run
  `npm run check:model` afterward; the holdout numbers are a gate, not a report.
- **How the projection reshapes the body** — `src/features/characters/morphology.ts`
  and `src/features/characters/scene/`. Re-run `npm run check:anatomy`.
- **Inputs and layout** — `src/components/lab/LabScreen.tsx`. Its three input
  modes (training, body, muscle) drive everything the model consumes.
- **Persisted data shape** — `src/lib/fitnessData.ts`. `normalizeFitnessData`
  carries older stored payloads forward; extend it rather than breaking them.

## Deployment

This repo supports two deployment targets, and they need different builds.

**Cloudflare Workers (primary).** `npm run build` runs `vinext build`, which
emits `dist/client` and `dist/server` against `wrangler.jsonc`
(`nodejs_compat` enabled). `scripts/prepare-sites-build.mjs` then copies
`.openai/hosting.json` into `dist/` so the same build can be published through
Sites. Deploy with `npm run deploy:vinext`.

**Vercel.** Vercel expects a `.next` directory, which `vinext build` never
produces — pointing it at the default `build` script fails with
`routes-manifest.json couldn't be found`. `vercel.json` therefore overrides
the build command to `npm run build:vercel`, a standard `next build` behind the
same two gates. Nothing else about the Vercel project needs configuring; leave
the Output Directory setting empty so the `nextjs` framework default applies.

Both paths build the same `src/`. If you add a Workers-only API (KV, D1,
Durable Objects), the Vercel build will compile but that feature will not work
there.

## Documentation

- [docs/SCIENTIFIC_MODEL.md](docs/SCIENTIFIC_MODEL.md) — model structure,
  variance sources, body-component accounting, mesh calibration, holdout
  validation, and the published studies behind the priors.
- [src/features/characters/CUSTOMIZATION_LOGIC.md](src/features/characters/CUSTOMIZATION_LOGIC.md)
  — the `CharacterProfile` model: identity, measurements, appearance, wardrobe.
- [AGENTS.md](AGENTS.md) — commit discipline for this repo.
