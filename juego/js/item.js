class Item {
    constructor(type, x, y, img) {
        this.type = type; this.x = x; this.y = y;
        this.width = (type === 'salchipapa') ? 110 : 45;
        this.height = (type === 'salchipapa') ? 110 : 45;
        this.img = img;
    }
    update(speed) { this.x -= speed; }
    draw(ctx) { if (this.img && this.img.complete) ctx.drawImage(this.img, this.x, this.y, this.width, this.height); }
}

class Obstacle {
    constructor(x, y, img, type) {
        this.x = x; this.y = y; this.type = type;
        if (type === 'auto') { this.width = 150; this.height = 90; }
        else if (type === 'balla') { this.width = 100; this.height = 100; }
        else if (type === 'barrera2') { this.width = 110; this.height = 120; }
        else { this.width = 80; this.height = 110; }
        this.img = img;
    }
    update(speed) { this.x -= speed; }
    draw(ctx) { if (this.img && this.img.complete) ctx.drawImage(this.img, this.x, this.y, this.width, this.height); }
}

class Paloma {
    constructor(x, y, frames) { 
        this.x = x; this.y = y; this.width = 80; this.height = 70; 
        this.frames = frames; this.currentFrame = 0; this.counter = 0; 
    }
    update(speed) { 
        this.x -= speed + 2; 
        if (++this.counter > 6) { 
            this.currentFrame = (this.currentFrame + 1) % 5; 
            this.counter = 0; 
        } 
    }
    draw(ctx) { 
        let img = this.frames[this.currentFrame]; 
        if (img && img.complete) ctx.drawImage(img, this.x, this.y, this.width, this.height); 
    }
}