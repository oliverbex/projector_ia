const firebaseConfig = { databaseURL: "https://projeto-ia-a37ba-default-rtdb.firebaseio.com/" };
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const gridElement = document.querySelector('.grid-robots');
const iso = new Isotope(gridElement, { itemSelector: '.card-robot', layoutMode: 'fitRows' });

// Escuta a raiz de paridades
database.ref('paridades').on('value', (snapshot) => {
    const dados = snapshot.val();
    if (!dados) return;

    gridElement.innerHTML = ''; 

    Object.keys(dados).forEach(key => {
        const d = dados[key];
        const nome = key.replace('-', '/');
        
        // Verifica se os dados do robô existem, senão usa padrão
        const r1 = (d.robos && d.robos.r1) ? d.robos.r1 : { status: "LENDO", cor: "" };
        const tendencia = (d.relatorio_vortex) ? d.relatorio_vortex.tendencia : "LENDO";

        const cardHTML = `
            <div class="card-robot ativo">
                <div class="card-header">
                    <span class="nome-robot">${nome}</span>
                </div>
                <div class="info-row"><span>Tendência:</span><strong>${tendencia}</strong></div>
                <div class="robo-mini-container">
                    <div class="robo-mini ${r1.cor === 'call' ? 'status-call' : (r1.cor === 'put' ? 'status-put' : '')}">R1: ${r1.status}</div>
                </div>
            </div>`;
        gridElement.insertAdjacentHTML('beforeend', cardHTML);
    });
    
    // Força o Isotope a reorganizar os novos cards
    setTimeout(() => { iso.reloadItems(); iso.layout(); }, 300);
});
