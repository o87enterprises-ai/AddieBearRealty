// First-person walkthrough of the single-floor condo.
// Geometry comes from window.SITE.floor via window.PLAN — the same source as the teardown.
(function () {
  var c = document.getElementById('scene');
  var S = window.SITE, F = S && S.floor;
  if (!c || !F || !window.THREE || !window.PLAN) return;

  var W = F.width, D = F.depth, H = 8, EYE = 5.35, PR = 0.55, T = 0.45;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var r = new THREE.WebGLRenderer({ canvas: c, antialias: true, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  if (THREE.sRGBEncoding) r.outputEncoding = THREE.sRGBEncoding;

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0xb8b0a4);

  var cam = new THREE.PerspectiveCamera(68, 1, 0.12, 240);

  scene.add(new THREE.AmbientLight(0xfff4e8, 0.28));
  scene.add(new THREE.HemisphereLight(0xfff0d8, 0xa89270, 0.24));
  var sun = new THREE.DirectionalLight(0xfff6e6, 0.5);
  sun.position.set(14, 26, -10); scene.add(sun);

  /* ---------------- materials ---------------- */
  function cv(w, h) { var e = document.createElement('canvas'); e.width = w; e.height = h; return e; }

  var plankCanvas = (function () {
    var e = cv(256, 256), g = e.getContext('2d');
    g.fillStyle = '#b99b70'; g.fillRect(0, 0, 256, 256);
    for (var y = 0; y < 4; y++) {
      for (var x = 0; x < 2; x++) {
        var t = y * 23 + x * 61;
        g.fillStyle = 'hsl(' + (33 + t % 7) + ',' + (26 + t % 9) + '%,' + (58 + t % 8) + '%)';
        g.fillRect(x * 128 + 1, y * 64 + 1, 126, 62);
      }
    }
    g.globalAlpha = 0.1; g.strokeStyle = '#4a3720';
    for (var i = 0; i < 26; i++) {
      var yy = Math.random() * 256;
      g.beginPath(); g.moveTo(0, yy); g.bezierCurveTo(80, yy + 4, 170, yy - 5, 256, yy + 1); g.stroke();
    }
    g.globalAlpha = 1;
    return e;
  })();

  var tileCanvas = (function () {
    var e = cv(256, 256), g = e.getContext('2d');
    g.fillStyle = '#d9d4c9'; g.fillRect(0, 0, 256, 256);
    g.strokeStyle = 'rgba(120,114,104,.45)'; g.lineWidth = 2;
    for (var i = 0; i <= 2; i++) {
      g.beginPath(); g.moveTo(i * 128, 0); g.lineTo(i * 128, 256); g.stroke();
      g.beginPath(); g.moveTo(0, i * 128); g.lineTo(256, i * 128); g.stroke();
    }
    return e;
  })();

  function tex(canvas, rx, ry) {
    var t = new THREE.CanvasTexture(canvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rx || 1, ry || 1);
    t.anisotropy = 4;
    return t;
  }

  var wallMat = new THREE.MeshStandardMaterial({ color: 0xf3ecdf, roughness: 0.96 });
  var trimMat = new THREE.MeshStandardMaterial({ color: 0xfbf7ef, roughness: 0.7 });
  var woodMat = new THREE.MeshStandardMaterial({ color: 0x9c7c52, roughness: 0.72 });
  var darkMat = new THREE.MeshStandardMaterial({ color: 0x2c2f33, roughness: 0.55 });
  var fabricMat = new THREE.MeshStandardMaterial({ color: 0x8d9aa2, roughness: 0.95 });
  var creamMat = new THREE.MeshStandardMaterial({ color: 0xded3c1, roughness: 0.95 });

  var solids = [];
  function solid(x0, z0, x1, z1) {
    solids.push({ x0: Math.min(x0, x1), z0: Math.min(z0, z1), x1: Math.max(x0, x1), z1: Math.max(z0, z1) });
  }

  function block(w, h, d, mat, x, y, z, ry) {
    var m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    if (ry) m.rotation.y = ry;
    scene.add(m);
    return m;
  }

  /* ---------------- shell ---------------- */
  window.PLAN.walls(F).forEach(function (wl) {
    var len = Math.hypot(wl.x2 - wl.x1, wl.z2 - wl.z1);
    if (len < 0.18) return;
    var m = new THREE.Mesh(new THREE.BoxGeometry(len, H, T), wallMat);
    m.position.set((wl.x1 + wl.x2) / 2, H / 2, (wl.z1 + wl.z2) / 2);
    if (Math.abs(wl.x2 - wl.x1) < 0.01) m.rotation.y = Math.PI / 2;
    scene.add(m);
    solid(wl.x1 - T / 2, wl.z1 - T / 2, wl.x2 + T / 2, wl.z2 + T / 2);
  });

  /* windows: hole is already in the wall; add sill + header + bright glazing */
  (F.windows || []).forEach(function (wn) {
    var len = wn.b - wn.a, sill = wn.sill || 3, head = wn.head || 7;
    function fill(h, y0) {
      if (h < 0.05) return;
      var m = new THREE.Mesh(
        new THREE.BoxGeometry(wn.o === 'h' ? len : T, h, wn.o === 'h' ? T : len),
        wallMat
      );
      if (wn.o === 'h') m.position.set((wn.a + wn.b) / 2, y0 + h / 2, wn.at);
      else m.position.set(wn.at, y0 + h / 2, (wn.a + wn.b) / 2);
      scene.add(m);
    }
    fill(sill, 0);
    fill(H - head, head);

    var glass = new THREE.Mesh(
      new THREE.PlaneGeometry(len, head - sill),
      new THREE.MeshStandardMaterial({ color: 0x7daec8, roughness: 0.08, metalness: 0.3, transparent: true, opacity: 0.68 })
    );
    var inner = T / 2 + 0.01;
    if (wn.o === 'h') {
      glass.position.set((wn.a + wn.b) / 2, (sill + head) / 2, wn.at === 0 ? inner : D - inner);
      glass.rotation.y = wn.at === 0 ? 0 : Math.PI;
    } else {
      glass.position.set(wn.at === 0 ? inner : W - inner, (sill + head) / 2, (wn.a + wn.b) / 2);
      glass.rotation.y = Math.PI / 2;
    }
    scene.add(glass);

    if (wn.o === 'h') block(len, 0.12, 0.1, trimMat, (wn.a + wn.b) / 2, (sill + head) / 2, wn.at + (wn.at === 0 ? inner : -inner));
    else block(0.1, 0.12, len, trimMat, wn.at + (wn.at === 0 ? inner : -inner), (sill + head) / 2, (wn.a + wn.b) / 2);
  });

  /* patio slider + front door leaves */
  (F.doors || []).forEach(function (dr) {
    var len = dr.b - dr.a;
    if (dr.slider) {
      var g = new THREE.Mesh(
        new THREE.PlaneGeometry(len, 7.1),
        new THREE.MeshStandardMaterial({ color: 0x7daec8, roughness: 0.08, metalness: 0.3, transparent: true, opacity: 0.68 })
      );
      g.position.set((dr.a + dr.b) / 2, 3.6, T / 2 + 0.02);
      scene.add(g);
      block(len, 0.16, 0.12, trimMat, (dr.a + dr.b) / 2, 7.15, T / 2 + 0.04);
      block(0.1, 7.2, 0.12, trimMat, (dr.a + dr.b) / 2, 3.6, T / 2 + 0.04);
    }
    if (dr.front) {
      block(len - 0.2, 7.1, 0.1, new THREE.MeshStandardMaterial({ color: 0x5c4630, roughness: 0.7 }),
        (dr.a + dr.b) / 2, 3.6, D - T / 2 - 0.06);
      block(0.1, 0.1, 0.24, new THREE.MeshStandardMaterial({ color: 0xc8a24a, metalness: 0.8, roughness: 0.35 }),
        dr.b - 0.4, 3.4, D - T / 2 - 0.16);
    }
  });

  /* ceiling */
  var ceil = new THREE.Mesh(
    new THREE.PlaneGeometry(W, D),
    new THREE.MeshStandardMaterial({ color: 0xfbf7ef, roughness: 1 })
  );
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(W / 2, H, D / 2);
  scene.add(ceil);

  /* floors, room by room */
  F.rooms.forEach(function (rm) {
    var mat;
    if (rm.kind === 'bath' || rm.kind === 'utility') {
      mat = new THREE.MeshStandardMaterial({ map: tex(tileCanvas, rm.w / 4, rm.d / 4), roughness: 0.7 });
    } else if (rm.kind === 'bed') {
      mat = new THREE.MeshStandardMaterial({ color: 0xb8a68c, roughness: 1 });
    } else if (rm.kind === 'closet' || rm.kind === 'hall') {
      mat = new THREE.MeshStandardMaterial({ map: tex(tileCanvas, rm.w / 3, rm.d / 3), roughness: 0.8 });
    } else {
      mat = new THREE.MeshStandardMaterial({ map: tex(plankCanvas, rm.w / 4, rm.d / 4), roughness: 0.75 });
    }
    var f = new THREE.Mesh(new THREE.PlaneGeometry(rm.w, rm.d), mat);
    f.rotation.x = -Math.PI / 2;
    f.position.set(rm.x + rm.w / 2, 0.015, rm.z + rm.d / 2);
    scene.add(f);

    /* ceiling light */
    var lamp = new THREE.Mesh(
      new THREE.CircleGeometry(0.62, 18),
      new THREE.MeshBasicMaterial({ color: 0xfff5df })
    );
    lamp.rotation.x = Math.PI / 2;
    lamp.position.set(rm.x + rm.w / 2, H - 0.06, rm.z + rm.d / 2);
    scene.add(lamp);
  });

  [[10, 7], [26, 12], [6.5, 19], [16.5, 19]].forEach(function (p) {
    var pl = new THREE.PointLight(0xfff0d8, 0.5, 26, 2);
    pl.position.set(p[0], 7.2, p[1]);
    scene.add(pl);
  });

  /* ---------------- furniture ---------------- */
  // Living: sofa facing a media wall on the west side
  block(11, 0.04, 9, creamMat, 5.6, 0.03, 9.4);
  block(3.2, 1.4, 8, fabricMat, 7.7, 0.7, 9.8);
  block(0.7, 1.6, 8, fabricMat, 9.1, 0.9, 9.8);
  block(3.2, 0.9, 0.8, fabricMat, 7.7, 1.1, 13.5);
  block(3.2, 0.9, 0.8, fabricMat, 7.7, 1.1, 6.1);
  solid(6.1, 5.7, 9.5, 14);
  block(2.2, 0.3, 4.4, woodMat, 4.3, 1.25, 9.6);
  [[3.4, 7.8], [5.2, 7.8], [3.4, 11.4], [5.2, 11.4]].forEach(function (p) {
    block(0.16, 1.2, 0.16, woodMat, p[0], 0.6, p[1]);
  });
  solid(3.2, 7.4, 5.4, 11.8);
  block(1.4, 1.6, 6, woodMat, 0.95, 0.8, 7);
  block(0.12, 3, 5.2, darkMat, 1.66, 4.1, 7);
  solid(0.4, 3.9, 1.7, 10.1);
  block(3, 1.3, 3, fabricMat, 12.6, 0.65, 3.2);
  solid(11.1, 1.7, 14.1, 4.7);
  var lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 5.4, 8), darkMat);
  lampPole.position.set(10, 2.7, 2); scene.add(lampPole);
  var shade = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.05, 1.1, 16, 1, true), creamMat);
  shade.position.set(10, 5.5, 2); scene.add(shade);
  solid(9.6, 1.6, 10.4, 2.4);

  // Dining
  block(6.2, 0.26, 3.2, woodMat, 26, 2.42, 4.6);
  [[23.4, 3.3], [28.6, 3.3], [23.4, 5.9], [28.6, 5.9]].forEach(function (p) {
    block(0.18, 2.4, 0.18, woodMat, p[0], 1.2, p[1]);
  });
  solid(22.9, 3, 29.1, 6.2);
  [[24.2, 2.4], [27.8, 2.4], [24.2, 6.8], [27.8, 6.8]].forEach(function (p) {
    block(1.5, 0.5, 1.5, fabricMat, p[0], 1.5, p[1]);
    block(1.5, 1.5, 0.2, fabricMat, p[0], 2.2, p[1] + (p[1] < 4.6 ? -0.65 : 0.65));
  });
  block(1.4, 2.9, 5, woodMat, 31.1, 1.45, 4.2);
  solid(30.3, 1.6, 31.8, 6.8);

  // Kitchen
  block(7.5, 2.9, 2.1, trimMat, 27.9, 1.45, 9.1);
  block(7.7, 0.24, 2.3, woodMat, 27.9, 2.95, 9.1);
  solid(24.1, 8, 31.8, 10.2);
  block(2, 2.9, 1.6, trimMat, 30.9, 1.45, 15);
  block(2.2, 0.24, 1.8, woodMat, 30.9, 2.95, 15);
  block(2.8, 6.3, 2.6, new THREE.MeshStandardMaterial({ color: 0xb9bcc0, metalness: 0.5, roughness: 0.4 }), 21.5, 3.15, 14.5);
  solid(20.1, 13.2, 22.9, 15.8);
  block(1.1, 0.14, 1.6, darkMat, 27.2, 3.1, 9.1);
  block(0.7, 0.1, 0.7, new THREE.MeshStandardMaterial({ color: 0x8f9498, metalness: 0.7, roughness: 0.3 }), 29.4, 3.06, 9.1);
  block(7.5, 2.4, 1.1, trimMat, 27.9, 5.4, 8.4);
  solid(24.1, 8, 31.8, 8.95);

  // Bedroom — bed against the interior wall, path in from the hall door stays clear
  block(6.8, 3.4, 0.4, woodMat, 6.5, 1.9, 14.3);
  block(6.6, 0.9, 7, woodMat, 6.5, 0.45, 17.7);
  block(6, 1.1, 6.4, trimMat, 6.5, 1.35, 17.8);
  block(1.9, 0.5, 1.4, creamMat, 4.4, 1.95, 15.3);
  block(1.9, 0.5, 1.4, creamMat, 8.6, 1.95, 15.3);
  solid(3.2, 14.3, 9.8, 21.3);
  block(1.6, 1.8, 1.6, woodMat, 2.1, 0.9, 15.2);
  block(1.6, 1.8, 1.6, woodMat, 10.9, 0.9, 15.2);
  solid(1.3, 14.4, 2.9, 16);
  solid(10.1, 14.4, 11.7, 16);
  block(2.6, 3.1, 1.4, woodMat, 11.3, 1.55, 23.2);
  solid(10, 22.5, 12.6, 23.9);
  block(8, 0.03, 3, new THREE.MeshStandardMaterial({ color: 0xc7b49a, roughness: 1 }), 6.5, 0.04, 19.6);

  // Hall (kept clear — four doorways open onto it)
  block(3.2, 0.02, 8, new THREE.MeshStandardMaterial({ color: 0x6f7d85, roughness: 1 }), 16.5, 0.03, 19);

  // Bath — tub on the north wall, vanity + WC south, 1.6 ft aisle between
  block(6.4, 1.5, 2.2, trimMat, 23.5, 0.75, 17.2);
  block(6.2, 4.2, 0.08, new THREE.MeshStandardMaterial({ color: 0xe6f0f4, roughness: 0.22 }), 23.5, 3.1, 18.3);
  solid(20.3, 16.1, 26.7, 18.35);
  block(3.4, 2.8, 1.1, woodMat, 22.7, 1.4, 20.45);
  block(3.6, 0.2, 1.3, trimMat, 22.7, 2.85, 20.45);
  block(0.9, 0.14, 0.5, new THREE.MeshStandardMaterial({ color: 0x9fa8ab, roughness: 0.3 }), 22.2, 2.94, 20.4);
  block(3.2, 2.4, 0.06, new THREE.MeshStandardMaterial({ color: 0xcfe0e6, metalness: 0.4, roughness: 0.15 }), 22.7, 4.5, 20.92);
  solid(21, 19.9, 24.4, 21);
  block(1.1, 1.3, 1.2, trimMat, 26.1, 0.65, 20.5);
  block(1.1, 1.5, 0.5, trimMat, 26.1, 2.1, 20.95);
  solid(25.55, 19.9, 26.65, 21.05);

  // Closet
  block(0.5, 6, 4.2, woodMat, 31.5, 3, 18.5);
  block(4.2, 1.3, 0.5, woodMat, 29.2, 5.4, 16.3);
  solid(31, 16.4, 31.9, 20.6);

  // Laundry
  block(2.3, 3, 2.2, trimMat, 22.4, 1.5, 22.75);
  block(2.3, 3, 2.2, trimMat, 25.1, 1.5, 22.75);
  block(2, 0.9, 1.9, new THREE.MeshStandardMaterial({ color: 0x8e9599, metalness: 0.4, roughness: 0.5 }), 22.4, 3.05, 22.75);
  block(2, 0.9, 1.9, new THREE.MeshStandardMaterial({ color: 0x8e9599, metalness: 0.4, roughness: 0.5 }), 25.1, 3.05, 22.75);
  solid(21.25, 21.65, 26.25, 23.85);
  block(4.6, 0.5, 0.9, woodMat, 29.6, 5.4, 23.2);

  /* ---------------- player ---------------- */
  var pos = new THREE.Vector3(15.6, EYE, 22.4);
  var yaw = 0, pitch = -0.04;
  var keys = {}, dragging = false, lx = 0, ly = 0;
  var current = null;

  function blocked(x, z) {
    if (x < PR || x > W - PR || z < PR || z > D - PR) return true;
    for (var i = 0; i < solids.length; i++) {
      var b = solids[i];
      if (x > b.x0 - PR && x < b.x1 + PR && z > b.z0 - PR && z < b.z1 + PR) return true;
    }
    return false;
  }

  function reset() {
    pos.set(15.6, EYE, 22.4); yaw = 0; pitch = -0.04;
  }

  addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { location.href = 'index.html'; return; }
    if (e.key.indexOf('Arrow') === 0 || e.code === 'KeyW' || e.code === 'KeyA' || e.code === 'KeyS' || e.code === 'KeyD' || e.code === 'Space') e.preventDefault();
    keys[e.code] = true;
    hideHint();
  });
  addEventListener('keyup', function (e) { keys[e.code] = false; });

  c.addEventListener('pointerdown', function (e) {
    dragging = true; lx = e.clientX; ly = e.clientY;
    try { c.setPointerCapture(e.pointerId); } catch (err) {}
    hideHint();
  });
  c.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    yaw -= (e.clientX - lx) * 0.0034;
    pitch -= (e.clientY - ly) * 0.0034;
    pitch = Math.max(-1.15, Math.min(1.15, pitch));
    lx = e.clientX; ly = e.clientY;
  });
  function endDrag() { dragging = false; }
  c.addEventListener('pointerup', endDrag);
  c.addEventListener('pointercancel', endDrag);
  c.addEventListener('pointerleave', endDrag);

  Array.prototype.forEach.call(document.querySelectorAll('#move button'), function (btn) {
    var k = btn.getAttribute('data-k');
    function on(e) { e.preventDefault(); keys[k] = true; hideHint(); }
    function off(e) { e.preventDefault(); keys[k] = false; }
    btn.addEventListener('pointerdown', on);
    btn.addEventListener('pointerup', off);
    btn.addEventListener('pointerleave', off);
    btn.addEventListener('pointercancel', off);
  });

  var hint = document.getElementById('hint');
  var hintTimer = null;
  function hideHint() {
    if (!hint || hint.classList.contains('gone')) return;
    clearTimeout(hintTimer);
    hintTimer = setTimeout(function () { hint.classList.add('gone'); }, 2600);
  }
  hideHint();

  /* start overlay */
  var start = document.getElementById('start');
  document.getElementById('go').addEventListener('click', function () {
    start.hidden = true;
    hideHint();
  });

  /* tools */
  var map = document.getElementById('minimap');
  var mg = map.getContext('2d');
  document.getElementById('btn-plan').addEventListener('click', function () {
    var on = this.getAttribute('aria-pressed') === 'true';
    this.setAttribute('aria-pressed', on ? 'false' : 'true');
    map.style.display = on ? 'none' : 'block';
    if (!on) sizeMap();
  });
  document.getElementById('btn-reset').addEventListener('click', reset);

  /* room label */
  var roomEl = document.getElementById('t-room');
  var addrEl = document.getElementById('t-addr');
  var subEl = document.getElementById('t-sub');
  if (S.listing) {
    addrEl.textContent = S.listing.address;
    subEl.textContent = S.listing.city + ', ' + S.listing.state + ' · ' + S.listing.sqft + ' sq ft · approximate layout';
  }
  document.title = '3D walkthrough · ' + (S.listing ? S.listing.address : 'Condo');

  /* minimap */
  function sizeMap() {
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var rect = map.getBoundingClientRect();
    map.width = Math.max(120, Math.round(rect.width * dpr));
    map.height = Math.max(90, Math.round(rect.height * dpr));
  }
  function drawMap() {
    var s = map.width / W;
    mg.clearRect(0, 0, map.width, map.height);
    mg.fillStyle = 'rgba(9,12,18,.9)';
    mg.fillRect(0, 0, map.width, map.height);
    F.rooms.forEach(function (rm) {
      mg.fillStyle = (current === rm) ? 'rgba(224,169,63,.3)' : 'rgba(255,255,255,.06)';
      mg.fillRect(rm.x * s, rm.z * s, rm.w * s, rm.d * s);
      mg.strokeStyle = 'rgba(255,255,255,.3)';
      mg.lineWidth = 1;
      mg.strokeRect(rm.x * s, rm.z * s, rm.w * s, rm.d * s);
    });
    mg.save();
    mg.translate(pos.x * s, pos.z * s);
    mg.rotate(-yaw);
    mg.fillStyle = '#e0a93f';
    mg.beginPath();
    mg.moveTo(0, -7); mg.lineTo(5, 6); mg.lineTo(0, 3); mg.lineTo(-5, 6);
    mg.closePath(); mg.fill();
    mg.restore();
  }

  /* resize */
  function size() {
    var w = c.clientWidth || innerWidth, h = c.clientHeight || innerHeight;
    r.setSize(w, h, false);
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
  }
  size();
  sizeMap();
  addEventListener('resize', function () { size(); sizeMap(); });

  /* loop */
  var clock = new THREE.Clock();
  var vel = new THREE.Vector2(0, 0);
  var frame = 0;

  function tick() {
    requestAnimationFrame(tick);
    var dt = Math.min(0.05, clock.getDelta());

    var f = (keys.KeyW || keys.ArrowUp || keys.f ? 1 : 0) - (keys.KeyS || keys.ArrowDown || keys.b ? 1 : 0);
    var st = (keys.KeyD || keys.ArrowRight || keys.r ? 1 : 0) - (keys.KeyA || keys.ArrowLeft || keys.l ? 1 : 0);
    var speed = (keys.ShiftLeft || keys.ShiftRight) ? 11 : 5.6;

    var fx = -Math.sin(yaw), fz = -Math.cos(yaw);
    var rx = Math.cos(yaw), rz = -Math.sin(yaw);
    var tx = (fx * f + rx * st), tz = (fz * f + rz * st);
    var mag = Math.hypot(tx, tz);
    if (mag > 0) { tx = tx / mag * speed; tz = tz / mag * speed; }

    vel.x += (tx - vel.x) * Math.min(1, dt * 11);
    vel.y += (tz - vel.y) * Math.min(1, dt * 11);
    if (!mag) { vel.x *= Math.pow(0.0007, dt); vel.y *= Math.pow(0.0007, dt); }

    var nx = pos.x + vel.x * dt;
    if (!blocked(nx, pos.z)) pos.x = nx; else vel.x = 0;
    var nz = pos.z + vel.y * dt;
    if (!blocked(pos.x, nz)) pos.z = nz; else vel.y = 0;

    var bob = reduce ? 0 : Math.sin(frame * 0.11) * Math.min(0.05, Math.hypot(vel.x, vel.y) * 0.007);
    cam.position.set(pos.x, EYE + bob, pos.z);
    cam.rotation.order = 'YXZ';
    cam.rotation.y = yaw;
    cam.rotation.x = pitch;

    r.render(scene, cam);

    if (frame % 8 === 0) {
      var rm = window.PLAN.roomAt(F, pos.x, pos.z);
      if (rm !== current) {
        current = rm;
        if (roomEl && rm) roomEl.textContent = rm.name;
      }
      if (map.style.display !== 'none') drawMap();
    }
    frame++;
  }

  tick();
})();
