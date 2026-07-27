# FormForge probabilistic physique model

Model version: `FF-HBM 1.0`

## What the estimate means

The output is a study-anchored probabilistic estimate, not a diagnosis,
guarantee, or claim of personal point accuracy. The 50%, 80%, 95%, and 99%
outputs are prediction intervals. In particular, the 99% interval is never
described as a point estimate that is “99% accurate.”

Defaults are population priors. Age, sex, training history, energy intake,
protein, sleep, adherence, projection length, body measurements, body-fat
method, and every muscle's exercise, direct sets, indirect sets, repetitions,
RIR, and frequency must be confirmed before the UI reports a complete-input
estimate. Each missing value increases predictive variance.

## Regional model

Each rendered muscle has its own regional hypertrophy distribution. Its centre
is:

```text
regional study prior
× saturating duration response
× saturating completed-set dose response
× RIR response
× repetition-range response
× training-history response
× age response
× protein response
× energy-availability response
× conservative sleep response
× within-session distribution response
```

Direct sets receive a weight of 1.0. Indirect sets receive a conservative 0.4
effective-set prior. Frequency distributes volume across sessions but is not
given an independent hypertrophy bonus. Both set dose and time use nonlinear
exponential saturation, so growth cannot increase linearly without limit.

Regional response variance combines an absolute floor, outcome-proportional
heterogeneity, evidence-grade penalties, body-fat measurement error,
long-horizon error, and the count of unconfirmed inputs. Hubal et al.'s large
MRI response distribution informs the between-person responder component;
genetics remain latent rather than being invented from demographics.

## Body-component accounting

The scale projection keeps these mutually exclusive rows:

- fat tissue;
- wet skeletal muscle tissue;
- glycogen shift;
- glycogen-bound water shift;
- other lean tissue and residual mass.

Baseline water and glycogen are already contained in measured wet lean tissue,
so the two shift rows start at zero. This avoids counting their baseline mass
twice. The rows are bookkeeping estimates, not direct clinical compartment
measurements.

## Mesh calibration

Regional study outcomes are converted into a physical linear mesh change:

```text
linear radius change = cube_root(1 + MRI volume change) - 1
```

The shader applies that linear change using regional radii measured from the
source mesh. It does not use arbitrary visual “growth multipliers,” and
overlapping muscle masks use maximum influence instead of summing into a
ballooning deformation.

The source scans contain athletic surface definition. Starting bodies now use
a separate neutralized position and normal field. The blend toward that
neutral mesh is driven by starting FFMI, upper-arm and thigh circumferences,
body fat, and training history. A lower-muscularity person therefore begins
with a softer geometry and surface, while the projected view adds only the
study-derived regional delta.

### Baseline-resolution plan

1. **Implemented:** neutralize the baked athletic scan with smoothed geometry
   and normals, then blend by measured starting muscularity.
2. **Implemented:** derive the starting silhouette from height, weight,
   body-fat percentage, waist, chest, arm, thigh, and hip measurements.
3. **Implemented:** apply regional projection deltas through cube-root MRI
   volume conversion and measured mesh radii.
4. **Next data milestone:** fit baseline surface priors to paired 3D scans and
   DXA/MRI measurements across low, average, and high FFMI/body-fat strata.
5. **Next validation milestone:** report landmark-distance and circumference
   errors for those unseen scans, stratified by sex and baseline body-fat
   method. Until that dataset exists, baseline appearance remains labelled an
   estimate.

## Holdout validation

Central regional priors are calibrated from the studies identified in
`MODEL_SOURCES`. Ten cohort-level regional outcomes are reserved from central
coefficient fitting. The validation reports:

- mean absolute error in regional hypertrophy percentage points;
- mean signed bias;
- the mean absolute gap between nominal and observed interval coverage;
- observed coverage for the 50%, 80%, 95%, and 99% intervals.

Calf outcomes used to set the calf prior are deliberately excluded from the
holdout set. Hubal sex-stratified mean outcomes are withheld from the central
mean fit, although Hubal's response dispersion informs the variance model; the
UI therefore calls this cohort-outcome holdout validation, not fully external
participant-level validation.

This validation is small and study-level. It cannot establish personal
accuracy, and its participant-record count must not be read as independent raw
participant predictions.

## Evidence anchors

- Hubal et al. (2005), MRI response heterogeneity:
  https://pubmed.ncbi.nlm.nih.gov/15947721/
- Van Vossel et al. (2024), 3D MRI regional muscle volumes:
  https://pubmed.ncbi.nlm.nih.gov/38687626/
- Schoenfeld et al. (2019), randomized weekly set volume:
  https://pubmed.ncbi.nlm.nih.gov/30153194/
- Refalo et al. (2024), failure versus 1–2 RIR:
  https://pubmed.ncbi.nlm.nih.gov/38393985/
- Plotkin et al. (2023), regional glute MRI:
  https://pmc.ncbi.nlm.nih.gov/articles/PMC10349977/
- Nunes et al. (2020), head-specific calf hypertrophy:
  https://pubmed.ncbi.nlm.nih.gov/32735428/
- Bone et al. (2017), hydration/glycogen effects on DXA lean mass:
  https://pubmed.ncbi.nlm.nih.gov/28204901/
- Longland et al. (2016), protein and energy-deficit body composition:
  https://pubmed.ncbi.nlm.nih.gov/26817506/
