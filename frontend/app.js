const API_URL = "https://novahabitat-lite-nuuo.onrender.com";

async function checkHealth() {
    try {
        const res = await fetch(`${API_URL}/health`);
        const statusEl = document.getElementById('api-status');
        if (res.ok) {
            statusEl.innerText = "SISTEMA ONLINE";
            statusEl.style.color = "var(--success)";
        }
    } catch (err) {
        document.getElementById('api-status').innerText = "ERROR DE CONEXIÓN";
        document.getElementById('api-status').style.color = "var(--danger)";
    }
}

async function loadProperties() {
    const status = document.getElementById('filter-status').value;
    let url = `${API_URL}/properties`;
    if (status) url += `?status=${status}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        const list = document.getElementById('properties-list');
        list.innerHTML = "";

        data.forEach(p => {
            const card = document.createElement('div');
            card.className = 'property-card';
            card.innerHTML = `
                <div>
                    <div style="font-weight:600">${p.title}</div>
                    <div style="font-size:0.85rem; color:var(--text-muted)">${p.location} • $${p.price.toLocaleString()}</div>
                </div>
                <div style="display:flex; align-items:center; gap:1rem">
                    <span class="status-${p.status}" style="font-size:0.8rem; font-weight:700">${p.status.toUpperCase()}</span>
                    <div class="actions">
                        ${p.status === 'Available' ? `<button onclick="updateStatus(${p.id}, 'Reserved')" class="btn-icon">Reservar</button>` : ''}
                        ${p.status === 'Reserved' ? `<button onclick="updateStatus(${p.id}, 'Rented')" class="btn-icon">Finalizar Renta</button>` : ''}
                    </div>
                </div>
            `;
            list.appendChild(card);
        });
    } catch (err) {
        console.error(err);
    }
}

document.getElementById('property-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        title: document.getElementById('prop-title').value,
        price: Number(document.getElementById('prop-price').value),
        location: document.getElementById('prop-location').value
    };

    const res = await fetch(`${API_URL}/properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        e.target.reset();
        loadProperties();
    }
});

async function updateStatus(id, newStatus) {
    await fetch(`${API_URL}/properties/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, changedBy: "App_Mobile" })
    });
    loadProperties();
}

document.getElementById('lead-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
        name: document.getElementById('lead-name').value,
        channel: document.getElementById('lead-channel').value,
        budget: Number(document.getElementById('lead-budget').value)
    };

    const res = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        const msg = document.getElementById('leads-message');
        msg.innerText = "Lead registrado correctamente";
        setTimeout(() => msg.innerText = "", 3000);
        e.target.reset();
    }
});

checkHealth();
loadProperties();
