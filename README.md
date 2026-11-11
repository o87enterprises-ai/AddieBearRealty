# Adrianna Wigzell — eXp Realty

Static site, no build step. Scrolling the hero lifts the roof off a 3D model of
**11490 SW Crown Dr #2, King City, OR 97224** (1 bed / 1 bath / 771 sq ft, built 1967),
opens the brick shell, and settles on the labelled floor plan. A separate page is a
full first-person walkthrough of the same plan.

- `index.html` — page and styles: a centred, oversized hero, then the teardown as its own
  pinned panel in an evenly inset frame.
- `content.js` — **the only file to edit for content.** Agent copy, listing facts, and the
  `floor` object that both 3D views are built from.
- `plan.js` — turns the room rectangles into wall segments (dedupes shared walls, knocks out
  doors and windows). Shared by `house.js` and `tour.js`.
- `house.js` — the teardown scene (three.js + GSAP ScrollTrigger).
- `tour.html` / `tour.js` — first-person walkthrough: drag to look, WASD/arrows, Shift to run,
  minimap, room labels, and an exit link.

## Editing the layout

`SITE.floor.rooms` are absolute rectangles in feet on a 32 × 24 ft footprint; they must tile
without gaps or overlaps. Walls, doors (swing arcs) and windows are generated from them, so a
new room or opening is a one-line change. Doors and windows are axis-aligned gaps:

```js
{ o: "v", at: 13, a: 16, b: 19 }          // gap in the wall at x = 13, from z 16 to 19
```

## Notes

- The 3D model is an **approximate layout** derived from the listing and the published 771 sq ft.
  It is not a measured survey, and both the blueprint and the tour say so.
- Set `SITE.headshot` to a portrait path (e.g. `assets/adrianna.jpg`) to replace the gold `AW`
  monogram in the hero with the real photo.
- The eXp Realty wordmark in the hero is inline SVG, so it stays sharp at any density.
- Preview with any static server, e.g. `python3 -m http.server`, then open `http://localhost:8000`.
