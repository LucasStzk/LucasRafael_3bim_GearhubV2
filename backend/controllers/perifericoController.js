const { query } = require('../database');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// SELECT base com JOIN (traz o nome da categoria e do fabricante - relação 1:N)
const SQL_BASE = `
    SELECT p.id_periferico, p.nome_periferico, p.preco_periferico,
           p.quantidade_estoque_periferico, p.id_categoria, p.id_fabricante,
           c.nome_categoria, f.nome_fabricante
    FROM public.periferico p
    JOIN public.categoria c ON c.id_categoria = p.id_categoria
    JOIN public.fabricante f ON f.id_fabricante = p.id_fabricante
`;

// Listar todos os periféricos
exports.listarPerifericos = async (req, res) => {
    try {
        const result = await query(SQL_BASE + ' ORDER BY p.id_periferico');
        res.json({ sucesso: true, perifericos: result.rows });
    } catch (error) {
        console.error('Erro ao listar periféricos:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar periféricos.' });
    }
};

// Obter periférico por ID
exports.obterPeriferico = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID inválido.' });
        }

        const result = await query(SQL_BASE + ' WHERE p.id_periferico = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Periférico não encontrado.' });
        }

        res.json({ sucesso: true, periferico: result.rows[0] });
    } catch (error) {
        console.error('Erro ao obter periférico:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
    }
};

// Criar periférico
exports.criarPeriferico = async (req, res) => {
    try {
        const { id_periferico, nome_periferico, preco_periferico, quantidade_estoque_periferico, id_categoria, id_fabricante } = req.body;
        const id = parseInt(id_periferico, 10);

        if (isNaN(id)) {
            return res.status(400).json({ sucesso: false, mensagem: 'O ID do periférico deve ser um número inteiro.' });
        }
        if (!nome_periferico || !nome_periferico.trim()) {
            return res.status(400).json({ sucesso: false, mensagem: 'O nome do periférico é obrigatório.' });
        }
        if (!id_categoria || !id_fabricante) {
            return res.status(400).json({ sucesso: false, mensagem: 'Categoria e fabricante são obrigatórios.' });
        }

        const sql = `
            INSERT INTO public.periferico
                (id_periferico, nome_periferico, preco_periferico, quantidade_estoque_periferico, id_categoria, id_fabricante)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [
            id,
            nome_periferico.trim(),
            preco_periferico || 0,
            quantidade_estoque_periferico || 0,
            id_categoria,
            id_fabricante
        ];

        const result = await query(sql, values);
        res.status(201).json({ sucesso: true, mensagem: 'Periférico inserido com sucesso!', periferico: result.rows[0] });
    } catch (error) {
        console.error('Erro ao criar periférico:', error);
        if (error.code === '23505') {
            return res.status(400).json({ sucesso: false, mensagem: 'Já existe um periférico com esse ID.' });
        }
        if (error.code === '23503') {
            return res.status(400).json({ sucesso: false, mensagem: 'A categoria ou o fabricante informado não existe.' });
        }
        if (error.code === '23514') {
            return res.status(400).json({ sucesso: false, mensagem: 'Preço e estoque não podem ser negativos.' });
        }
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao inserir periférico no banco de dados.' });
    }
};

// Atualizar periférico
exports.atualizarPeriferico = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { nome_periferico, preco_periferico, quantidade_estoque_periferico, id_categoria, id_fabricante } = req.body;

        if (!nome_periferico || !nome_periferico.trim()) {
            return res.status(400).json({ sucesso: false, mensagem: 'O nome do periférico é obrigatório.' });
        }
        if (!id_categoria || !id_fabricante) {
            return res.status(400).json({ sucesso: false, mensagem: 'Categoria e fabricante são obrigatórios.' });
        }

        const sql = `
            UPDATE public.periferico
            SET nome_periferico = $1,
                preco_periferico = $2,
                quantidade_estoque_periferico = $3,
                id_categoria = $4,
                id_fabricante = $5
            WHERE id_periferico = $6
            RETURNING *
        `;
        const values = [
            nome_periferico.trim(),
            preco_periferico || 0,
            quantidade_estoque_periferico || 0,
            id_categoria,
            id_fabricante,
            id
        ];

        const result = await query(sql, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Periférico não encontrado.' });
        }

        res.json({ sucesso: true, mensagem: 'Periférico alterado com sucesso!', periferico: result.rows[0] });
    } catch (error) {
        console.error('Erro ao atualizar periférico:', error);
        if (error.code === '23503') {
            return res.status(400).json({ sucesso: false, mensagem: 'A categoria ou o fabricante informado não existe.' });
        }
        if (error.code === '23514') {
            return res.status(400).json({ sucesso: false, mensagem: 'Preço e estoque não podem ser negativos.' });
        }
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar periférico.' });
    }
};

// Upload e salvamento de imagem com Sharp (imagens/<id>.png)
exports.uploadImagem = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID inválido.' });
        }
        if (!req.file) {
            return res.status(400).json({ sucesso: false, mensagem: 'Nenhum arquivo enviado.' });
        }

        const pastaImagens = path.join(__dirname, '../../imagens');
        if (!fs.existsSync(pastaImagens)) {
            fs.mkdirSync(pastaImagens, { recursive: true });
        }

        const caminhoDestino = path.join(pastaImagens, `${id}.png`);

        // Processa e converte para PNG no tamanho ideal
        await sharp(req.file.buffer)
            .resize(400, 400, { fit: 'cover' })
            .toFormat('png')
            .toFile(caminhoDestino);

        res.json({ sucesso: true, mensagem: 'Imagem salva com sucesso!' });
    } catch (error) {
        console.error('Erro ao salvar imagem:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao processar imagem.' });
    }
};

// Deletar periférico (a especificação 1:1 é removida junto por ON DELETE CASCADE)
exports.deletarPeriferico = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);

        await query('DELETE FROM public.periferico WHERE id_periferico = $1', [id]);

        const imgPath = path.join(__dirname, '../../imagens', `${id}.png`);
        if (fs.existsSync(imgPath)) {
            fs.unlinkSync(imgPath);
        }

        res.json({ sucesso: true, mensagem: 'Periférico excluído com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar periférico:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao excluir periférico.' });
    }
};
