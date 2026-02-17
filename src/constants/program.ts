import type { Variant, Lift } from "../types";

export const VARS: Record<string, Variant> = {
  classic: {
    n: "5/3/1 Classic",
    d: "Original 3 working sets",
    wk: [
      {
        l: "5s",
        t: "5s",
        s: [
          { r: 5, p: 0.65 },
          { r: 5, p: 0.75 },
          { r: "5+", p: 0.85 },
        ],
      },
      {
        l: "3s",
        t: "3s",
        s: [
          { r: 3, p: 0.7 },
          { r: 3, p: 0.8 },
          { r: "3+", p: 0.9 },
        ],
      },
      {
        l: "5/3/1",
        t: "5/3/1",
        s: [
          { r: 5, p: 0.75 },
          { r: 3, p: 0.85 },
          { r: "1+", p: 0.95 },
        ],
      },
      {
        l: "Deload",
        t: "Deload",
        s: [
          { r: 5, p: 0.4 },
          { r: 5, p: 0.5 },
          { r: 5, p: 0.6 },
        ],
      },
    ],
  },
  bbb: {
    n: "Boring But Big",
    d: "5x10 supplemental at 50%",
    wk: [
      {
        l: "5s",
        t: "5s",
        s: [
          { r: 5, p: 0.65 },
          { r: 5, p: 0.75 },
          { r: "5+", p: 0.85 },
        ],
      },
      {
        l: "3s",
        t: "3s",
        s: [
          { r: 3, p: 0.7 },
          { r: 3, p: 0.8 },
          { r: "3+", p: 0.9 },
        ],
      },
      {
        l: "5/3/1",
        t: "5/3/1",
        s: [
          { r: 5, p: 0.75 },
          { r: 3, p: 0.85 },
          { r: "1+", p: 0.95 },
        ],
      },
      {
        l: "Deload",
        t: "Deload",
        s: [
          { r: 5, p: 0.4 },
          { r: 5, p: 0.5 },
          { r: 5, p: 0.6 },
        ],
      },
    ],
    sp: { n: 5, r: 10, p: 0.5 },
  },
  bbbC: {
    n: "BBB Challenge",
    d: "Escalating 50/60/70%",
    wk: [
      {
        l: "5s",
        t: "5s",
        s: [
          { r: 5, p: 0.65 },
          { r: 5, p: 0.75 },
          { r: "5+", p: 0.85 },
        ],
      },
      {
        l: "3s",
        t: "3s",
        s: [
          { r: 3, p: 0.7 },
          { r: 3, p: 0.8 },
          { r: "3+", p: 0.9 },
        ],
      },
      {
        l: "5/3/1",
        t: "5/3/1",
        s: [
          { r: 5, p: 0.75 },
          { r: 3, p: 0.85 },
          { r: "1+", p: 0.95 },
        ],
      },
      {
        l: "Deload",
        t: "Deload",
        s: [
          { r: 5, p: 0.4 },
          { r: 5, p: 0.5 },
          { r: 5, p: 0.6 },
        ],
      },
    ],
    spW: [
      { n: 5, r: 10, p: 0.5 },
      { n: 5, r: 10, p: 0.6 },
      { n: 5, r: 10, p: 0.7 },
      { n: 5, r: 10, p: 0.6 },
    ],
  },
  fsl: {
    n: "First Set Last",
    d: "5x5 at first set weight",
    wk: [
      {
        l: "5s",
        t: "5s",
        s: [
          { r: 5, p: 0.65 },
          { r: 5, p: 0.75 },
          { r: "5+", p: 0.85 },
        ],
      },
      {
        l: "3s",
        t: "3s",
        s: [
          { r: 3, p: 0.7 },
          { r: 3, p: 0.8 },
          { r: "3+", p: 0.9 },
        ],
      },
      {
        l: "5/3/1",
        t: "5/3/1",
        s: [
          { r: 5, p: 0.75 },
          { r: 3, p: 0.85 },
          { r: "1+", p: 0.95 },
        ],
      },
      {
        l: "Deload",
        t: "Deload",
        s: [
          { r: 5, p: 0.4 },
          { r: 5, p: 0.5 },
          { r: 5, p: 0.6 },
        ],
      },
    ],
    fl: { n: 5, r: 5 },
  },
  ssl: {
    n: "Second Set Last",
    d: "5x5 at second set weight",
    wk: [
      {
        l: "5s",
        t: "5s",
        s: [
          { r: 5, p: 0.65 },
          { r: 5, p: 0.75 },
          { r: "5+", p: 0.85 },
        ],
      },
      {
        l: "3s",
        t: "3s",
        s: [
          { r: 3, p: 0.7 },
          { r: 3, p: 0.8 },
          { r: "3+", p: 0.9 },
        ],
      },
      {
        l: "5/3/1",
        t: "5/3/1",
        s: [
          { r: 5, p: 0.75 },
          { r: 3, p: 0.85 },
          { r: "1+", p: 0.95 },
        ],
      },
      {
        l: "Deload",
        t: "Deload",
        s: [
          { r: 5, p: 0.4 },
          { r: 5, p: 0.5 },
          { r: 5, p: 0.6 },
        ],
      },
    ],
    sl: { n: 5, r: 5 },
  },
};

export const LIFTS: Lift[] = [
  { id: "ohp", nm: "Overhead Press", sh: "OHP", inc: 5 },
  { id: "deadlift", nm: "Deadlift", sh: "DL", inc: 10 },
  { id: "bench", nm: "Bench Press", sh: "BP", inc: 5 },
  { id: "squat", nm: "Squat", sh: "SQ", inc: 10 },
];

export const LIFT_ORDER = ["squat", "bench", "deadlift", "ohp"];
