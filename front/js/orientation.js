const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const rollEl = document.getElementById("roll");
const pitchEl = document.getElementById("pitch");
const yawEl = document.getElementById("yaw");


function drawOrientation(roll, pitch, yaw) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((roll * Math.PI) / 180);

    ctx.beginPath();
    ctx.rect(-50, -20, 100, 40);
    ctx.fillStyle = "#5d8a7a";
    ctx.fill();

    ctx.restore();

    // 🔹 Численные значения
    rollEl.textContent = `${roll.toFixed(1)}°`;
    pitchEl.textContent = `${pitch.toFixed(1)}°`;
    yawEl.textContent = `${yaw.toFixed(1)}°`;

    setAngle(rollEl, roll);
    setAngle(pitchEl, pitch);
    setAngle(yawEl, yaw);
}

function setAngle(el, value, limit = 30) {
    el.textContent = `${value.toFixed(1)}°`;

    if (Math.abs(value) > limit) {
        el.style.color = "#b85c5c";
    } else {
        el.style.color = "#3d6b7a";
    }
}
