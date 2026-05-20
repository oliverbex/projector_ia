// Configuração do Firebase
const firebaseConfig = {
    apiKey: "SUA_API_KEY_GERADA_LA", // Lembre-se de colocar sua chave real aqui
    authDomain: "projeto-ia-a37ba.firebaseapp.com",
    databaseURL: "https://projeto-ia-a37ba-default-rtdb.firebaseio.com",
    projectId: "projeto-ia-a37ba",
    storageBucket: "projeto-ia-a37ba.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const seletor = document.getElementById('seletor-ativo');
const seletorQtd = document.getElementById('seletor-quantidade');
let listenerAtual = null;

function smartUpdateText(id, novoTexto) {
    const el = document.getElementById(id);
    if (el && el.innerText !== String(novoTexto)) { el.innerText = novoTexto; }
}

function formatarCard(elemento, valor) {
    if(!elemento) return;
    if (elemento.innerText !== valor) {
        elemento.innerText = valor;
        elemento.className = "raiox-value"; 
        if(valor === "COMPRA" || valor === "FORTE") elemento.classList.add("color-call");
        else if (valor === "VENDA" || valor === "FRACO") elemento.classList.add("color-put");
        else elemento.classList.add("color-neutro");
    }
}

function formatarCardRobo(elemento, status, cor) {
    if(!elemento) return;
    if (elemento.innerText !== status) {
        elemento.innerText = status;
        elemento.className = "raiox-value"; 
        if(cor === "call") elemento.classList.add("color-call");
        else if (cor === "put") elemento.classList.add("color-put");
        else elemento.classList.add("color-neutro");
    }
}

function formatarTendencia(id, valor) {
    const el = document.getElementById(id);
    if (el && el.innerText !== valor) {
        el.innerText = valor;
        el.className = valor === "COMPRA" || valor === "COMPRADOR" ? "resumo-valor color-call" : "resumo-valor color-put";
    }
}

function escutarNuvem() {
    const paridadeFormatada = seletor.value.replace('/', '-');
    if (listenerAtual) { database.ref('paridades').off('value', listenerAtual); }

    listenerAtual = database.ref('paridades/' + paridadeFormatada).on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        smartUpdateText('ui-atualizacao', "Última leitura: " + data.atualizacao);
        smartUpdateText('ui-status-motor', data.timeframes.M1);

        formatarCard(document.getElementById('ui-raiox-ema'), data.raiox.ema);
        formatarCard(document.getElementById('ui-raiox-adx'), data.raiox.adx);
        formatarCard(document.getElementById('ui-raiox-rsi'), data.raiox.rsi);
        formatarCard(document.getElementById('ui-raiox-macd'), data.raiox.macd);

        if(data.relatorio_vortex) {
            smartUpdateText('ui-forca-sinal', data.relatorio_vortex.forca + "%");
            smartUpdateText('ui-alvo-entrada', data.relatorio_vortex.entrada.toFixed(5));
            smartUpdateText('ui-alvo-sl', data.relatorio_vortex.sl.toFixed(5));
            smartUpdateText('ui-alvo-tp1', data.relatorio_vortex.tp1.toFixed(5));
            smartUpdateText('ui-alvo-tp2', data.relatorio_vortex.tp2.toFixed(5));
            smartUpdateText('ui-alvo-tp3', data.relatorio_vortex.tp3.toFixed(5));
            
            formatarTendencia('ui-resumo-tendencia', data.relatorio_vortex.tendencia);
            formatarTendencia('ui-resumo-smc', data.relatorio_vortex.smc);

            smartUpdateText('ui-ind-compra', data.relatorio_vortex.compra);
            smartUpdateText('ui-ind-venda', data.relatorio_vortex.venda);
            smartUpdateText('ui-ind-neutro', data.relatorio_vortex.neutro);
        }

        let pCall = Math.round(data.probabilidadeCall);
        let pPut = Math.round(data.probabilidadePut);
        smartUpdateText('ui-pct-alta', pCall + "%");
        smartUpdateText('ui-pct-baixa', pPut + "%");
        
        const barAlta = document.getElementById('ui-bar-alta');
        if (barAlta.style.width !== pCall + "%") {
            barAlta.style.width = pCall + "%";
            document.getElementById('ui-bar-baixa').style.width = pPut + "%";
        }

        if (data.catalogacao) {
            const qtd = parseInt(seletorQtd.value);
            const velasFiltradas = data.catalogacao.slice(-qtd);
            const gridCatalogacao = document.getElementById('ui-grid-catalogacao');
            
            let htmlCaixas = ''; let cv = 0; let cvr = 0; let cd = 0;

            velasFiltradas.forEach(vela => {
                let classeCor = 'box-doji';
                if (vela.cor === 'verde') { classeCor = 'box-verde'; cv++; }
                else if (vela.cor === 'vermelho') { classeCor = 'box-vermelho'; cvr++; }
                else { cd++; }
                htmlCaixas += `<div class="box-vela ${classeCor}" title="${vela.hora}">${vela.hora}</div>`;
            });
            
            if (gridCatalogacao.innerHTML !== htmlCaixas) {
                gridCatalogacao.innerHTML = htmlCaixas;
                smartUpdateText('ib-qtd-verde', cv);
                smartUpdateText('ib-qtd-vermelho', cvr);
                smartUpdateText('ib-qtd-doji', cd);
            }
        }

        if (data.robos) {
            formatarCardRobo(document.getElementById('ui-robo1'), data.robos.r1.status, data.robos.r1.cor);
            formatarCardRobo(document.getElementById('ui-robo2'), data.robos.r2.status, data.robos.r2.cor);
            formatarCardRobo(document.getElementById('ui-robo3'), data.robos.r3.status, data.robos.r3.cor);
        }
    });
}

database.ref('sistema/placar').on('value', (snapshot) => {
    const placar = snapshot.val();
    if(placar) {
        smartUpdateText('ui-placar-total', placar.total);
        smartUpdateText('ui-placar-wins', placar.wins);
        smartUpdateText('ui-placar-losses', placar.losses);
        let taxa = placar.total > 0 ? Math.round((placar.wins / placar.total) * 100) : 0;
        smartUpdateText('ui-placar-taxa', taxa + "%");
    }
});

seletor.addEventListener('change', () => {
    document.getElementById('ui-ativo-relatorio').innerText = seletor.value;
    escutarNuvem();
});

seletorQtd.addEventListener('change', escutarNuvem);
escutarNuvem();
