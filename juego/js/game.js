const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
// Añade esto cerca de tus variables globales (donde declaras musicIndex, etc.)
const VOLUME_MUSIC = 0.4; // 40% volumen para la música
const VOLUME_SFX = 0.2;   // 20% volumen para efectos (monedas, etc.)

// RECURSOS
const ASSETS_TO_LOAD = {
    images: {
        bg1: "assets/background.png",
        bg2: "assets/background2.png",
        coin: "assets/monedas.png",
        bread: "assets/pan.png",
        barrel: "assets/barril.png",
        balla: "assets/balla.png",
        auto: "assets/auto.png",
        barrera2: "assets/barrera2.png",
        box: "assets/caja.png",
        salchipapa: "assets/salchipapa.png"
    },
    audio: {
        coin: "assets/moneda.mp3",
        bread: "assets/pan.mp3",
        expl: "assets/explosion.mp3",
        m1: "assets/musica1.mp3",
        m2: "assets/musica2.mp3",
        m3: "assets/musica3.mp3",
        m4: "assets/musica4.mp3"
    }
};

const SKINS_INFO = [
    {id:1,n:"LIZETH 1"}, {id:2,n:"LIZETH 2"}, {id:3,n:"LIZETH 3"},
    {id:4,n:"LIZETH 4"}, {id:5,n:"MAIRA"}, {id:7,n:"COME RATAS"}
];

const imgs = {};
const sounds = {};
const palomaFrames = [];
let loadedCount = 0, totalAssets = 0;

// CARGADOR DINÁMICO (FAIL-SAFE)
function startPreloading() {
    const list = [];
    for (let k in ASSETS_TO_LOAD.images) list.push({ t: 'img', k: k, s: ASSETS_TO_LOAD.images[k] });
    for (let k in ASSETS_TO_LOAD.audio) list.push({ t: 'audio', k: k, s: ASSETS_TO_LOAD.audio[k] });
    for (let i = 1; i <= 5; i++) list.push({ t: 'paloma', s: `assets/paloma/paloma${i}.png` });
    SKINS_INFO.forEach(s => {
        for (let i = 1; i <= 4; i++) list.push({ t: 'skin', s: `assets/skin${s.id}/run${i}.png` });
        for (let i = 1; i <= 2; i++) list.push({ t: 'skin', s: `assets/skin${s.id}/jump${i}.png` });
    });

    totalAssets = list.length;
    list.forEach(a => {
        if (a.t === 'img' || a.t === 'paloma' || a.t === 'skin') {
            const i = new Image(); i.src = a.s;
            i.onload = i.onerror = () => { if(a.k) imgs[a.k]=i; if(a.t==='paloma') palomaFrames.push(i); updateLoader(); };
        } else {
            const s = new Audio(); s.src = a.s;
            s.oncanplaythrough = s.onerror = () => { sounds[a.k]=s; updateLoader(); };
            s.load();
        }
    });
}

function updateLoader() {
    loadedCount++;
    const p = Math.floor((loadedCount / totalAssets) * 100);
    document.getElementById("progress-fill").style.width = p + "%";
    document.getElementById("loading-text").innerText = `Cargando Lizeths... ${p}%`;
    if (loadedCount >= totalAssets) {
        setTimeout(() => {
            document.getElementById("loading-screen").style.display = "none";
            document.getElementById("main-menu").style.display = "flex";
            updatePreview();
            drawMenu();
        }, 600);
    }
}

// AJUSTE DE RESOLUCIÓN PARA HONOR X8
function resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth, h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + "px"; canvas.style.height = h + "px";
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;
}
window.addEventListener("resize", resize);
window.addEventListener("orientationchange", () => setTimeout(resize, 300));
startPreloading(); resize();

const LETRAS_COIN = {
    'T': [[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
    'E': [[1,1,1,1,1],[1,0,0,0,0],[1,1,1,1,0],[1,0,0,0,0],[1,1,1,1,1]],
    'A': [[0,1,1,1,0],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]],
    'M': [[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1]],
    'O': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
    'I': [[0,1,1,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
    'C': [[0,1,1,1,1],[1,0,0,0,0],[1,0,0,0,0],[1,0,0,0,0],[0,1,1,1,1]],
    'G': [[0,1,1,1,1],[1,0,0,0,0],[1,1,1,1,1],[1,0,0,0,1],[0,1,1,1,1]],
    'H': [[1,0,0,0,1],[1,0,0,0,1],[1,1,1,1,1],[1,0,0,0,1],[1,0,0,0,1]],
    'Q': [[0,1,1,1,0],[1,0,0,0,1],[1,0,0,0,1],[1,0,1,1,0],[0,1,1,1,1]],
    'U': [[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[1,0,0,0,1],[0,1,1,1,0]],
    'N': [[1,0,0,0,1],[1,1,0,0,1],[1,0,1,0,1],[1,0,0,1,1],[1,0,0,0,1]],
    'X': [[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,1,0,1,0],[1,0,0,0,1]],
    'R': [[1,1,1,1,0],[1,0,0,0,1],[1,1,1,1,0],[1,0,1,0,0],[1,0,0,1,1]],
    'Ñ': [[1,1,1,0,0],[1,0,0,0,1],[1,1,0,0,1],[1,0,1,0,1],[1,0,0,1,1]],
    '1': [[0,0,1,0,0],[0,1,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,1,1,1,0]],
    'J': [[0,1,1,1,1],[0,0,0,1,0],[0,0,0,1,0],[1,0,0,1,0],[0,1,1,0,0]],
    ':': [[0,0,0,0,0],[0,0,1,0,0],[0,0,0,0,0],[0,0,1,0,0],[0,0,0,0,0]],
    ' ': [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]
};
const FRASES = ["TE AMO", "MI CHIQUITA", "11:11", "MI ENOJONA"];
let musicIndex = 0, currentBgMusic = null, musicStarted = false;
let skinIdx = 0, selectedSkinId = 1, gameActive = false;
let actionBuffer, items, obstacles, goldScore, nextSkinId, bgX = 0, bgSpeed, spawnTimer, startTime, lastSpawnX = 0, introActive = true;
const GROUND_PERCENT = 0.92, BASE_SPEED = 6, DELAY_FRAMES = 2;

function initGame() {
    // ACTIVAR PANTALLA COMPLETA
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen().catch(() => {});

    gameActive = true;
    window.horde = [new Player(selectedSkinId, true)];
    actionBuffer = []; items = []; obstacles = [];
    goldScore = 0; nextSkinId = 1; bgSpeed = BASE_SPEED;
    spawnTimer = 0; startTime = Date.now(); lastSpawnX = 0; introActive = true;
    document.getElementById("main-menu").style.display = "none";
    document.getElementById("game-over-screen").style.display = "none";
    document.getElementById("ui").style.display = "flex";
    document.getElementById("gold-count").innerText = "0";
    if (!musicStarted) setupMusic();
    spawnWord(FRASES[Math.floor(Math.random()*FRASES.length)], window.innerWidth + 100, (window.innerHeight * GROUND_PERCENT) - 96);
    gameLoop();
}

function setupMusic() {
    if (currentBgMusic) currentBgMusic.pause();
    currentBgMusic = sounds[`m${musicIndex + 1}`];
    if (!currentBgMusic) return;
    
    currentBgMusic.volume = VOLUME_MUSIC; // Aplicamos el volumen bajo
    currentBgMusic.onended = () => { 
        musicIndex = (musicIndex + 1) % 4; 
        setupMusic(); 
        currentBgMusic.play(); 
    };
}

window.leaderJump = () => {
    if (!gameActive) return;
    let alive = window.horde.filter(p => !p.isDying);
    if (alive.length > 0) {
        alive[0].jump();
        if (!musicStarted && currentBgMusic) { currentBgMusic.play().then(() => musicStarted = true).catch(() => {}); }
    }
};

function spawnWord(frase, startX, groundY) {
    const sp = 25; let curX = startX;
    for (let char of frase.toUpperCase()) {
        const matrix = LETRAS_COIN[char] || LETRAS_COIN[' '];
        for (let r = 0; r < matrix.length; r++)
            for (let c = 0; c < matrix[r].length; c++)
                if (matrix[r][c] === 1) items.push(new Item('gold', curX + (c * sp), (groundY - 240) + (r * sp), imgs.coin));
        curX += (5 * sp) + 50;
    }
    lastSpawnX = curX + 400;
}

function spawnPattern(groundY) {
    if (introActive || !gameActive || window.innerWidth - lastSpawnX < 400) return;
    const count = window.horde.filter(p => !p.isDying).length;
    const kill = count > 15;
    const chance = Math.random();
    let x = window.innerWidth + 100;

    if (!kill && chance < 0.02) { 
        items.push(new Item('salchipapa', x, groundY - 160, imgs.salchipapa)); 
        lastSpawnX = x + 300; 
    }
    else if (chance < (kill ? 0.8 : 0.45)) {
        const c = Math.random();
        if (c < 0.2) obstacles.push(new Paloma(x, groundY - 140, palomaFrames));
        else if (c < 0.4) obstacles.push(new Obstacle(x, groundY - 10, imgs.balla, 'balla'));
        else if (c < 0.6) obstacles.push(new Obstacle(x, groundY - 40, imgs.barrera2, 'barrera2'));
        else obstacles.push(new Obstacle(x, groundY - 10, imgs.auto, 'auto'));
        lastSpawnX = x + (kill ? 350 : 500);
    } else {
        if (Math.random() < 0.4) {
            items.push(new Item('bread', x, groundY - 140, imgs.bread));
            lastSpawnX = x + 300;
        } else {
            for (let i = 0; i < 5; i++) items.push(new Item('gold', x + (i * 70), (groundY - 50) - Math.sin(i)*100, imgs.coin));
            lastSpawnX = x + 600;
        }
    }
}

function updateUI() {
    document.getElementById("lizeth-count").innerText = window.horde.filter(p => !p.isDying).length;
}

function gameLoop() {
    if (!gameActive) return;
    
    // Limpiar pantalla
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Usamos canvas.width/height ajustados
    
    // Filtramos solo los personajes que NO están muriendo para la lógica de la horda
    let alive = window.horde.filter(p => !p.isDying);
    
    // Si no quedan vivos y la horda está vacía, FIN DEL JUEGO
    if (alive.length === 0 && window.horde.length === 0) { 
        gameActive = false; 
        document.getElementById("game-over-screen").style.display = "flex"; 
        return; 
    }
    
    // Lógica de tiempo, fondo y velocidad
    const time = (Date.now() - startTime) / 1000;
    if (time > 8) introActive = false;
    bgSpeed = BASE_SPEED + (time * 0.08) + (alive.length > 15 ? 4 : 0);

    const gY = (window.innerHeight * GROUND_PERCENT) - 90;
    let sc = window.innerHeight / imgs.bg1.naturalHeight;
    bgX = (bgX - bgSpeed) % (imgs.bg1.naturalWidth * sc);
    
    // Dibujar fondo
    for(let i = 0; i < 4; i++) {
        ctx.drawImage(imgs.bg1, bgX + (i * imgs.bg1.naturalWidth * sc), 0, imgs.bg1.naturalWidth * sc, window.innerHeight);
    }

    // Lógica de movimiento de la horda
    if (alive.length > 0) {
        const lead = alive[0]; 
        lead.isLeader = true;
        lead.updateLeader(gY);
        
        // Cada integrante de la horda sigue al que tiene adelante (i-1)
        for (let i = 1; i < alive.length; i++) {
            let prev = alive[i-1];
            let data = { x: prev.x, y: prev.y, state: prev.state, frame: prev.frame, vY: prev.velocityY };
            alive[i].updateFollower(data, 1); 
        }
    }

    // Spawn de objetos y obstáculos
    spawnTimer++;
    if (spawnTimer > 30) { spawnPattern(gY); spawnTimer = 0; }
    lastSpawnX -= bgSpeed;

    // Colisiones con obstáculos
    obstacles.forEach((obs, idx) => {
        obs.update(bgSpeed); 
        obs.draw(ctx);
        for(let p of alive) {
            if(checkCollision(p, obs, 25)) { 
                p.triggerDeath(); 
                obstacles.splice(idx, 1); 
                updateUI(); 
                break; 
            }
        }
    });

    // Recolección de items
    items = items.filter(it => {
        it.update(bgSpeed); 
        it.draw(ctx);
        let hit = false;
        for(let p of alive) {
            if(checkCollision(p, it, -10)) { 
                hit = true;
                if(it.type === 'gold') { 
                    goldScore++; 
                    document.getElementById("gold-count").innerText = goldScore; 
                    let s = sounds.coin.cloneNode(); s.volume = 0.2; s.play(); 
                }
                else if(it.type === 'bread') { 
                    window.horde.push(new Player(nextSkinId, false, true)); 
                    nextSkinId = (nextSkinId % 4) + 1; 
                    let s = sounds.bread.cloneNode(); s.volume = 0.2; s.play(); 
                    updateUI(); 
                }
                else if(it.type === 'salchipapa') { 
                    window.horde.push(new Player(5, false, true)); 
                    window.horde.push(new Player(7, false, true)); 
                    updateUI(); 
                }
                break;
            }
        }
        return !hit && it.x > -200;
    });

    // Dibujado y limpieza de la horda (vivos + muriendo)
    window.horde.forEach((p, idx) => {
        if (p.isDying) {
            p.updateLeader(gY); // El muerto cae
            p.draw(ctx);
            // Si el muerto sale de pantalla o pasa 1 segundo, se elimina del array
            if (p.x < -100 || p.deathTimer > 60) {
                window.horde.splice(idx, 1);
                updateUI();
            }
        } else {
            p.draw(ctx);
        }
    });

    requestAnimationFrame(gameLoop);
}

function checkCollision(p, o, m) { 
    return p.x + m < o.x + o.width && p.x + p.width - m > o.x && p.y + m < o.y + o.height && p.y + p.height - m > o.y; 
}

function drawMenu() {
    if(gameActive) return;
    ctx.clearRect(0,0,window.innerWidth, window.innerHeight);
    let sc = window.innerHeight / imgs.bg1.naturalHeight;
    bgX = (bgX - 0.5) % (imgs.bg1.naturalWidth * sc);
    ctx.drawImage(imgs.bg1, bgX, 0, imgs.bg1.naturalWidth*sc, window.innerHeight);
    ctx.drawImage(imgs.bg1, bgX + imgs.bg1.naturalWidth*sc, 0, imgs.bg1.naturalWidth*sc, window.innerHeight);
    requestAnimationFrame(drawMenu);
}

function updatePreview() {
    const s = SKINS_INFO[skinIdx];
    document.getElementById("skin-img-preview").src = `assets/skin${s.id}/run1.png`;
    document.getElementById("skin-name").innerText = s.n;
    selectedSkinId = s.id;
}

document.getElementById("prev-skin").onclick = () => { skinIdx = (skinIdx-1+SKINS_INFO.length)%SKINS_INFO.length; updatePreview(); sounds.coin.cloneNode().play(); };
document.getElementById("next-skin").onclick = () => { skinIdx = (skinIdx+1)%SKINS_INFO.length; updatePreview(); sounds.coin.cloneNode().play(); };
document.getElementById("start-btn").onclick = initGame;
document.getElementById("restart-btn").onclick = initGame;