# Learn GD&T

An interactive, browser-based course on **Geometric Dimensioning and Tolerancing** (ASME Y14.5), written for someone with a mechanical engineering background who is new to GD&T.

## Run it

No build step, no dependencies. Either:

- Open `index.html` directly in any modern browser, or
- Serve the folder (`python3 -m http.server` or `npx http-server`) and browse to it, or
- Enable **GitHub Pages** on this repo (Settings → Pages → deploy from `main`, root) to host it online.

## What's inside

13 modules with interactive widgets throughout:

1. **Why GD&T Exists** — click-to-test square vs. cylindrical tolerance zone comparison
2. **The Symbol Family** — all 14 geometric characteristic symbols as expandable reference cards
3. **Feature Control Frames** — hoverable FCF anatomy + a live FCF builder with plain-English translation
4. **Datums** — 3-2-1 rule and an interactive datum-precedence demo
5. **Form Tolerances** — flatness zone simulator (squeeze a surface between two planes)
6. **Orientation Tolerances**
7. **Position** — deviation calculator (2√(ΔX²+ΔY²)) with pass/fail visualization
8. **MMC, LMC & Bonus Tolerance** — interactive bonus calculator with virtual-condition gauge pin
9. **Profile Tolerances**
10. **Runout** — animated spinning shaft with dial indicator showing FIM
11. **Concentricity & Symmetry** (legacy symbols, removed in Y14.5-2018)
12. **Quiz** — 10 randomized questions from a 30-question bank + a decode-the-frame drill
13. **Cheat Sheet** — every symbol, modifier, formula and rule on one page

Progress and best quiz scores are saved in the browser (localStorage). GD&T symbols are drawn as inline SVG, so no special fonts are required.
