const table = document.getElementById("telemetry");

function renderTable(data) {
    const L = LANG[currentLang];
    table.innerHTML = `<tr><th>${L.tableParam}</th><th>${L.tableValue}</th></tr>`;

    const labels = L.labels;

    for (const key in labels) {
        if (!(key in data)) continue;
        const row = document.createElement("tr");
        row.innerHTML = `
      <td>${labels[key]}</td>
      <td>${typeof data[key] === "number" ? data[key].toFixed(2) : data[key]}</td>
    `;
        table.appendChild(row);
    }
}

window.renderTable = renderTable;
