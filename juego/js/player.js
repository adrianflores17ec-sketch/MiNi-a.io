const SPRITE_CACHE = {};

class Player {
    constructor(skinID, isLeader = false, startJumping = false) {
        this.skinID = skinID;
        this.isLeader = isLeader;
        this.width = 90; 
        this.height = 90;
        this.x = isLeader ? 150 : -100;
        this.y = 0;
        this.velocityY = startJumping ? -15 : 0;
        this.gravity = 0.85;
        this.jumpForce = -20;
        this.state = "run";
        this.frame = 0;
        this.frameCounter = 0;
        this.isDying = false;
        this.isJumpHeld = false; // Para el planeo
        this.deathTimer = 0;
        
        // Offset para que la horda no sea una línea perfecta
        this.groupOffsetX = isLeader ? 0 : (Math.random() * 50 - 25);
        this.groupOffsetY = isLeader ? 0 : (Math.random() * 15 - 7);
        this.loadSprites();
    }

    loadSprites() {
        if (!SPRITE_CACHE[this.skinID]) {
            SPRITE_CACHE[this.skinID] = { run: [], jump: [] };
            for (let i = 1; i <= 4; i++) {
                let img = new Image(); img.src = `assets/skin${this.skinID}/run${i}.png`;
                SPRITE_CACHE[this.skinID].run.push(img);
            }
            for (let i = 1; i <= 2; i++) {
                let img = new Image(); img.src = `assets/skin${this.skinID}/jump${i}.png`;
                SPRITE_CACHE[this.skinID].jump.push(img);
            }
        }
        this.sprites = SPRITE_CACHE[this.skinID];
    }

    jump() {
        if (!this.isDying && (this.state === "run")) {
            this.velocityY = this.jumpForce;
            this.state = "jump";
        }
    }

    triggerDeath() {
        if(this.isDying) return;
        this.isDying = true;
        this.velocityY = -12;
        this.isLeader = false;
    }

    updateLeader(groundY) {
        if (this.isDying) {
            this.y += this.velocityY;
            this.velocityY += this.gravity;
            this.x -= 7;
            this.deathTimer++;
            return;
        }

        // Lógica de salto y planeo
        if (this.state === "jump") {
            // Planeo: si mantiene presionado y ya está cayendo o cerca del pico
            if (this.isJumpHeld && this.velocityY > -3) {
                this.velocityY = 2.2; // Cae lento (planeo)
            } else {
                this.velocityY += this.gravity;
            }
        } else {
            this.velocityY += this.gravity;
        }

        this.y += this.velocityY;

        // Suelo
        if (this.y >= groundY) {
            this.y = groundY;
            this.velocityY = 0;
            this.state = "run";
        }

        // Animación
        if (++this.frameCounter > 6) {
            this.frame = (this.frame + 1) % 4;
            this.frameCounter = 0;
        }
    }

    updateFollower(data, index) {
        if (this.isDying) {
            this.y += this.velocityY;
            this.velocityY += this.gravity;
            this.x -= 7;
            return;
        }
        if (!data) return;
        
        // El seguidor imita la posición del buffer con suavizado
        const targetX = data.x - (index * 25) + this.groupOffsetX;
        this.x += (targetX - this.x) * 0.2;
        this.y = data.y + this.groupOffsetY;
        this.state = data.state;
        this.frame = data.frame;
        this.velocityY = data.vY;
    }

    draw(ctx) {
        // Sprite de salto: subir (frame 0), bajar/planear (frame 1)
        let img = this.state === "jump" 
            ? (this.velocityY < 0 ? this.sprites.jump[0] : this.sprites.jump[1]) 
            : this.sprites.run[this.frame];
            
        if (!img || !img.complete) return;

        if (this.isDying) ctx.globalAlpha = 0.6;
        ctx.drawImage(img, this.x, this.y, this.width, this.height);
        ctx.globalAlpha = 1.0;
    }
}