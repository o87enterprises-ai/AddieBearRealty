(function(){
var c=document.getElementById('dx-stage');
if(!c||!window.THREE||!window.gsap||!window.ScrollTrigger)return;
document.documentElement.classList.add('js3d');
gsap.registerPlugin(ScrollTrigger);
var floors=[];try{floors=JSON.parse(c.getAttribute('data-floors')||'[]')}catch(e){}
if(!floors.length)return;
var accent=c.getAttribute('data-accent')||'#0a2a66';
var r=new THREE.WebGLRenderer({canvas:c,antialias:true,alpha:true});
r.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
var scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(35,1,0.1,100);
scene.add(new THREE.AmbientLight(0xffffff,0.65));
var key=new THREE.DirectionalLight(0xffffff,0.85);key.position.set(5,9,7);scene.add(key);
function cv(w,h){var e=document.createElement('canvas');e.width=w;e.height=h;return e;}
var bc=cv(256,256),b=bc.getContext('2d');b.fillStyle='#d8cfc4';b.fillRect(0,0,256,256);
for(var row=0;row<16;row++){for(var col=-1;col<5;col++){var x=col*64+(row%2?32:0);
 var t=row*7+col*13;b.fillStyle='hsl('+(8+t%9)+','+(42+t%14)+'%,'+(30+t%10)+'%)';b.fillRect(x+2,row*16+2,60,12);}}
var brick=new THREE.CanvasTexture(bc);brick.wrapS=brick.wrapT=THREE.RepeatWrapping;
var W=6,D=4,H=1.3,plan=[[0,0,.38,.55],[.38,0,.62,.55],[0,.55,.55,.45],[.55,.55,.45,.45]];
function blueprint(f){var e=cv(1200,800),g=e.getContext('2d');
 g.fillStyle=accent;g.fillRect(0,0,1200,800);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(0,0,1200,800);
 g.strokeStyle='rgba(255,255,255,.12)';g.lineWidth=1;for(var i=0;i<=1200;i+=40){g.beginPath();g.moveTo(i,0);g.lineTo(i,800);g.stroke();}
 for(i=0;i<=800;i+=40){g.beginPath();g.moveTo(0,i);g.lineTo(1200,i);g.stroke();}
 g.strokeStyle='#fff';g.lineWidth=10;g.strokeRect(30,30,1140,740);g.lineWidth=5;g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';
 plan.forEach(function(p,k){var x=30+p[0]*1140,y=30+p[1]*740,w=p[2]*1140,h=p[3]*740;g.strokeRect(x,y,w,h);
  g.clearRect(x+w/2-40,y+h-3,80,6);g.fillStyle='#fff';
  var n=(f.rooms[k]||'').toUpperCase();if(n){g.font='600 46px monospace';g.fillText(n,x+w/2,y+h/2-10,w-40);
  g.font='28px monospace';g.globalAlpha=.7;g.fillText(Math.round(p[2]*W*3.28*1.6)+"' x "+Math.round(p[3]*D*3.28*1.6)+"'",x+w/2,y+h/2+38);g.globalAlpha=1;}});
 g.font='600 30px monospace';g.textAlign='left';g.fillText(f.name.toUpperCase(),48,800-58);
 return new THREE.CanvasTexture(e);}
var house=new THREE.Group();scene.add(house);
var levels=floors.map(function(f,i){var lv=new THREE.Group();house.add(lv);
 var slab=new THREE.Mesh(new THREE.BoxGeometry(W+0.2,0.14,D+0.2),new THREE.MeshStandardMaterial({color:0xe9e4dc,roughness:.8}));lv.add(slab);
 var bp=new THREE.Mesh(new THREE.PlaneGeometry(W,D),new THREE.MeshBasicMaterial({map:blueprint(f),transparent:true,opacity:0}));
 bp.rotation.x=-Math.PI/2;bp.position.y=0.08;lv.add(bp);
 var walls=[[W,D/2,0,0],[W,-D/2,0,0],[D,0,W/2,1],[D,0,-W/2,1]].map(function(w){
  var tex=brick.clone();tex.needsUpdate=true;tex.repeat.set(w[0]/1.2,H/1.2);
  var m=new THREE.Mesh(new THREE.BoxGeometry(w[0],H,0.16),new THREE.MeshStandardMaterial({map:tex,roughness:.9,transparent:true}));
  if(w[3])m.rotation.y=Math.PI/2;m.position.set(w[2],H/2+0.07,w[1]);
  for(var k=0;k<3;k++){var win=new THREE.Mesh(new THREE.PlaneGeometry(0.55,0.7),new THREE.MeshStandardMaterial({color:0x1d2a36,roughness:.2,metalness:.6,transparent:true}));
   win.position.set((k-1)*w[0]/3.2,0.05,0.09);m.add(win);}
  m.userData.out=new THREE.Vector3(w[2],0,w[1]).normalize();lv.add(m);return m;});
 return {g:lv,walls:walls,bp:bp,i:i};});
var roof=new THREE.Mesh(new THREE.ConeGeometry(1,1.5,4,1),new THREE.MeshStandardMaterial({color:0x2e3238,roughness:.7,transparent:true}));
roof.rotation.y=Math.PI/4;roof.scale.set((W+0.6)/Math.SQRT2,1,(D+0.6)/Math.SQRT2);house.add(roof);
var n=levels.length,stack=n*(H+0.14);
function size(){var w=c.clientWidth,h=c.clientHeight;if(!w||!h)return;r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();}
var s={roof:0,walls:0,split:0,orbit:0},hud=document.getElementById('dx-hud');
function draw(){
 var a=0.6+s.orbit*(120*Math.PI/180),R=15+s.split*3;
 cam.position.set(Math.sin(a)*R,5+s.split*6+s.orbit*2,Math.cos(a)*R);cam.lookAt(0,0.5+s.split*1.5,0);
 levels.forEach(function(l){var j=n-1-l.i;l.g.position.y=j*(H+0.14)+j*s.split*2.6-stack/2;
  l.walls.forEach(function(m){var o=m.userData.out;m.position.x=(m.rotation.y?Math.sign(o.x)*W/2:0)+o.x*s.walls*2.4;
   m.position.z=(m.rotation.y?0:Math.sign(o.z)*D/2)+o.z*s.walls*2.4;var op=1-s.walls*0.92;m.material.opacity=op;
   m.children.forEach(function(w){w.material.opacity=op;});m.visible=op>0.04;});
  l.bp.material.opacity=Math.min(1,s.walls*1.3);});
 roof.position.y=stack/2+0.75+s.roof*4.5+s.split*2.6*(n-1);roof.material.opacity=1-s.roof*0.95;roof.visible=s.roof<0.98;
 if(hud){var msg=hud.getAttribute('data-idle');
  if(s.split>0.05){var k=Math.min(n-1,Math.floor(s.orbit*n));msg=floors[k].name+' — '+floors[k].rooms.filter(Boolean).join(' · ');}
  else if(s.walls>0.05)msg='Walls open — the blueprints';else if(s.roof>0.05)msg='Lifting the roof';hud.textContent=msg;}
 r.render(scene,cam);}
size();
if(window.ResizeObserver){new ResizeObserver(function(){size();draw();}).observe(c);}
else{window.addEventListener('resize',function(){size();draw();});}
var tl=gsap.timeline({scrollTrigger:{trigger:'#dx-pin',start:'top top',end:'+=320%',scrub:0.6,pin:true},onUpdate:draw});
tl.to(s,{roof:1,duration:20,ease:'power1.inOut'}).to(s,{walls:1,duration:25,ease:'power1.inOut'}).to(s,{split:1,duration:25,ease:'power1.inOut'}).to(s,{orbit:1,duration:30,ease:'sine.inOut'});
draw();
})();
