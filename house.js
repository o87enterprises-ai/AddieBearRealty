// Single-level teardown for 11490 SW Crown Dr #2.
// Scroll: roof lifts -> brick shell opens -> partitions settle -> the floor plan reads.
(function () {
  var c = document.getElementById('dx-stage');
  if (!c || !window.THREE || !window.gsap || !window.ScrollTrigger || !window.SITE || !window.SITE.floor || !window.PLAN) return;
  document.documentElement.classList.add('js3d');
  gsap.registerPlugin(ScrollTrigger);

  var S = window.SITE, F = S.floor, L = S.listing || {};
  var W = F.width, D = F.depth, H = 8.4, T = 0.55;
  var accent = S.blueprint || '#0a2a66';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var r = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: true, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  if (THREE.sRGBEncoding) r.outputEncoding = THREE.sRGBEncoding;

  var scene = new THREE.Scene();
  var cam = new THREE.PerspectiveCamera(34, 1, 0.5, 900);
  cam.position.set(W / 2 + 50, 36, D / 2 + 62);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7a5c, 1.0));
  var sun = new THREE.DirectionalLight(0xfff3e0, 0.9);
  sun.position.set(46, 76, 24); scene.add(sun);
  var fill = new THREE.DirectionalLight(0xdce8ff, 0.38);
  fill.position.set(-48, 28, -36); scene.add(fill);

  /* ---------------- canvas textures ---------------- */
  function cv(w, h) { var e = document.createElement('canvas'); e.width = w; e.height = h; return e; }
  function rep(canvas, rx, ry) {
    var t = new THREE.CanvasTexture(canvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rx || 1, ry || 1);
    t.anisotropy = 4;
    return t;
  }

  var brickCanvas = (function () {
    var e = cv(512, 256), g = e.getContext('2d');
    g.fillStyle = '#c9bcaa'; g.fillRect(0, 0, 512, 256);
    var rows = 8, cols = 4, bh = 256 / rows, bw = 512 / cols;
    for (var y = 0; y < rows; y++) {
      var off = (y % 2) ? bw / 2 : 0;
      for (var x = -1; x <= cols; x++) {
        var t = y * 41 + x * 67;
        g.fillStyle = 'hsl(' + (9 + t % 11) + ',' + (33 + t % 15) + '%,' + (32 + t % 12) + '%)';
        g.fillRect(x * bw + off + 2, y * bh + 2, bw - 4, bh - 4);
      }
    }
    return e;
  })();

  var shingleCanvas = (function () {
    var e = cv(512, 512), g = e.getContext('2d');
    g.fillStyle = '#37372f'; g.fillRect(0, 0, 512, 512);
    var rows = 16, bh = 512 / rows;
    for (var y = 0; y < rows; y++) {
      var base = 'hsl(32,' + (4 + y % 6) + '%,' + (21 + y % 8) + '%)';
      g.fillStyle = base; g.fillRect(0, y * bh, 512, bh - 1);
      g.fillStyle = 'rgba(0,0,0,.25)';
      g.fillRect(0, y * bh + bh - 2, 512, 2);
    }
    return e;
  })();

  var woodCanvas = (function () {
    var e = cv(512, 512), g = e.getContext('2d');
    g.fillStyle = '#b79a70'; g.fillRect(0, 0, 512, 512);
    for (var y = 0; y < 8; y++) {
      for (var x = 0; x < 3; x++) {
        var t = y * 19 + x * 47;
        g.fillStyle = 'hsl(' + (32 + t % 8) + ',' + (26 + t % 12) + '%,' + (55 + t % 11) + '%)';
        g.fillRect(x * 170 + 1, y * 64 + 1, 168, 62);
      }
    }
    g.globalAlpha = 0.12; g.strokeStyle = '#4a3720'; g.lineWidth = 1;
    for (var i = 0; i < 60; i++) {
      var yy = Math.random() * 512;
      g.beginPath(); g.moveTo(0, yy);
      g.bezierCurveTo(160, yy + 6, 340, yy - 8, 512, yy + 2);
      g.stroke();
    }
    g.globalAlpha = 1;
    return e;
  })();

  var grassCanvas = (function () {
    var e = cv(256, 256), g = e.getContext('2d');
    g.fillStyle = '#7c8c55'; g.fillRect(0, 0, 256, 256);
    for (var i = 0; i < 2400; i++) {
      var t = Math.random();
      g.fillStyle = 'hsla(' + (72 + t * 26) + ',' + (22 + t * 18) + '%,' + (26 + t * 22) + '%,.55)';
      g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
    return e;
  })();

  var concCanvas = (function () {
    var e = cv(256, 256), g = e.getContext('2d');
    g.fillStyle = '#cec8bc'; g.fillRect(0, 0, 256, 256);
    for (var i = 0; i < 1500; i++) {
      g.fillStyle = 'rgba(' + (90 + Math.random() * 90 | 0) + ',' + (84 + Math.random() * 80 | 0) + ',' + (74 + Math.random() * 70 | 0) + ',.25)';
      g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
    return e;
  })();

  /* ---------------- blueprint ---------------- */
  function blueprintCanvas() {
    var px = 50, e = cv(W * px, D * px), g = e.getContext('2d');
    var w = e.width, h = e.height;

    g.fillStyle = accent; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, 0, w, h);

    g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 1;
    for (var gx = 0; gx <= W; gx += 2) { g.beginPath(); g.moveTo(gx * px, 0); g.lineTo(gx * px, h); g.stroke(); }
    for (var gz = 0; gz <= D; gz += 2) { g.beginPath(); g.moveTo(0, gz * px); g.lineTo(w, gz * px); g.stroke(); }

    g.textAlign = 'center'; g.textBaseline = 'middle';
    F.rooms.forEach(function (rm) {
      var rx = rm.x * px, rz = rm.z * px, rw = rm.w * px, rd = rm.d * px;
      g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(rx, rz, rw, rd);
      g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 2; g.strokeRect(rx + 1, rz + 1, rw - 2, rd - 2);

      var size = Math.min(rw / (rm.name.length * 0.66), rd * 0.34, 36);
      size = Math.max(size, 12);
      g.fillStyle = '#ffffff';
      g.font = '600 ' + size.toFixed(0) + 'px Jost,Arial,sans-serif';
      g.fillText(rm.name.toUpperCase(), rx + rw / 2, rz + rd / 2 - size * 0.28, rw - 18);
      g.globalAlpha = 0.72;
      g.font = '400 ' + (size * 0.62).toFixed(0) + 'px Jost,Arial,sans-serif';
      g.fillText(rm.w + "' × " + rm.d + "'", rx + rw / 2, rz + rd / 2 + size * 0.68, rw - 18);
      g.globalAlpha = 1;
    });

    /* wall lines */
    g.strokeStyle = '#ffffff'; g.lineCap = 'butt';
    window.PLAN.walls(F).forEach(function (wl) {
      g.lineWidth = wl.ext ? 11 : 7;
      g.beginPath();
      g.moveTo(wl.x1 * px, wl.z1 * px);
      g.lineTo(wl.x2 * px, wl.z2 * px);
      g.stroke();
    });

    /* door swings */
    (F.doors || []).forEach(function (dr) {
      var rad = (dr.b - dr.a) * px;
      g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 2;
      g.beginPath();
      if (dr.o === 'h') {
        g.arc(dr.a * px, dr.at * px, rad, 0, Math.PI / 2);
      } else {
        g.arc(dr.at * px, dr.a * px, rad, Math.PI / 2, Math.PI);
      }
      g.stroke();
    });

    /* windows */
    g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 3;
    (F.windows || []).forEach(function (wn) {
      var o = 6;
      if (wn.o === 'h') {
        g.beginPath();
        g.moveTo(wn.a * px, wn.at * px - o); g.lineTo(wn.b * px, wn.at * px - o);
        g.moveTo(wn.a * px, wn.at * px + o); g.lineTo(wn.b * px, wn.at * px + o);
        g.stroke();
      } else {
        g.beginPath();
        g.moveTo(wn.at * px - o, wn.a * px); g.lineTo(wn.at * px - o, wn.b * px);
        g.moveTo(wn.at * px + o, wn.a * px); g.lineTo(wn.at * px + o, wn.b * px);
        g.stroke();
      }
    });

    /* title block */
    var bw = Math.min(700, w - 60), bh = 132;
    g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(30, h - bh - 30, bw, bh);
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 2; g.strokeRect(30, h - bh - 30, bw, bh);
    g.textAlign = 'left';
    g.fillStyle = '#ffffff';
    g.font = '600 30px Jost,Arial,sans-serif';
    g.fillText((L.address || '—').toUpperCase(), 52, h - bh + 30);
    g.globalAlpha = 0.8;
    g.font = '400 21px Jost,Arial,sans-serif';
    g.fillText((L.city || '') + ', ' + (L.state || '') + ' ' + (L.zip || '') + '   ·   MAIN FLOOR', 52, h - bh + 64);
    g.fillText((L.sqft || '') + ' SQ FT   ·   APPROXIMATE LAYOUT   ·   NOT A SURVEY', 52, h - bh + 96);
    g.globalAlpha = 1;

    /* north arrow + scale bar */
    g.save();
    g.translate(w - 74, 62);
    g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 2;
    g.beginPath(); g.arc(0, 0, 26, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#ffffff';
    g.beginPath(); g.moveTo(0, -18); g.lineTo(7, 10); g.lineTo(0, 4); g.lineTo(-7, 10); g.closePath(); g.fill();
    g.font = '600 12px Jost,Arial,sans-serif'; g.textAlign = 'center';
    g.fillText('N', 0, -34);
    g.restore();

    var sbx = w - 260, sby = h - 54;
    g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 2;
    g.strokeRect(sbx, sby, 5 * px, 8);
    g.font = '400 14px Jost,Arial,sans-serif'; g.textAlign = 'center';
    g.fillStyle = '#ffffff';
    g.fillText('5 FT', sbx + 2.5 * px, sby - 8);

    return e;
  }

  /* ---------------- scene ---------------- */
  var house = new THREE.Group(); scene.add(house);

  var ground = new THREE.Mesh(
    new THREE.PlaneGeometry(620, 620),
    new THREE.MeshStandardMaterial({ map: rep(grassCanvas, 72, 72), roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(W / 2, -0.36, D / 2);
  scene.add(ground);

  var slab = new THREE.Mesh(
    new THREE.BoxGeometry(W + 1.6, 0.62, D + 1.6),
    new THREE.MeshStandardMaterial({ color: 0xd7d1c4, roughness: 0.95 })
  );
  slab.position.set(W / 2, -0.31, D / 2);
  house.add(slab);

  var floorMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(W - 0.1, D - 0.1),
    new THREE.MeshStandardMaterial({ map: rep(woodCanvas, 7, 5), roughness: 0.8 })
  );
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.set(W / 2, 0.02, D / 2);
  house.add(floorMesh);

  var bpTex = new THREE.CanvasTexture(blueprintCanvas());
  bpTex.anisotropy = 8;
  var bp = new THREE.Mesh(
    new THREE.PlaneGeometry(W - 0.3, D - 0.3),
    new THREE.MeshBasicMaterial({ map: bpTex, transparent: true, opacity: 0, depthWrite: false })
  );
  bp.rotation.x = -Math.PI / 2;
  bp.position.set(W / 2, 0.11, D / 2);
  house.add(bp);

  /* exterior brick shell */
  var ext = [];
  [
    { len: W, x: W / 2, z: 0, rot: 0, nx: 0, nz: -1 },
    { len: W, x: W / 2, z: D, rot: 0, nx: 0, nz: 1 },
    { len: D, x: 0, z: D / 2, rot: Math.PI / 2, nx: -1, nz: 0 },
    { len: D, x: W, z: D / 2, rot: Math.PI / 2, nx: 1, nz: 0 }
  ].forEach(function (wd) {
    var g = new THREE.Group();
    g.position.set(wd.x, 0, wd.z);
    g.rotation.y = wd.rot;
    var t = new THREE.CanvasTexture(brickCanvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(wd.len / 2.67, H / 1.5);
    t.anisotropy = 4;
    var m = new THREE.Mesh(
      new THREE.BoxGeometry(wd.len, H, T),
      new THREE.MeshStandardMaterial({ map: t, roughness: 0.95, transparent: true })
    );
    m.position.y = H / 2;
    g.add(m);
    house.add(g);
    ext.push({ g: g, bx: wd.x, bz: wd.z, nx: wd.nx, nz: wd.nz });
  });

  /* brick above and below every opening so the shell stays solid */
  function fillPiece(side, a, b, y0, hh) {
    if (hh < 0.05) return;
    var grp = ext[side].g, len = b - a, mat = grp.children[0].material, m;
    if (side < 2) {
      m = new THREE.Mesh(new THREE.BoxGeometry(len, hh, T), mat);
      m.position.set((a + b) / 2 - W / 2, y0 + hh / 2, 0);
    } else {
      m = new THREE.Mesh(new THREE.BoxGeometry(T, hh, len), mat);
      m.position.set(D / 2 - (a + b) / 2, y0 + hh / 2, 0);
    }
    grp.add(m);
  }
  (F.windows || []).forEach(function (wn) {
    var side = wn.o === 'h' ? (wn.at === 0 ? 0 : 1) : (wn.at === 0 ? 2 : 3);
    var sill = wn.sill || 3, head = wn.head || 7;
    fillPiece(side, wn.a, wn.b, 0, sill);
    fillPiece(side, wn.a, wn.b, head, H - head);
  });
  (F.doors || []).forEach(function (dr) {
    if (dr.slider) fillPiece(0, dr.a, dr.b, 7.2, H - 7.2);
    if (dr.front) fillPiece(1, dr.a, dr.b, 7.25, H - 7.25);
  });

  /* openings: glass + frames, fading with the shell */
  var shell = new THREE.Group(); house.add(shell);

  function addWindow(spec) {
    var len = spec.b - spec.a;
    var sill = spec.sill || 3, head = spec.head || 7;
    var hh = head - sill;
    var g = new THREE.Group();
    var glass = new THREE.Mesh(
      new THREE.PlaneGeometry(len, hh),
      new THREE.MeshStandardMaterial({ color: 0x9dc0d2, roughness: 0.12, metalness: 0.45, transparent: true, opacity: 0.88, side: THREE.DoubleSide })
    );
    g.add(glass);
    var fm = new THREE.MeshStandardMaterial({ color: 0xf7f3ec, roughness: 0.6, transparent: true });
    function bar(x, y, bw, bh) {
      var m = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.16), fm);
      m.position.set(x, y, 0.06); g.add(m);
    }
    bar(0, hh / 2 - 0.1, len, 0.2);
    bar(0, -hh / 2 + 0.1, len, 0.2);
    bar(-len / 2 + 0.1, 0, 0.2, hh);
    bar(len / 2 - 0.1, 0, 0.2, hh);
    bar(0, 0, 0.09, hh);

    var cx = (spec.a + spec.b) / 2, cy = sill + hh / 2;
    if (spec.o === 'h') {
      g.position.set(cx, cy, spec.at === 0 ? -T / 2 - 0.02 : D + T / 2 + 0.02);
      g.rotation.y = spec.at === 0 ? 0 : Math.PI;
    } else {
      g.position.set(spec.at === 0 ? -T / 2 - 0.02 : W + T / 2 + 0.02, cy, cx);
      g.rotation.y = Math.PI / 2;
    }
    shell.add(g);
  }

  (F.windows || []).forEach(addWindow);

  function addSlider(dr) {
    var len = dr.b - dr.a, hh = 7.2;
    var g = new THREE.Group();
    var glass = new THREE.Mesh(
      new THREE.PlaneGeometry(len, hh),
      new THREE.MeshStandardMaterial({ color: 0xa9cadb, roughness: 0.08, metalness: 0.4, transparent: true, opacity: 0.9, side: THREE.DoubleSide })
    );
    glass.position.y = hh / 2 + 0.05;
    g.add(glass);
    var fm = new THREE.MeshStandardMaterial({ color: 0xf7f3ec, roughness: 0.6, transparent: true });
    function bar(x, y, bw, bh) {
      var m = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.18), fm);
      m.position.set(x, y, 0.06); g.add(m);
    }
    bar(0, hh + 0.05, len, 0.22);
    bar(0, 0.14, len, 0.22);
    bar(-len / 2 + 0.11, hh / 2, 0.22, hh);
    bar(len / 2 - 0.11, hh / 2, 0.22, hh);
    bar(0, hh / 2, 0.12, hh);
    g.position.set((dr.a + dr.b) / 2, 0, dr.at === 0 ? -T / 2 - 0.02 : D + T / 2 + 0.02);
    g.rotation.y = dr.at === 0 ? 0 : Math.PI;
    shell.add(g);
  }

  (F.doors || []).forEach(function (dr) { if (dr.slider) addSlider(dr); });

  (F.doors || []).forEach(function (dr) {
    if (!dr.front) return;
    var len = dr.b - dr.a;
    var panel = new THREE.Mesh(
      new THREE.BoxGeometry(len - 0.3, 7.1, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x5c4630, roughness: 0.7, transparent: true })
    );
    panel.position.set((dr.a + dr.b) / 2, 3.6, D + T / 2 + 0.05);
    shell.add(panel);
    var fm = new THREE.MeshStandardMaterial({ color: 0xf7f3ec, roughness: 0.6, transparent: true });
    var casing = new THREE.Mesh(new THREE.BoxGeometry(len + 0.4, 0.26, 0.2), fm);
    casing.position.set((dr.a + dr.b) / 2, 7.22, D + T / 2 + 0.06);
    shell.add(casing);
    [-1, 1].forEach(function (s) {
      var jamb = new THREE.Mesh(new THREE.BoxGeometry(0.24, 7.4, 0.2), fm);
      jamb.position.set((dr.a + dr.b) / 2 + s * (len / 2 + 0.1), 3.7, D + T / 2 + 0.06);
      shell.add(jamb);
    });
    var knob = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0xc8a24a, metalness: 0.8, roughness: 0.35, transparent: true })
    );
    knob.position.set(dr.b - 0.45, 3.4, D + T / 2 + 0.14);
    shell.add(knob);

    var stoop = new THREE.Mesh(
      new THREE.BoxGeometry(len + 2, 0.3, 3),
      new THREE.MeshStandardMaterial({ map: rep(concCanvas, 2, 1), roughness: 0.95 })
    );
    stoop.position.set((dr.a + dr.b) / 2, -0.18, D + 1.9);
    house.add(stoop);
  });

  /* interior partitions */
  var iMat = new THREE.MeshStandardMaterial({ color: 0xf4eee3, roughness: 0.95, transparent: true });
  var interior = [];
  window.PLAN.walls(F).forEach(function (wl) {
    if (wl.ext) return;
    var len = Math.hypot(wl.x2 - wl.x1, wl.z2 - wl.z1);
    if (len < 0.2) return;
    var m = new THREE.Mesh(new THREE.BoxGeometry(len, 8, 0.4), iMat);
    m.position.set((wl.x1 + wl.x2) / 2, 4, (wl.z1 + wl.z2) / 2);
    if (Math.abs(wl.x2 - wl.x1) < 0.01) m.rotation.y = Math.PI / 2;
    house.add(m);
    interior.push(m);
  });

  /* roof: shallow gable, composition shingle */
  var roof = new THREE.Group(); house.add(roof);
  var rise = 3.6, over = 1.2, half = D / 2, pitch = rise / half;
  var ang = Math.atan(pitch);
  var slope = (half + over) / Math.cos(ang);

  function roofSheet(zc, yc, rot) {
    var t = new THREE.CanvasTexture(shingleCanvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set((W + 2.4) / 5, slope / 5);
    var m = new THREE.Mesh(
      new THREE.BoxGeometry(W + 2.4, 0.42, slope),
      new THREE.MeshStandardMaterial({ map: t, roughness: 0.95, transparent: true })
    );
    m.position.set(W / 2, yc, zc);
    m.rotation.x = rot;
    roof.add(m);
  }
  roofSheet((half - over) / 2, H + pitch * ((half - over) / 2), -ang);
  roofSheet((half + D + over) / 2, H + rise - pitch * ((D + over - half) / 2), ang);

  var gableShape = new THREE.Shape();
  gableShape.moveTo(0, 0);
  gableShape.lineTo(D, 0);
  gableShape.lineTo(D / 2, rise);
  gableShape.closePath();
  [0, W].forEach(function (x) {
    var t = new THREE.CanvasTexture(brickCanvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1 / 2.67, 1 / 1.5);
    var gable = new THREE.Mesh(
      new THREE.ShapeGeometry(gableShape),
      new THREE.MeshStandardMaterial({ map: t, roughness: 0.95, transparent: true, side: THREE.DoubleSide })
    );
    gable.rotation.y = -Math.PI / 2;
    gable.position.set(x, H, 0);
    roof.add(gable);
  });

  var fasciaMat = new THREE.MeshStandardMaterial({ color: 0xf3ede2, roughness: 0.8, transparent: true });
  [-over - 0.1, D + over + 0.1].forEach(function (z) {
    var f = new THREE.Mesh(new THREE.BoxGeometry(W + 2.8, 0.5, 0.34), fasciaMat);
    f.position.set(W / 2, H - 0.06, z);
    roof.add(f);
  });

  /* ---------------- site ---------------- */
  var concMat = new THREE.MeshStandardMaterial({ map: rep(concCanvas, 4, 3), roughness: 0.95 });

  var patio = new THREE.Mesh(new THREE.BoxGeometry(20, 0.34, 10), concMat);
  patio.position.set(W / 2 - 1, -0.19, -5.4);
  house.add(patio);

  var hedgeMat = new THREE.MeshStandardMaterial({ color: 0x4d6b3d, roughness: 1 });
  [-9.6, -4.6].forEach(function (x, i) {
    var hedge = new THREE.Mesh(new THREE.BoxGeometry(i ? 9 : 5, 1.5, 1.6), hedgeMat);
    hedge.position.set(x, 0.6, -10.5);
    house.add(hedge);
  });

  var pond = new THREE.Mesh(
    new THREE.CircleGeometry(2.4, 26),
    new THREE.MeshStandardMaterial({ color: 0x3d5c66, roughness: 0.25, metalness: 0.3 })
  );
  pond.rotation.x = -Math.PI / 2;
  pond.position.set(W - 5, -0.02, -7.6);
  house.add(pond);

  var walkway = new THREE.Mesh(new THREE.BoxGeometry(3, 0.16, D + 18), concMat);
  walkway.position.set(-3.6, -0.24, D / 2 - 2);
  house.add(walkway);

  /* carport on the parking side */
  var carport = new THREE.Group(); house.add(carport);
  var canopy = new THREE.Mesh(new THREE.BoxGeometry(16, 0.34, 12), new THREE.MeshStandardMaterial({ color: 0x4a453c, roughness: 0.9 }));
  canopy.position.set(W / 2 - 4, 8.4, D + 7.4);
  carport.add(canopy);
  [[-7.4, -5.4], [-7.4, 5.4], [7.4, -5.4], [7.4, 5.4]].forEach(function (p) {
    var post = new THREE.Mesh(new THREE.BoxGeometry(0.42, 8.4, 0.42), new THREE.MeshStandardMaterial({ color: 0x6c6458, roughness: 0.9 }));
    post.position.set(W / 2 - 4 + p[0], 4.2, D + 7.4 + p[1]);
    carport.add(post);
  });
  var pad = new THREE.Mesh(new THREE.BoxGeometry(16, 0.2, 12), concMat);
  pad.position.set(W / 2 - 4, -0.24, D + 7.4);
  carport.add(pad);

  /* a couple of trees for scale */
  function tree(x, z, s) {
    var g = new THREE.Group();
    var trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22 * s, 0.3 * s, 3.4 * s, 8),
      new THREE.MeshStandardMaterial({ color: 0x6b533a, roughness: 0.95 })
    );
    trunk.position.y = 1.7 * s; g.add(trunk);
    var leaf = new THREE.Mesh(
      new THREE.SphereGeometry(2.1 * s, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0x5d7a45, roughness: 1 })
    );
    leaf.position.y = 4.3 * s; leaf.scale.y = 0.92; g.add(leaf);
    g.position.set(x, -0.3, z);
    house.add(g);
  }
  tree(-7, 4, 1.05);
  tree(W + 7, -4, 0.95);

  /* ---------------- camera + scroll ---------------- */
  var s = { roof: 0, walls: 0, plan: 0, orbit: 0, dragAz: 0, dragEl: 0 };
  var hud = document.getElementById('dx-hud');
  var fsActive = false, fsP = 0;

  function size() {
    var el = c.parentNode || c;
    var w = el.clientWidth || c.clientWidth;
    var h = el.clientHeight || c.clientHeight;
    if (!w || !h) return;
    r.setSize(w, h, false);
    cam.aspect = w / h;
    cam.fov = cam.aspect < 1 ? 46 : 34;
    cam.updateProjectionMatrix();
  }

  function fade(obj, o) {
    var vis = o > 0.035;
    obj.visible = vis;
    if (!vis) return;
    obj.traverse(function (n) {
      if (n.material && n.material.transparent) n.material.opacity = Math.min(1, o);
    });
  }

  /* The animation is bigger than the shell: walls slide out past the footprint,
     the roof rises, the carport and plantings sit outside. So the camera is fitted
     to the live extents every frame instead of a fixed distance — it pulls back
     until all eight corners of the box clear a margin, and nothing gets clipped. */
  var SLIDE = 14, LIFT = 9, MARGIN = 0.94;
  var P1 = new THREE.Vector3(), P2 = new THREE.Vector3();

  function fit(az, elev) {
    var sl = SLIDE * s.walls;
    var x0 = Math.min(-14, -0.3 - sl), x1 = Math.max(43, W + 0.3 + sl);
    var z0 = Math.min(-13, -0.3 - sl), z1 = Math.max(39, D + 0.3 + sl);
    var y0 = -1.2, y1 = Math.max(12, H + rise + LIFT * s.roof);
    var cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    var ce = Math.cos(elev);
    var ox = Math.sin(az) * ce, oz = Math.cos(az) * ce;
    var d = 110, i, k, m;
    for (i = 0; i < 4; i++) {
      cam.position.set(cx + ox * d, Math.sin(elev) * (d + 40) + 3, cz + oz * d);
      cam.lookAt(cx, 3.4, cz);
      cam.updateMatrixWorld();
      m = 0;
      var cy = (y0 + y1) / 2;
      for (k = 0; k < 8; k++) {
        P1.set(k & 1 ? x1 : x0, k & 2 ? y1 : y0, k & 4 ? z1 : z0);
        P2.copy(P1).project(cam);
        m = Math.max(m, Math.abs(P2.x), Math.abs(P2.y));
      }
      if (m < 0.001) break;
      d *= m / MARGIN;
    }
  }

  function draw() {
    fit(0.62 + s.orbit * 1.15 + s.dragAz, Math.max(-0.45, Math.min(1.35, 0.36 + s.plan * 0.62 + s.dragEl)));

    roof.position.y = s.roof * LIFT;
    fade(roof, 1 - s.roof * 0.98);

    ext.forEach(function (w) {
      w.g.position.x = w.bx + w.nx * s.walls * SLIDE;
      w.g.position.z = w.bz + w.nz * s.walls * SLIDE;
    });
    fade(shell, 1 - s.walls);
    fade(ext[0].g, 1 - s.walls);
    fade(ext[1].g, 1 - s.walls);
    fade(ext[2].g, 1 - s.walls);
    fade(ext[3].g, 1 - s.walls);

    var k = 1 - s.plan * 0.74;
    interior.forEach(function (m) {
      m.scale.y = k;
      m.position.y = 4 * k;
    });
    iMat.opacity = 1 - s.plan * 0.3;

    bp.material.opacity = Math.max(0, Math.min(1, (s.plan - 0.12) / 0.5));

    if (hud) {
      var msg;
      if (s.plan > 0.45) msg = 'Approximate plan · ' + ((L.sqft || '') + ' sq ft');
      else if (s.walls > 0.12) msg = 'Opening the walls';
      else if (s.roof > 0.05) msg = 'Lifting the roof';
      else msg = fsActive ? 'Drag to rotate · swipe to explore' : (hud.getAttribute('data-idle') || 'Scroll to step inside');
      hud.textContent = msg;
    }

    r.render(scene, cam);
  }

  size();
  if (window.ResizeObserver) new ResizeObserver(function () { size(); draw(); }).observe(c.parentNode || c);
  else window.addEventListener('resize', function () { size(); draw(); });

  /* One 0..1 progress maps to all teardown stages, so the scroll pin and the
     full-screen explorer share identical timing. p≈0 shows the real listing
     photo, which cross-dissolves into the intact 3D model as you scroll in. */
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function eIO(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
  function eSine(x) { return -(Math.cos(Math.PI * x) - 1) / 2; }
  var dxPhoto = document.getElementById('dx-photo');
  var photoOn = dxPhoto && dxPhoto.getAttribute('data-on') === '1';
  function setProgress(p) {
    p = clamp01(p);
    var t = p * 40;
    s.roof  = eIO(clamp01((t - 4.5) / 18));
    s.walls = eIO(clamp01((t - 9) / 20));
    s.plan  = eIO(clamp01((t - 18) / 22));
    s.orbit = eSine(clamp01((t - 13) / 27));
    if (photoOn) {
      var pv = 1 - clamp01(p / 0.10);
      dxPhoto.style.opacity = pv;
      dxPhoto.style.transform = 'scale(' + (1 + (1 - pv) * 0.05) + ')';
    }
    draw();
  }

  /* ---------- full-screen explorer ---------- */
  var frame = document.getElementById('dx-frame');
  var closeBtn = document.getElementById('dx-close');
  var viewListingBtn = document.getElementById('dx-viewlisting');
  var listingBackBtn = document.getElementById('dx-listing-back');
  var listingEl = document.getElementById('dx-listing');
  var listingActive = false;
  function enterFS() {
    if (fsActive || !frame) return;
    fsActive = true;
    frame.classList.add('fs');
    document.body.classList.add('dx-fs');
    c.style.cursor = 'grab';
    size(); draw();
  }
  function exitFS() {
    if (!fsActive) return;
    hideListing();
    fsActive = false;
    frame.classList.remove('fs');
    document.body.classList.remove('dx-fs');
    c.style.cursor = '';
    size();
    if (window.ScrollTrigger) ScrollTrigger.update();
    draw();
  }
  function showListing() {
    if (!fsActive || listingActive) return;
    listingActive = true;
    frame.classList.add('dx-on-listing');
    if (listingEl) listingEl.setAttribute('aria-hidden', 'false');
  }
  function hideListing() {
    if (!listingActive) return;
    listingActive = false;
    frame.classList.remove('dx-on-listing');
    if (listingEl) listingEl.setAttribute('aria-hidden', 'true');
  }
  if (closeBtn) closeBtn.addEventListener('click', function (e) { e.stopPropagation(); exitFS(); });
  if (viewListingBtn) viewListingBtn.addEventListener('click', function (e) { e.stopPropagation(); showListing(); });
  if (listingBackBtn) listingBackBtn.addEventListener('click', function (e) { e.stopPropagation(); hideListing(); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (listingActive) hideListing();
    else exitFS();
  });

  /* tap the preview to open full screen; inside, drag to rotate and
     swipe / wheel to run the teardown. */
  if (!reduce) {
    var pd = { on: false, x: 0, y: 0, px: 0, py: 0, t: 0, moved: false };
    c.addEventListener('pointerdown', function (e) {
      pd.on = true; pd.x = pd.px = e.clientX; pd.y = pd.py = e.clientY;
      pd.t = Date.now(); pd.moved = false;
      if (fsActive) { c.style.cursor = 'grabbing'; try { c.setPointerCapture(e.pointerId); } catch (_) {} }
    });
    c.addEventListener('pointermove', function (e) {
      if (!pd.on) return;
      if (Math.abs(e.clientX - pd.x) + Math.abs(e.clientY - pd.y) > 8) pd.moved = true;
      if (fsActive) {
        s.dragAz += (e.clientX - pd.px) * 0.006;
        fsP = clamp01(fsP + (e.clientY - pd.py) * 0.0018);
        pd.px = e.clientX; pd.py = e.clientY;
        setProgress(fsP);
      }
    });
    var pend = function (e) {
      if (!pd.on) return;
      pd.on = false;
      if (fsActive) { c.style.cursor = 'grab'; try { c.releasePointerCapture(e.pointerId); } catch (_) {} }
      else if (!pd.moved && Date.now() - pd.t < 500) enterFS();
    };
    c.addEventListener('pointerup', pend);
    c.addEventListener('pointercancel', function () { pd.on = false; });
    c.addEventListener('wheel', function (e) {
      if (!fsActive) return;
      e.preventDefault();
      fsP = clamp01(fsP + (e.deltaY > 0 ? 0.045 : -0.045));
      setProgress(fsP);
    }, { passive: false });
  }

  if (reduce) {
    setProgress(1);
  } else {
    ScrollTrigger.create({
      trigger: '#dx-pin',
      start: 'top top',
      end: '+=240%',
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: function (self) { if (!fsActive) { fsP = self.progress; setProgress(self.progress); } },
      onToggle: function (self) { document.body.classList.toggle('is-pinned', self.isActive); }
    });
    setProgress(0);
  }
})();
