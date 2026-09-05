"use client";

import { CSSProperties, RefObject, useEffect, useRef } from "react";
import { MuscleAnchorFrame } from "@/features/characters/scene/muscleRegions";
import {
  MUSCLE_GROUPS,
  MuscleGroupId,
  MuscleProjection,
} from "@/lib/simulation";
import { signedPercent } from "./fields";

export type AnchorSource = {
  frame: MuscleAnchorFrame | null;
  version: number;
};

/** Callout columns in anatomical order, top to bottom. */
const LEFT_COLUMN: MuscleGroupId[] = [
  "shoulders",
  "chest",
  "biceps",
  "forearms",
  "quads",
  "calves",
];
const RIGHT_COLUMN: MuscleGroupId[] = [
  "back",
  "triceps",
  "core",
  "glutes",
  "hamstrings",
];

/** Shared axis for every regional band: −6 % to +26 % volume change. */
const BAND_MIN = -6;
const BAND_MAX = 26;
const toBand = (value: number) =>
  Math.min(100, Math.max(0, ((value - BAND_MIN) / (BAND_MAX - BAND_MIN)) * 100));

export function bandStyle(projection: MuscleProjection) {
  const interval =
    projection.intervals.find((item) => item.level === 80) ??
    projection.intervals[0];
  const zero = toBand(0);
  const mean = toBand(projection.meanPercent);
  return {
    zero: { left: `${zero}%` } as CSSProperties,
    interval: {
      left: `${toBand(interval.lower)}%`,
      width: `${toBand(interval.upper) - toBand(interval.lower)}%`,
    } as CSSProperties,
    mean: {
      left: `${Math.min(zero, mean)}%`,
      width: `${Math.abs(mean - zero)}%`,
    } as CSSProperties,
  };
}

type MuscleCalloutsProps = {
  projections: Record<MuscleGroupId, MuscleProjection>;
  confirmedMuscles: Set<MuscleGroupId>;
  selected: MuscleGroupId | null;
  onSelect: (id: MuscleGroupId) => void;
  anchors: RefObject<AnchorSource>;
  /** Element the left column must stay above (the estimate card). */
  bottomLimitRef: RefObject<HTMLElement | null>;
};

const TOP_MARGIN = 84;
const EDGE_MARGIN = 24;
const GAP = 10;

/**
 * One callout per muscle group, positioned beside the body and joined to its
 * region with a leader line. Positions are written straight to the DOM every
 * frame from the projected anchors so the labels follow rotation and zoom
 * without re-rendering React.
 */
export function MuscleCallouts({
  projections,
  confirmedMuscles,
  selected,
  onSelect,
  anchors,
  bottomLimitRef,
}: MuscleCalloutsProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const svg = svgRef.current;
    if (!root || !svg) return;
    const listMode = window.matchMedia("(max-width: 900px)");
    const elements = new Map<MuscleGroupId, HTMLElement>();
    const lines = new Map<MuscleGroupId, SVGLineElement>();
    const dots = new Map<MuscleGroupId, SVGCircleElement>();
    MUSCLE_GROUPS.forEach(({ id }) => {
      const element = root.querySelector<HTMLElement>(`[data-muscle="${id}"]`);
      const line = svg.querySelector<SVGLineElement>(`[data-line="${id}"]`);
      const dot = svg.querySelector<SVGCircleElement>(`[data-dot="${id}"]`);
      if (element) elements.set(id, element);
      if (line) lines.set(id, line);
      if (dot) dots.set(id, dot);
    });

    const place = (
      frame: MuscleAnchorFrame,
      ids: MuscleGroupId[],
      side: "left" | "right",
    ) => {
      const first = elements.get(ids[0]);
      if (!first) return;
      const height = first.offsetHeight;
      const limitElement = bottomLimitRef.current;
      const bottom =
        side === "left" && limitElement
          ? limitElement.offsetTop - GAP - height
          : root.clientHeight - EDGE_MARGIN - height;
      const tops: number[] = [];
      let previous = -Infinity;
      ids.forEach((id) => {
        const desired = frame[id].y - height / 2;
        const top = Math.max(desired, TOP_MARGIN, previous + height + GAP);
        tops.push(top);
        previous = top;
      });
      let limit = bottom;
      for (let index = tops.length - 1; index >= 0; index -= 1) {
        tops[index] = Math.min(tops[index], limit);
        limit = tops[index] - height - GAP;
      }
      ids.forEach((id, index) => {
        const element = elements.get(id);
        if (!element) return;
        const top = tops[index];
        element.style.top = `${top}px`;
        const anchor = frame[id];
        const line = lines.get(id);
        const dot = dots.get(id);
        const startX =
          side === "left"
            ? element.offsetLeft + element.offsetWidth
            : element.offsetLeft;
        if (line) {
          line.setAttribute("x1", String(startX));
          line.setAttribute("y1", String(top + height / 2));
          line.setAttribute("x2", String(anchor.x));
          line.setAttribute("y2", String(anchor.y));
          line.style.opacity = anchor.behind ? "0.28" : "1";
        }
        if (dot) {
          dot.setAttribute("cx", String(anchor.x));
          dot.setAttribute("cy", String(anchor.y));
          dot.style.opacity = anchor.behind ? "0.28" : "1";
        }
      });
    };

    let handle = 0;
    const tick = () => {
      handle = requestAnimationFrame(tick);
      if (listMode.matches) return;
      const frame = anchors.current?.frame;
      if (!frame) return;
      place(frame, LEFT_COLUMN, "left");
      place(frame, RIGHT_COLUMN, "right");
    };
    handle = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(handle);
  }, [anchors, bottomLimitRef]);

  const renderCallout = (id: MuscleGroupId, side: "left" | "right") => {
    const muscle = MUSCLE_GROUPS.find((item) => item.id === id)!;
    const projection = projections[id];
    const style = bandStyle(projection);
    const active = selected === id;
    return (
      <button
        key={id}
        type="button"
        data-muscle={id}
        className={`callout callout--${side} ${active ? "is-selected" : ""} ${
          confirmedMuscles.has(id) ? "is-confirmed" : ""
        }`}
        aria-pressed={active}
        onClick={() => onSelect(id)}
      >
        <span className="callout__head">
          <span className="callout__name">
            <i className="callout__dot" aria-hidden="true" />
            {muscle.label}
          </span>
          <b>{signedPercent(projection.meanPercent)}</b>
        </span>
        <span className="callout__band" aria-hidden="true">
          <i className="callout__zero" style={style.zero} />
          <i className="callout__interval" style={style.interval} />
          <i className="callout__mean" style={style.mean} />
        </span>
      </button>
    );
  };

  return (
    <>
      <svg ref={svgRef} className="leaders" aria-hidden="true">
        {MUSCLE_GROUPS.map(({ id }) => (
          <g key={id} className={selected === id ? "is-selected" : ""}>
            <line data-line={id} />
            <circle data-dot={id} r="4.5" />
          </g>
        ))}
      </svg>
      <div ref={rootRef} className="callouts" aria-label="Per-muscle projection">
        {LEFT_COLUMN.map((id) => renderCallout(id, "left"))}
        {RIGHT_COLUMN.map((id) => renderCallout(id, "right"))}
      </div>
    </>
  );
}
