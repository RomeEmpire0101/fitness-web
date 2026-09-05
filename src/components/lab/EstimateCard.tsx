"use client";

import { ChevronDown } from "lucide-react";
import { RefObject } from "react";
import { PhysiqueResult } from "@/lib/simulation";
import { signedKg } from "./fields";

type EstimateCardProps = {
  result: PhysiqueResult;
  startingWeightKg: number;
  expanded: boolean;
  onToggle: () => void;
  cardRef: RefObject<HTMLElement | null>;
};

const signed = (value: number, digits = 2) =>
  `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(digits)}`;

/** The headline projection, with the full breakdown one click away. */
export function EstimateCard({
  result,
  startingWeightKg,
  expanded,
  onToggle,
  cardRef,
}: EstimateCardProps) {
  const wide = result.leanGainIntervals.find((item) => item.level === 95);
  const missing = result.missingInputs.length;

  return (
    <aside
      ref={cardRef}
      className={`estimate ${expanded ? "is-expanded" : ""}`}
      aria-label="Projection"
    >
      <span className="estimate__eyebrow">
        Projection · {result.durationWeeks} weeks
      </span>
      <div className="estimate__hero">
        <b>{signedKg(result.estimatedLeanGainKg)}</b>
        <span>skeletal muscle</span>
      </div>
      {wide ? (
        <span className="estimate__interval">
          95% interval {signedKg(wide.lower)} to {signedKg(wide.upper)}
        </span>
      ) : null}
      <dl className="estimate__facts">
        <div>
          <dt>Weight</dt>
          <dd>
            {startingWeightKg.toFixed(1)} → {result.projectedWeightKg.toFixed(1)}{" "}
            kg
          </dd>
        </div>
        <div>
          <dt>Body fat</dt>
          <dd>
            {result.startingBodyFatPct.toFixed(1)} →{" "}
            {result.projectedBodyFatPct.toFixed(1)} %
          </dd>
        </div>
      </dl>
      <span
        className={`estimate__status ${missing === 0 ? "is-complete" : ""}`}
      >
        {missing === 0
          ? "All 29 inputs confirmed"
          : `${missing} input${missing === 1 ? "" : "s"} still on population priors`}
      </span>

      {expanded ? (
        <div className="estimate__detail">
          <section>
            <h3>Prediction intervals</h3>
            <table>
              <tbody>
                {result.leanGainIntervals.map((item) => (
                  <tr key={item.level}>
                    <th scope="row">{item.level}%</th>
                    <td>
                      {signedKg(item.lower)} to {signedKg(item.upper)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section>
            <h3>Scale change by component</h3>
            <table>
              <tbody>
                {result.components.map((item) => (
                  <tr key={item.id}>
                    <th scope="row">{item.label}</th>
                    <td>
                      {signed(item.changeKg)} kg
                      <small> ± {item.uncertaintyKg.toFixed(2)}</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <section>
            <h3>Hold-out validation</h3>
            <p>
              {result.validation.holdoutCohorts} cohorts ·{" "}
              {result.validation.participants} participants · MAE{" "}
              {result.validation.maePercentPoints.toFixed(1)} pp · bias{" "}
              {signed(result.validation.meanBiasPercentPoints, 1)} pp
            </p>
            <p>{result.validation.scope}</p>
          </section>
        </div>
      ) : null}

      <button
        type="button"
        className="estimate__toggle"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        {expanded ? "Hide breakdown" : "Full breakdown"}
        <ChevronDown size={15} />
      </button>
    </aside>
  );
}
