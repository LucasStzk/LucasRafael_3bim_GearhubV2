const URL_API = 'http://localhost:3001';
const SILHUETA_URL = `${URL_API}/imagens/silhueta.png`;

let todosPerifericos = [];

function escapar(texto) {
    return String(texto ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function iniciarCatalogo() {
    const vitrine = document.getElementById('vitrine');
    try {
        const [rp, rc] = await Promise.all([
            fetch(`${URL_API}/periferico/listar`).then(r => r.json()),
            fetch(`${URL_API}/categoria/listar`).then(r => r.json())
        ]);

        const select = document.getElementById('selectCategoria');
        rc.categorias.forEach(c => {
            select.innerHTML += `<option value="${c.id_categoria}">${escapar(c.nome_categoria)}</option>`;
        });

        todosPerifericos = rp.perifericos;
        filtrar();
    } catch (erro) {
        vitrine.innerHTML = '<p class="vazio">Servidor offline ou erro de conexão.</p>';
    }
}

// Aplica busca por texto e filtro por categoria
function filtrar() {
    const busca = document.getElementById('inputBusca').value.toLowerCase();
    const categoria = document.getElementById('selectCategoria').value;

    const lista = todosPerifericos.filter(p =>
        (!categoria || String(p.id_categoria) === categoria) &&
        (p.nome_periferico.toLowerCase().includes(busca) || p.nome_fabricante.toLowerCase().includes(busca))
    );

    const vitrine = document.getElementById('vitrine');
    if (lista.length === 0) {
        vitrine.innerHTML = '<p class="vazio">Nenhum periférico encontrado.</p>';
        return;
    }

    vitrine.innerHTML = lista.map(p => `
        <article class="produto-card">
            <img src="${URL_API}/imagens/${p.id_periferico}.png" alt="${escapar(p.nome_periferico)}"
                 onerror="this.onerror=null; this.src='${SILHUETA_URL}'">
            <div class="produto-info">
                <span class="etiqueta">${escapar(p.nome_categoria)}</span>
                <h3>${escapar(p.nome_periferico)}</h3>
                <span class="fabricante">${escapar(p.nome_fabricante)}</span>
                <span class="estoque">${p.quantidade_estoque_periferico} em estoque</span>
                <span class="preco">R$ ${parseFloat(p.preco_periferico).toFixed(2)}</span>
                <div class="detalhes-tecnicos" id="detalhes-${p.id_periferico}"></div>
            </div>
            <button class="botao" onclick="verEspecificacao(${p.id_periferico})">Ficha técnica</button>
        </article>
    `).join('');
}

// Busca a especificação (relação 1:1) e mostra/esconde no card
async function verEspecificacao(id) {
    const div = document.getElementById(`detalhes-${id}`);
    if (div.classList.contains('aberto')) {
        div.classList.remove('aberto');
        return;
    }

    try {
        const resposta = await fetch(`${URL_API}/especificacao/${id}`);
        const data = await resposta.json();
        if (data.sucesso) {
            const e = data.especificacao;
            div.innerHTML = `<b>Conexão:</b> ${escapar(e.conexao_especificacao)}<br>
                <b>Garantia:</b> ${e.garantia_meses_especificacao} meses<br>
                <b>Peso:</b> ${e.peso_gramas_especificacao} g<br>
                <b>RGB:</b> ${e.iluminacao_rgb_especificacao ? 'Sim' : 'Não'}<br>
                ${escapar(e.detalhes_especificacao)}`;
        } else {
            div.innerHTML = 'Este periférico ainda não possui ficha técnica.';
        }
    } catch (erro) {
        div.innerHTML = 'Erro ao carregar a ficha técnica.';
    }
    div.classList.add('aberto');
}
