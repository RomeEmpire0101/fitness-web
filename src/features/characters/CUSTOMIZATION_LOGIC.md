# Character customization logic

## Profile model

One saved `CharacterProfile` is the source of truth for every place the avatar
appears. It is split into four independent concerns:

1. **Identity** — profile name and masculine/feminine body presentation.
2. **Measurements** — height and weight only.
3. **Appearance** — skin tone, hair style, and hair color.
4. **Wardrobe** — top, bottom, shoes, headwear, eyewear, and per-layer colors.

Selections are stable IDs rather than rendering details. The editor can change
labels or the 3D implementation later without invalidating a saved profile.

## Height, weight, and body presentation

- Height sets the vertical scale and camera framing.
- Weight is interpreted relative to height through the same height-adjusted mass
  calculation for both body presentations.
- Plausible lean mass changes structural width only within a narrow range.
- Additional mass becomes a smooth, bounded fat signal rather than uniformly
  scaling the entire mesh.
- The fat signal is shared; only its regional distribution differs:
  masculine presentation emphasizes abdomen, flanks, lower back, and chest,
  while feminine presentation emphasizes hips, glutes, thighs, lower abdomen,
  chest, and upper arms.
- Head, hands, and feet are protected from the main width/fat scaling so they do
  not become disproportionately large.

Height and weight cannot determine body composition. These transforms are
visual heuristics and must not be presented as health or body-fat estimates.

## Rendering order

All layers inherit the same root motion and height transform:

1. body mesh and physique deformation;
2. hair behind/around the head;
3. bottoms;
4. top;
5. shoes;
6. eyewear;
7. headwear.

Wardrobe pieces calculate fit from body presentation, structural width, and the
shared fat signal. They do not alter measurements or physique simulation.

## Compatibility rules

- `none` is valid for every optional wardrobe slot.
- Hats visually compress or hide the crown portion of hair but do not delete the
  saved hairstyle.
- Tops and bottoms own separate colors so changing one never recolors another.
- Switching body presentation keeps height, weight, colors, hair, and wardrobe
  selections. Fit is recalculated for the new silhouette.
- Unknown or retired option IDs normalize to safe defaults.
- Older locally saved profiles migrate through normalization and preserve name,
  measurements, and skin tone.

## Editor behavior

- Changes preview immediately and persist locally.
- Categories keep the number of simultaneous choices manageable: Body, Hair,
  Outfit, and Extras.
- Every visual choice is a real button with selected state and an accessible
  label.
- Reset restores the complete profile, not only the currently visible category.
