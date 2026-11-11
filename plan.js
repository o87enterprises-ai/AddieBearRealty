// Shared floor-plan geometry. Used by house.js (teardown) and tour.js (walkthrough).
// Reads window.SITE.floor. All units are FEET, origin at the front-left corner of the unit.
// Nothing here is a survey: walls are generated from the room rectangles in content.js.
window.PLAN = (function () {
  var EPS = 0.02;

  // Every rectangle contributes four edges. Edges that share a line are unioned first, so a
  // wall between two rooms is one wall, not two overlapping ones.
  function edges(rooms) {
    var lines = {};

    function add(o, at, a, b) {
      if (Math.abs(b - a) < 0.02) return;
      if (a > b) { var t = a; a = b; b = t; }
      var k = o + '|' + at.toFixed(2);
      (lines[k] = lines[k] || { o: o, at: at, iv: [] }).iv.push([a, b]);
    }

    rooms.forEach(function (r) {
      add('v', r.x, r.z, r.z + r.d);
      add('v', r.x + r.w, r.z, r.z + r.d);
      add('h', r.z, r.x, r.x + r.w);
      add('h', r.z + r.d, r.x, r.x + r.w);
    });

    var out = [];
    Object.keys(lines).forEach(function (k) {
      var L = lines[k];
      L.iv.sort(function (p, q) { return p[0] - q[0]; });
      var merged = [];
      L.iv.forEach(function (p) {
        var last = merged[merged.length - 1];
        if (last && p[0] <= last[1] + 0.001) {
          if (p[1] > last[1]) last[1] = p[1];
        } else {
          merged.push([p[0], p[1]]);
        }
      });
      merged.forEach(function (p) { out.push({ o: L.o, at: L.at, a: p[0], b: p[1] }); });
    });
    return out;
  }

  // Knock door/window gaps out of a wall line, returning the remaining spans.
  function subtract(seg, gaps) {
    var spans = [[seg.a, seg.b]];
    gaps.forEach(function (g) {
      if (g.o !== seg.o || Math.abs(g.at - seg.at) > 0.05) return;
      var next = [];
      spans.forEach(function (p) {
        if (g.b <= p[0] + 0.001 || g.a >= p[1] - 0.001) { next.push(p); return; }
        if (g.a > p[0]) next.push([p[0], g.a]);
        if (g.b < p[1]) next.push([g.b, p[1]]);
      });
      spans = next;
    });
    return spans.filter(function (p) { return p[1] - p[0] > 0.15; });
  }

  // Wall segments as {x1,z1,x2,z2,ext}. ext = sits on the building perimeter.
  function walls(spec) {
    var W = spec.width, D = spec.depth;
    var gaps = (spec.doors || []).concat(spec.windows || []);
    var out = [];
    edges(spec.rooms).forEach(function (seg) {
      subtract(seg, gaps).forEach(function (p) {
        var ext = (seg.o === 'v' && (Math.abs(seg.at) < EPS || Math.abs(seg.at - W) < EPS)) ||
                  (seg.o === 'h' && (Math.abs(seg.at) < EPS || Math.abs(seg.at - D) < EPS));
        out.push(seg.o === 'v'
          ? { x1: seg.at, z1: p[0], x2: seg.at, z2: p[1], ext: ext }
          : { x1: p[0], z1: seg.at, x2: p[1], z2: seg.at, ext: ext });
      });
    });
    return out;
  }

  // Which room contains this point (used for the walkthrough room label).
  function roomAt(spec, x, z) {
    for (var i = 0; i < spec.rooms.length; i++) {
      var r = spec.rooms[i];
      if (x >= r.x && x <= r.x + r.w && z >= r.z && z <= r.z + r.d) return r;
    }
    return null;
  }

  return { edges: edges, walls: walls, roomAt: roomAt };
})();
