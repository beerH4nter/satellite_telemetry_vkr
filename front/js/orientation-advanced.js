(function () {
    const canvas = document.getElementById("canvas-advanced");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rollEl = document.getElementById("roll-advanced");
    const pitchEl = document.getElementById("pitch-advanced");
    const yawEl = document.getElementById("yaw-advanced");

    function setAngle(el, value, limit = 30) {
        if (!el) return;
        el.textContent = `${value.toFixed(1)}°`;
        el.style.color = Math.abs(value) > limit ? "#b85c5c" : "#3d6b7a";
    }

    window.drawOrientationAdvanced = function (roll, pitch, yaw) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((roll * Math.PI) / 180);
        ctx.beginPath();
        ctx.rect(-50, -20, 100, 40);
        ctx.fillStyle = "#6b8cae";
        ctx.fill();
        ctx.restore();
        setAngle(rollEl, roll);
        setAngle(pitchEl, pitch);
        setAngle(yawEl, yaw);
    };
})();
