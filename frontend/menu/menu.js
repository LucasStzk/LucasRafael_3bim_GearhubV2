const URL_API = 'http://localhost:3001';

// Busca os totais no backend e mostra no resumo da página inicial
async function carregarResumo() {
    try {
        const [rp, rc, rf] = await Promise.all([
            fetch(`${URL_API}/periferico/listar`).then(r => r.json()),
            fetch(`${URL_API}/categoria/listar`).then(r => r.json()),
            fetch(`${URL_API}/fabricante/listar`).then(r => r.json())
        ]);

        document.getElementById('totPerifericos').textContent = rp.perifericos.length;
        document.getElementById('totCategorias').textContent = rc.categorias.length;
        document.getElementById('totFabricantes').textContent = rf.fabricantes.length;
        document.getElementById('totEstoque').textContent =
            rp.perifericos.reduce((soma, p) => soma + p.quantidade_estoque_periferico, 0);
    } catch (erro) {
        console.warn('Aviso: Não foi possível conectar ao servidor backend em ' + URL_API);
    }
}
