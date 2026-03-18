// Football Game Main Script
// Add your game logic here

function selectPlayer(name) {
    const el = document.getElementById('player-name');
    if (el) {
        el.textContent = name.toUpperCase();
        console.log("Selected Leged: " + name);
    }
}

function playGame() {
    const name = document.getElementById('player-name').textContent;
    alert('Game starting with: ' + name + ' ⚽️');
}

// Initial Canvas setup
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.strokeStyle = '#238636';
        ctx.lineWidth = 2;
        ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);
        
        ctx.font = '24px Outfit, sans-serif';
        ctx.fillStyle = '#238636';
        ctx.textAlign = 'center';
        ctx.fillText('3D ENGINE LOADING...', canvas.width/2, canvas.height/2);
    }
});