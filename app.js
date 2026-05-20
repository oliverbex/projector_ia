const firebaseConfig = { databaseURL: "https://projeto-ia-a37ba-default-rtdb.firebaseio.com/" };
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const gridElement = document.querySelector('.grid-robots');
const iso = new Isotope(gridElement, { itemSelector: '.card-robot', layoutMode: 'fitRows' });

database.ref('paridades').on('value', (snapshot) => {
    const todasParidades = snapshot.val();
    gridElement.innerHTML = ''; 

    Object.keys(todasParidades).forEach(key => {
        const d = todasParidades[key];
        const nome = key.replace('-', '/');
        
        const cardHTML = `
            <div class="card-robot ativo">
                <div class="card-header">
                    <span class="nome-robot">${nome}</span>
                    <span class="badge">LIVE</span>
                </div>
                <div class="info-row"><span>Tendência:</span><strong>${d.relatorio_vortex.tendencia}</strong></div>
                <div class="robo-mini-container">
                    <div class="robo-mini ${d.robos.r1.cor === 'call' ? 'status-call' : (d.robos.r1.cor === 'put' ? 'status-put' : '')}">R1: ${d.robos.r1.status}</div>
                    <div class="robo-mini ${d.robos.r2.cor === 'call' ? 'status-call' : (d.robos.r2.cor === 'put' ? 'status-put' : '')}">R2</div>
                    <div class="robo-mini ${d.robos.r3.cor === 'call' ? 'status-call' : (d.robos.r3.cor === 'put' ? 'status-put' : '')}">R3</div>
                </div>
            </div>`;
        gridElement.insertAdjacentHTML('beforeend', cardHTML);
    });
    
    setTimeout(() => { iso.reloadItems(); iso.layout(); }, 100);
});