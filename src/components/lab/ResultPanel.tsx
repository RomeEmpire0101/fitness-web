import { Check } from "lucide-react";
import { PhysiqueResult } from "@/lib/simulation";
import { AnimatedNumber } from "./AnimatedNumber";

type ResultPanelProps = {
  result: PhysiqueResult;
  reducedMotion: boolean;
};

export function ResultPanel({
  result,
  reducedMotion,
}: ResultPanelProps) {
  const circumference = 2 * Math.PI * 43;
  const dashOffset =
    circumference - (result.adaptation / 100) * circumference;

  return (
    <section className="result-panel" aria-label="Adaptation result">
      <div className="score-ring">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="43" className="score-ring__track" />
          <circle
            cx="50"
            cy="50"
            r="43"
            className="score-ring__value"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: dashOffset,
            }}
          />
        </svg>
        <div className="score-ring__label">
          <strong>
            <AnimatedNumber
              value={result.adaptation}
              reducedMotion={reducedMotion}
            />
          </strong>
          <span>%</span>
        </div>
      </div>

      <div className="result-copy">
        <span className="eyebrow">Adaptation signal</span>
        <div className="result-title-row">
          <h2>{result.stage}</h2>
          <span className="result-status">
            <Check size={13} />
            {result.status}
          </span>
        </div>
        <p>{result.guidance}</p>
      </div>

      <div className="result-bars" aria-label="Input balance details">
        <div>
          <span>
            Stimulus <b>{Math.round(result.stimulus * 100)}</b>
          </span>
          <i>
            <em style={{ width: `${result.stimulus * 100}%` }} />
          </i>
        </div>
        <div>
          <span>
            Balance <b>{Math.round(result.balance * 100)}</b>
          </span>
          <i>
            <em style={{ width: `${result.balance * 100}%` }} />
          </i>
        </div>
      </div>
    </section>
  );
}

