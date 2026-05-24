/* ── CURSOR ── */
const dot = document.getElementById('cursor-dot');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
});
(function animRing() {
    rx += (mx - rx) * 0.13; ry += (my - ry) * 0.13;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animRing);
})();

/* ── NAV TOGGLE ── */
document.getElementById('navToggle').addEventListener('click', () => {
    document.getElementById('navLinks').classList.toggle('open');
});
document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => document.getElementById('navLinks').classList.remove('open'));
});

/* ── GALAXY CANVAS ── */
const canvas = document.getElementById('galaxy');
const ctx = canvas.getContext('2d');
let W, H, stars = [], nebulae = [], shootingStars = [];

function resize() { W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
resize(); addEventListener('resize', () => { resize(); initScene(); });

function initScene() {
    stars = [];
    for (let i = 0; i < 400; i++) {
        stars.push({
            x: Math.random() * W, y: Math.random() * H,
            r: Math.random() * 1.9 + 0.2,
            alpha: Math.random() * 0.85 + 0.15,
            speed: Math.random() * 0.3 + 0.04,
            twinkle: Math.random() * Math.PI * 2,
            twinkleSpeed: Math.random() * 0.018 + 0.004,
            color: Math.random() > .85 ? [201, 162, 39] : Math.random() > .7 ? [139, 92, 246] : [226, 216, 243]
        });
    }
    nebulae = [];
    const nColors = [[139, 92, 246], [99, 102, 241], [236, 72, 153], [201, 162, 39], [59, 130, 246], [16, 185, 129]];
    for (let i = 0; i < 7; i++) {
        const c = nColors[i % nColors.length];
        nebulae.push({
            x: Math.random() * W, y: Math.random() * H,
            r: Math.random() * 350 + 100,
            color: c,
            alpha: Math.random() * .065 + .015
        });
    }
}
initScene();

/* shooting stars */
function spawnShooter() {
    shootingStars.push({
        x: Math.random() * W * 0.8, y: Math.random() * H * 0.4,
        vx: Math.random() * 8 + 4, vy: Math.random() * 4 + 2,
        len: Math.random() * 120 + 60, alpha: 1, life: 1
    });
}
setInterval(spawnShooter, 4000);

let frame = 0;
function draw() {
    ctx.clearRect(0, 0, W, H);

    /* deep space bg */
    const bg = ctx.createRadialGradient(W * .5, H * .4, 0, W * .5, H * .5, Math.max(W, H));
    bg.addColorStop(0, '#07000e'); bg.addColorStop(.6, '#020008'); bg.addColorStop(1, '#000004');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    /* nebulae */
    nebulae.forEach(n => {
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
        g.addColorStop(0, `rgba(${n.color[0]},${n.color[1]},${n.color[2]},${n.alpha})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
    });

    /* milky way band */
    const mw = ctx.createLinearGradient(0, H * .25, W, H * .75);
    mw.addColorStop(0, 'rgba(0,0,0,0)');
    mw.addColorStop(.35, 'rgba(139,92,246,.045)');
    mw.addColorStop(.5, 'rgba(201,162,39,.025)');
    mw.addColorStop(.65, 'rgba(99,102,241,.04)');
    mw.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = mw; ctx.fillRect(0, 0, W, H);

    /* stars */
    stars.forEach(s => {
        s.twinkle += s.twinkleSpeed;
        const a = s.alpha * (0.55 + 0.45 * Math.sin(s.twinkle));
        const c = s.color;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${a})`;
        ctx.fill();
        if (s.r > 1.3) {
            const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 7);
            glow.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${a * .25})`);
            glow.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 7, 0, Math.PI * 2); ctx.fill();
        }
        s.y -= s.speed;
        if (s.y < -4) { s.y = H + 4; s.x = Math.random() * W; }
    });

    /* shooting stars */
    for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += ss.vx; ss.y += ss.vy; ss.life -= 0.02; ss.alpha = ss.life;
        if (ss.life <= 0) { shootingStars.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y); ctx.lineTo(ss.x - ss.vx * ss.len / 10, ss.y - ss.vy * ss.len / 10);
        const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.vx * ss.len / 10, ss.y - ss.vy * ss.len / 10);
        grad.addColorStop(0, `rgba(255,215,0,${ss.alpha})`);
        grad.addColorStop(1, 'rgba(255,215,0,0)');
        ctx.strokeStyle = grad; ctx.lineWidth = 1.5; ctx.stroke();
    }

    frame++; requestAnimationFrame(draw);
}
draw();

/* ── FLOATING PARTICLES ── */
function spawnParticle() {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 3 + 1;
    const colors = ['#ffd700', '#8b5cf6', '#6366f1', '#ec4899', 'rgba(255,255,255,.8)'];
    p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random() * 100}vw;bottom:-10px;background:${colors[Math.floor(Math.random() * colors.length)]};opacity:${Math.random() * .7 + .2};animation-duration:${Math.random() * 16 + 9}s;animation-delay:${Math.random() * 4}s;`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), (Math.random() * 16 + 9) * 1200);
}
setInterval(spawnParticle, 700);
for (let i = 0; i < 8; i++) setTimeout(spawnParticle, i * 250);

/* ── SCROLL REVEAL ── */
const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));