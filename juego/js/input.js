// MANEJO DE ENTRADAS PARA PC Y MÓVIL (HONOR X8)

function startAction(e) {
    // Evitar zoom o comportamientos extraños en móvil
    if (e.cancelable) e.preventDefault();
    
    // Ejecutar el salto inicial
    window.leaderJump();
    
    // Activar el flag de planeo en toda la horda
    if (window.horde) {
        window.horde.forEach(p => p.isJumpHeld = true);
    }
}

function stopAction(e) {
    // Desactivar planeo
    if (window.horde) {
        window.horde.forEach(p => p.isJumpHeld = false);
    }
}

// EVENTOS DE TECLADO
window.addEventListener("keydown", (e) => {
    if (["ArrowUp", "w", " ", "ArrowDown", "s"].includes(e.key)) {
        startAction(e);
    }
});

window.addEventListener("keyup", (e) => {
    if (["ArrowUp", "w", " ", "ArrowDown", "s"].includes(e.key)) {
        stopAction(e);
    }
});

// EVENTOS TÁCTILES (POINTER EVENTS PARA HONOR X8)
// pointerdown detecta cuando toca la pantalla
window.addEventListener("pointerdown", startAction, { passive: false });

// pointerup detecta cuando levanta el dedo
window.addEventListener("pointerup", stopAction);

// pointercancel detecta si el toque se interrumpe (ej. notificación)
window.addEventListener("pointercancel", stopAction);

// Bloquear menú contextual (clic derecho / mantener presionado)
window.addEventListener("contextmenu", e => e.preventDefault());