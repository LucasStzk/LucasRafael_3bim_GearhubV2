const URL_API = 'http://localhost:3001';
const ROTA = '/periferico';               // prefixo das rotas deste CRUD no backend
const CHAVE = 'id_periferico';                // nome da chave primária
const ITEM = 'periferico';               // nome do objeto devolvido pelo backend (obter)
const LISTA = 'perifericos';             // nome do array devolvido pelo backend (listar)
const CHAVE_INPUT = 'input_' + CHAVE;

// Campos do formulário (além da chave primária)
const CAMPOS = [
    {
        "key": "nome_periferico",
        "tipo": "text"
    },
    {
        "key": "id_categoria",
        "tipo": "select",
        "fonte": {
            "rota": "/categoria/listar",
            "lista": "categorias",
            "valor": "id_categoria",
            "texto": "nome_categoria"
        }
    },
    {
        "key": "id_fabricante",
        "tipo": "select",
        "fonte": {
            "rota": "/fabricante/listar",
            "lista": "fabricantes",
            "valor": "id_fabricante",
            "texto": "nome_fabricante"
        }
    },
    {
        "key": "preco_periferico",
        "tipo": "number"
    },
    {
        "key": "quantidade_estoque_periferico",
        "tipo": "number"
    }
];

// Colunas da tabela de listagem
const COLUNAS = [
    ['ID', l => l.id_periferico],
    ['Nome', l => l.nome_periferico],
    ['Categoria', l => l.nome_categoria],
    ['Fabricante', l => l.nome_fabricante],
    ['Estoque', l => l.quantidade_estoque_periferico],
    ['Preço', l => 'R$ ' + parseFloat(l.preco_periferico).toFixed(2)]
];

let oQueEstaFazendo = '';
bloquearAtributos(true);

async function inicializar() {
    await carregarSelects();
    await listar();
}

// Preenche os <select> (chaves estrangeiras) com dados vindos do backend
async function carregarSelects() {
    for (const campo of CAMPOS.filter(c => c.fonte)) {
        const select = document.getElementById('input_' + campo.key);
        try {
            const resposta = await fetch(`${URL_API}${campo.fonte.rota}`);
            const data = await resposta.json();
            if (data.sucesso) {
                select.innerHTML = '<option value="">-- Selecione --</option>';
                data[campo.fonte.lista].forEach(o => {
                    select.innerHTML += `<option value="${o[campo.fonte.valor]}">${o[campo.fonte.valor]} - ${escapar(o[campo.fonte.texto])}</option>`;
                });
            }
        } catch (erro) {
            select.innerHTML = '<option value="">Erro ao carregar</option>';
        }
    }
}

function escapar(texto) {
    return String(texto ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ---------- Imagem do periférico (upload local) ----------
const SILHUETA_URL = `${URL_API}/imagens/silhueta.png`;

function carregarImagem(id) {
    const img = document.getElementById('imgPeriferico');
    if (!id) {
        img.src = SILHUETA_URL;
        return;
    }
    img.onerror = () => { img.onerror = null; img.src = SILHUETA_URL; };
    img.src = `${URL_API}/imagens/${id}.png?t=${new Date().getTime()}`;
}

function acionarUpload() {
    if (oQueEstaFazendo !== 'inserindo' && oQueEstaFazendo !== 'alterando') {
        mostrarAviso("Clique em Inserir ou Alterar primeiro para poder escolher uma imagem.");
        return;
    }
    document.getElementById('inputImagem').click();
}

function previewImagem() {
    const arquivos = document.getElementById('inputImagem').files;
    if (arquivos.length > 0) {
        document.getElementById('imgPeriferico').src = URL.createObjectURL(arquivos[0]);
        mostrarAviso("Imagem escolhida! Clique em Salvar para concluir.");
    }
}

async function uploadImagemParaServidor(id) {
    const arquivos = document.getElementById('inputImagem').files;
    if (arquivos.length === 0) return;

    const formData = new FormData();
    formData.append('imagem', arquivos[0]);

    try {
        await fetch(`${URL_API}${ROTA}/upload/${id}`, { method: 'POST', body: formData });
    } catch (erro) {
        console.error("Erro ao enviar imagem:", erro);
    }
}
// ---------------------------------------------------------

async function procurePorChavePrimaria(chave) {
    try {
        const resposta = await fetch(`${URL_API}${ROTA}/${chave}`);
        const data = await resposta.json();
        return data.sucesso ? data[ITEM] : null;
    } catch (erro) {
        return null;
    }
}

async function procure() {
    const id = document.getElementById(CHAVE_INPUT).value.trim();
    if (id === '' || !Number.isInteger(Number(id))) {
        mostrarAviso("Precisa ser um número inteiro");
        return;
    }

    const registro = await procurePorChavePrimaria(id);
    oQueEstaFazendo = '';

    if (registro) {
        mostrarDados(registro);
        carregarImagem(id);
        visibilidadeDosBotoes('inline', 'none', 'inline', 'inline', 'none');
        mostrarAviso("Achou no banco, pode alterar ou excluir");
    } else {
        limparAtributos();
    carregarImagem(null);
        visibilidadeDosBotoes('inline', 'inline', 'none', 'none', 'none');
        mostrarAviso("Não achou no banco, pode inserir");
    }
}

// Clique numa linha da tabela: preenche o ID e procura
function selecionar(id) {
    if (oQueEstaFazendo !== '') return;
    document.getElementById(CHAVE_INPUT).value = id;
    procure();
}

function inserir() {
    bloquearAtributos(false);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'inserindo';
    mostrarAviso("INSERINDO - Digite os atributos e clique em salvar");
}

function alterar() {
    bloquearAtributos(false);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'alterando';
    mostrarAviso("ALTERANDO - Digite os atributos e clique em salvar");
}

function excluir() {
    bloquearAtributos(true);
    visibilidadeDosBotoes('none', 'none', 'none', 'none', 'inline');
    oQueEstaFazendo = 'excluindo';
    mostrarAviso("EXCLUINDO - Clique em salvar para confirmar a exclusão");
}

// Lê os valores do formulário e monta o objeto enviado ao backend
function lerCampos() {
    const dados = {};
    dados[CHAVE] = document.getElementById(CHAVE_INPUT).value.trim();
    for (const campo of CAMPOS) {
        const el = document.getElementById('input_' + campo.key);
        if (campo.tipo === 'checkbox') {
            dados[campo.key] = el.checked;
        } else if (campo.tipo === 'number') {
            dados[campo.key] = el.value === '' ? null : Number(el.value);
        } else {
            dados[campo.key] = el.value === '' ? null : el.value;
        }
    }
    return dados;
}

async function salvar() {
    const dados = lerCampos();
    const id = dados[CHAVE];
    const cabecalho = { 'Content-Type': 'application/json' };

    try {
        let resposta;
        if (oQueEstaFazendo === 'inserindo') {
            resposta = await fetch(`${URL_API}${ROTA}`, { method: 'POST', headers: cabecalho, body: JSON.stringify(dados) });
        } else if (oQueEstaFazendo === 'alterando') {
            resposta = await fetch(`${URL_API}${ROTA}/${id}`, { method: 'PUT', headers: cabecalho, body: JSON.stringify(dados) });
        } else if (oQueEstaFazendo === 'excluindo') {
            resposta = await fetch(`${URL_API}${ROTA}/${id}`, { method: 'DELETE' });
        } else {
            return;
        }

        const data = await resposta.json();
        if (!data.sucesso) {
            mostrarAviso(data.mensagem || "Erro ao efetuar operação.");
            return;
        }

        if (oQueEstaFazendo === 'inserindo' || oQueEstaFazendo === 'alterando') {
            await uploadImagemParaServidor(id);
        } else if (oQueEstaFazendo === 'excluindo') {
            carregarImagem(null);
        }

        const mensagem = data.mensagem;
        visibilidadeDosBotoes('inline', 'none', 'none', 'none', 'none');
        limparAtributos();
        document.getElementById(CHAVE_INPUT).value = "";
        await listar();
        mostrarAviso(mensagem);
    } catch (erro) {
        mostrarAviso("Erro ao efetuar operação no servidor.");
    }
}

async function listar() {
    try {
        const resposta = await fetch(`${URL_API}${ROTA}/listar`);
        const data = await resposta.json();

        if (data.sucesso) {
            let html = '<table><thead><tr>';
            COLUNAS.forEach(c => html += `<th>${c[0]}</th>`);
            html += '</tr></thead><tbody>';
            for (const l of data[LISTA]) {
                html += `<tr onclick="selecionar(${l[CHAVE]})">`;
                COLUNAS.forEach(c => html += `<td>${escapar(c[1](l))}</td>`);
                html += '</tr>';
            }
            html += '</tbody></table>';
            document.getElementById("outputSaida").innerHTML = data[LISTA].length ? html : "Nenhum registro cadastrado.";
        } else {
            document.getElementById("outputSaida").innerHTML = `Erro no banco: ${data.mensagem}`;
        }
    } catch (erro) {
        document.getElementById("outputSaida").innerHTML = "Servidor offline ou erro de conexão.";
    }
}

function cancelarOperacao() {
    limparAtributos();
    carregarImagem(null);
    bloquearAtributos(true);
    visibilidadeDosBotoes('inline', 'none', 'none', 'none', 'none');
    mostrarAviso("Cancelou a operação");
}

function mostrarAviso(mensagem) {
    document.getElementById("divAviso").innerHTML = mensagem;
}

function mostrarDados(registro) {
    document.getElementById(CHAVE_INPUT).value = registro[CHAVE];
    for (const campo of CAMPOS) {
        const el = document.getElementById('input_' + campo.key);
        if (campo.tipo === 'checkbox') {
            el.checked = !!registro[campo.key];
        } else {
            el.value = registro[campo.key] ?? "";
        }
    }
    bloquearAtributos(true);
}

function limparAtributos() {
    oQueEstaFazendo = '';
    for (const campo of CAMPOS) {
        const el = document.getElementById('input_' + campo.key);
        if (campo.tipo === 'checkbox') {
            el.checked = false;
        } else {
            el.value = "";
        }
    }
    document.getElementById('inputImagem').value = "";
    bloquearAtributos(true);
}

// soLeitura = true  -> campos travados e a chave primária liberada (modo busca)
// soLeitura = false -> campos liberados e a chave primária travada (modo edição)
function bloquearAtributos(soLeitura) {
    document.getElementById(CHAVE_INPUT).readOnly = !soLeitura;
    for (const campo of CAMPOS) {
        const el = document.getElementById('input_' + campo.key);
        if (campo.tipo === 'select' || campo.tipo === 'checkbox') {
            el.disabled = soLeitura;
        } else {
            el.readOnly = soLeitura;
        }
    }
}

function visibilidadeDosBotoes(btP, btI, btA, btE, btS) {
    document.getElementById("btProcure").style.display = btP;
    document.getElementById("btInserir").style.display = btI;
    document.getElementById("btAlterar").style.display = btA;
    document.getElementById("btExcluir").style.display = btE;
    document.getElementById("btSalvar").style.display = btS;
    document.getElementById("btCancelar").style.display = btS;
}
