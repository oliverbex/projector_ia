document.addEventListener('DOMContentLoaded', () => {
    const firebaseConfig = { databaseURL: "https://projeto-ia-a37ba-default-rtdb.firebaseio.com/" };
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
    
    const gridElement = document.querySelector('.grid-robots');
    const heatmapElement = document.getElementById('ui-grid-catalogacao');
    const iso = new Isotope(gridElement, { itemSelector: '.card-robot', layoutMode: 'fitRows' });

    database.ref('paridades').on('value', (snapshot) => {
        const dados = snapshot.val();
        if (!dados) return;

        gridElement.innerHTML = ''; 
        
        // Pega a primeira paridade disponível para o Mapa de Calor
        const keys = Object.keys(dados);
        const primeiraParidade = dados[keys[0]];
        
        // Renderiza Mapa de Calor
        if(primeiraParidade.catalogacao && heatmapElement) {
            heatmapElement.innerHTML = primeiraParidade.catalogacao.slice(-100).map(v => 
                `<div class="box-vela ${v.cor === 'verde' ? 'box-verde' : v.cor === 'vermelho' ? 'box-vermelho' : 'box-doji'}"></div>`
            ).join('');
        }

        // Renderiza Cards dos Robôs
        keys.forEach(key => {
            const d = dados[key];
            const nome = key.replace('-', '/');
            const tendencia = (d.relatorio_vortex) ? d.relatorio_vortex.tendencia : "LENDO";
            const r1 = (d.robos && d.robos.r1) ? d.robos.r1 : { status: "LENDO", cor: "" };
            
            gridElement.insertAdjacentHTML('beforeend', `
                <div class="card-robot">
                    <div class="card-header">
                        <span class="nome-robot">${nome}</span>
                        <span class="badge">LIVE</span>
                    </div>
                    <div class="info-row"><span>Tendência:</span><strong>${tendencia}</strong></div>
                    <div class="robo-mini-container">
                        <div class="robo-mini ${r1.cor === 'call' ? 'status-call' : (r1.cor === 'put' ? 'status-put' : '')}">R1: ${r1.status}</div>
                    </div>
                </div>`);
        });
        
        setTimeout(() => { iso.reloadItems(); iso.layout(); }, 300);
    });
});
