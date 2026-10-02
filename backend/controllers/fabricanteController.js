const { query } = require('../database');

// Listar todos os fabricantes
exports.listarFabricantes = async (req, res) => {
    try {
        const result = await query('SELECT * FROM public.fabricante ORDER BY id_fabricante');
        res.json({ sucesso: true, fabricantes: result.rows });
    } catch (error) {
        console.error('Erro ao listar fabricantes:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar fabricantes.' });
    }
};

// Obter fabricante por ID
exports.obterFabricante = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID inválido.' });
        }

        const result = await query('SELECT * FROM public.fabricante WHERE id_fabricante = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Fabricante não encontrado.' });
        }

        res.json({ sucesso: true, fabricante: result.rows[0] });
    } catch (error) {
        console.error('Erro ao obter fabricante:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
    }
};

// Criar fabricante
exports.criarFabricante = async (req, res) => {
    try {
        const { id_fabricante, nome_fabricante, pais_fabricante } = req.body;
        const id = parseInt(id_fabricante, 10);

        if (isNaN(id)) {
            return res.status(400).json({ sucesso: false, mensagem: 'O ID do fabricante deve ser um número inteiro.' });
        }
        if (!nome_fabricante || !nome_fabricante.trim()) {
            return res.status(400).json({ sucesso: false, mensagem: 'O nome do fabricante é obrigatório.' });
        }

        const sql = `
            INSERT INTO public.fabricante (id_fabricante, nome_fabricante, pais_fabricante)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        const result = await query(sql, [id, nome_fabricante.trim(), pais_fabricante || null]);
        res.status(201).json({ sucesso: true, mensagem: 'Fabricante inserido com sucesso!', fabricante: result.rows[0] });
    } catch (error) {
        console.error('Erro ao criar fabricante:', error);
        if (error.code === '23505') {
            return res.status(400).json({ sucesso: false, mensagem: 'Já existe um fabricante com esse ID.' });
        }
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao inserir fabricante no banco de dados.' });
    }
};

// Atualizar fabricante
exports.atualizarFabricante = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { nome_fabricante, pais_fabricante } = req.body;

        if (!nome_fabricante || !nome_fabricante.trim()) {
            return res.status(400).json({ sucesso: false, mensagem: 'O nome do fabricante é obrigatório.' });
        }

        const sql = `
            UPDATE public.fabricante
            SET nome_fabricante = $1, pais_fabricante = $2
            WHERE id_fabricante = $3
            RETURNING *
        `;
        const result = await query(sql, [nome_fabricante.trim(), pais_fabricante || null, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Fabricante não encontrado.' });
        }

        res.json({ sucesso: true, mensagem: 'Fabricante alterado com sucesso!', fabricante: result.rows[0] });
    } catch (error) {
        console.error('Erro ao atualizar fabricante:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar fabricante.' });
    }
};

// Deletar fabricante
exports.deletarFabricante = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        await query('DELETE FROM public.fabricante WHERE id_fabricante = $1', [id]);
        res.json({ sucesso: true, mensagem: 'Fabricante excluído com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar fabricante:', error);
        if (error.code === '23503') {
            return res.status(400).json({ sucesso: false, mensagem: 'Não é possível excluir: existem periféricos deste fabricante.' });
        }
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao excluir fabricante.' });
    }
};
