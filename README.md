# Adrianna Wigzell - brick home teardown site

Static site (no build step). Scrolling takes a 3D brick luxury home apart: roof lifts, walls open,
floors separate to reveal labelled blueprints.

- `content.js` - all site text/colours/room labels. Edit this only.
- `house.js` - the 3D scene (three.js + GSAP from cdnjs).
- `index.html` - page.

Preview: `python3 -m http.server` then open http://localhost:8000
Content marked TODO in `content.js` still needs copying from adriannawigzell.exprealty.com.
