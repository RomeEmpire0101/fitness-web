"use client";

import { CSSProperties, KeyboardEvent } from "react";
import {
  MUSCLE_GROUPS,
  MuscleGroupId,
  MuscleSettings,
} from "@/lib/simulation";

type MuscleMapProps = {
  activeMuscle: MuscleGroupId;
  muscles: MuscleSettings;
  onSelect: (id: MuscleGroupId) => void;
};

type MuscleShapeProps = {
  id: MuscleGroupId;
  d?: string;
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
  activeMuscle: MuscleGroupId;
  muscles: MuscleSettings;
  onSelect: (id: MuscleGroupId) => void;
};

function MuscleShape({
  id,
  d,
  cx,
  cy,
  rx,
  ry,
  activeMuscle,
  muscles,
  onSelect,
}: MuscleShapeProps) {
  const definition = MUSCLE_GROUPS.find((muscle) => muscle.id === id);
  const setting = muscles[id];
  const intensity = Math.min(1, setting.sets / 20 + (setting.priority - 1) * 0.1);
  const style = {
    "--muscle-color": definition?.color ?? "#786ff1",
    "--muscle-opacity": 0.28 + intensity * 0.66,
  } as CSSProperties;

  const activate = () => onSelect(id);
  const handleKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate();
    }
  };

  return (
    <g
      className={`muscle-shape ${activeMuscle === id ? "is-selected" : ""}`}
      role="button"
      tabIndex={0}
      aria-label={`Select ${definition?.label ?? id}`}
      aria-pressed={activeMuscle === id}
      style={style}
      onClick={activate}
      onKeyDown={handleKeyDown}
    >
      {d ? (
        <path d={d} />
      ) : (
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
      )}
    </g>
  );
}

export function MuscleMap({
  activeMuscle,
  muscles,
  onSelect,
}: MuscleMapProps) {
  return (
    <div className="muscle-map-shell">
      <div className="muscle-map-heading">
        <span>Front</span>
        <span>Back</span>
      </div>

      <svg
        className="muscle-map"
        viewBox="0 0 340 360"
        role="group"
        aria-label="Interactive muscle map"
      >
        <defs>
          <linearGradient id="body-shell" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e7e9ed" />
            <stop offset="1" stopColor="#d7dbe1" />
          </linearGradient>
        </defs>

        <g className="body-silhouette" aria-hidden="true">
          <circle cx="89" cy="38" r="21" />
          <rect x="78" y="56" width="22" height="24" rx="10" />
          <path d="M50 78 Q89 62 128 78 L119 187 Q105 207 89 211 Q73 207 59 187 Z" />
          <path d="M54 82 Q36 92 30 123 L25 205 Q29 215 38 207 L53 132 Z" />
          <path d="M124 82 Q142 92 148 123 L153 205 Q149 215 140 207 L125 132 Z" />
          <path d="M66 198 Q78 190 89 200 L82 328 Q74 341 64 327 Z" />
          <path d="M112 198 Q100 190 89 200 L96 328 Q104 341 114 327 Z" />

          <circle cx="251" cy="38" r="21" />
          <rect x="240" y="56" width="22" height="24" rx="10" />
          <path d="M212 78 Q251 62 290 78 L281 187 Q267 207 251 211 Q235 207 221 187 Z" />
          <path d="M216 82 Q198 92 192 123 L187 205 Q191 215 200 207 L215 132 Z" />
          <path d="M286 82 Q304 92 310 123 L315 205 Q311 215 302 207 L287 132 Z" />
          <path d="M228 198 Q240 190 251 200 L244 328 Q236 341 226 327 Z" />
          <path d="M274 198 Q262 190 251 200 L258 328 Q266 341 276 327 Z" />
        </g>

        <MuscleShape
          id="shoulders"
          d="M50 83 Q60 72 73 75 L69 101 Q56 103 48 95 Z M128 83 Q118 72 105 75 L109 101 Q122 103 130 95 Z"
          activeMuscle={activeMuscle}
          muscles={muscles}
          onSelect={onSelect}
        />
        <MuscleShape
          id="chest"
          d="M69 83 Q89 76 88 111 Q73 116 62 106 Z M109 83 Q89 76 90 111 Q105 116 116 106 Z"
          activeMuscle={activeMuscle}
          muscles={muscles}
          onSelect={onSelect}
        />
        <MuscleShape
          id="biceps"
          d="M43 105 Q54 105 55 124 L49 157 Q38 155 38 141 Z M135 105 Q124 105 123 124 L129 157 Q140 155 140 141 Z"
          activeMuscle={activeMuscle}
          muscles={muscles}
          onSelect={onSelect}
        />
        <MuscleShape
          id="core"
          d="M72 116 Q89 122 106 116 L108 174 Q89 187 70 174 Z"
          activeMuscle={activeMuscle}
          muscles={muscles}
          onSelect={onSelect}
        />
        <MuscleShape
          id="quads"
          d="M67 204 Q77 196 86 205 L80 265 Q70 274 63 258 Z M111 204 Q101 196 92 205 L98 265 Q108 274 115 258 Z"
          activeMuscle={activeMuscle}
          muscles={muscles}
          onSelect={onSelect}
        />
        <MuscleShape
          id="calves"
          d="M64 270 Q74 263 80 274 L76 319 Q69 331 63 317 Z M114 270 Q104 263 98 274 L102 319 Q109 331 115 317 Z M226 270 Q236 263 242 274 L238 319 Q231 331 225 317 Z M276 270 Q266 263 260 274 L264 319 Q271 331 277 317 Z"
          activeMuscle={activeMuscle}
          muscles={muscles}
          onSelect={onSelect}
        />

        <MuscleShape
          id="back"
          d="M224 84 Q251 72 278 84 L273 142 Q263 158 251 165 Q239 158 229 142 Z"
          activeMuscle={activeMuscle}
          muscles={muscles}
          onSelect={onSelect}
        />
        <MuscleShape
          id="triceps"
          d="M205 104 Q216 104 217 125 L210 166 Q199 161 199 145 Z M297 104 Q286 104 285 125 L292 166 Q303 161 303 145 Z"
          activeMuscle={activeMuscle}
          muscles={muscles}
          onSelect={onSelect}
        />
        <MuscleShape
          id="glutes"
          d="M228 170 Q240 160 250 174 L249 204 Q236 211 225 196 Z M274 170 Q262 160 252 174 L253 204 Q266 211 277 196 Z"
          activeMuscle={activeMuscle}
          muscles={muscles}
          onSelect={onSelect}
        />
        <MuscleShape
          id="hamstrings"
          d="M229 207 Q239 199 248 208 L243 268 Q233 275 226 259 Z M273 207 Q263 199 254 208 L259 268 Q269 275 276 259 Z"
          activeMuscle={activeMuscle}
          muscles={muscles}
          onSelect={onSelect}
        />
      </svg>

      <div className="muscle-map-legend" aria-hidden="true">
        <span>Maintenance</span>
        <i />
        <i />
        <i />
        <span>High focus</span>
      </div>
    </div>
  );
}
