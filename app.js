const firebaseConfig = { databaseURL: "https://projeto-ia-a37ba-default-rtdb.firebaseio.com/" };
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const gridElement = document.querySelector('.grid-robots');
const iso = new Isotope(gridElement, { itemSelector: '.card-robot', layoutMode: 'fitRows' });

// Escuta o nó de paridades
database.ref('paridades').on('value', (snapshot) => {
    const todasParidades = snapshot.val();
    if (!todasParidades) return;
    
    gridElement.innerHTML = ''; // Limpa o grid

    Object.keys(todasParidades).forEach(key => {
        const d = todasParidades[key];
        const nome = key.replace('-', '/');
        
        // Proteção: Garante que os dados existem antes de exibir
        const tendencia = d.relatorio_vortex ? d.relatorio_vortex.tendencia : "LENDO";
        const r1 = d.robos ? d.robos.r1 : { status: "LENDO", cor: "" };
        const r2 = d.robos ? d.robos.r2 : { status: "LENDO", cor: "" };
        const r3 = d.robos ? d.robos.r3 : { status: "LENDO", cor: "" };

        const cardHTML = `
            <div class="card-robot ativo">
                <div class="card-header">
                    <span class="nome-robot">${nome}</span>
                    <span class="badge">LIVE</span>
                </div>
                <div class="info-row"><span>Tendência:</span><strong>${tendencia}</strong></div>
                <div class="robo-mini-container">
                    <div class="robo-mini ${r1.cor === 'call' ? 'status-call' : (r1.cor === 'put' ? 'status-put' : '')}">R1: ${r1.status}</div>
                    <div class="robo-mini ${r2.cor === 'call' ? 'status-call' : (r2.cor === 'put' ? 'status-put' : '')}">R2</div>
                    <div class="robo-mini ${r3.cor === 'call' ? 'status-call' : (r3.cor === 'put' ? 'status-put' : '')}">R3</div>
                </div>
            </div>`;
        gridElement.insertAdjacentHTML('beforeend', cardHTML);
    });
    
    setTimeout(() => { iso.reloadItems(); iso.layout(); }, 500);
});
