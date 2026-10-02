const { query } = require('../database');

// A chave primária da especificação é o próprio id do periférico (relação 1:1)
const SQL_BASE = `
    SELECT e.id_periferico, p.nome_periferico, e.conexao_especificacao,
           e.garantia_meses_especificacao, e.peso_gramas_especificacao,
           e.iluminacao_rgb_especificacao, e.detalhes_especificacao
    FROM public.especificacao e
    JOIN public.periferico p ON p.id_periferico = e.id_periferico
`;

// Listar todas as especificações
exports.listarEspecificacoes = async (req, res) => {
    try {
        const result = await query(SQL_BASE + ' ORDER BY e.id_periferico');
        res.json({ sucesso: true, especificacoes: result.rows });
    } catch (error) {
        console.error('Erro ao listar especificações:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao listar especificações.' });
    }
};

// Obter especificação pelo id do periférico
exports.obterEspecificacao = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ sucesso: false, mensagem: 'ID inválido.' });
        }

        const result = await query(SQL_BASE + ' WHERE e.id_periferico = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Especificação não encontrada.' });
        }

        res.json({ sucesso: true, especificacao: result.rows[0] });
    } catch (error) {
        console.error('Erro ao obter especificação:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor.' });
    }
};

// Criar especificação
exports.criarEspecificacao = async (req, res) => {
    try {
        const { id_periferico, conexao_especificacao, garantia_meses_especificacao,
                peso_gramas_especificacao, iluminacao_rgb_especificacao, detalhes_especificacao } = req.body;
        const id = parseInt(id_periferico, 10);

        if (isNaN(id)) {
            return res.status(400).json({ sucesso: false, mensagem: 'Informe o ID de um periférico existente.' });
        }

        const sql = `
            INSERT INTO public.especificacao
                (id_periferico, conexao_especificacao, garantia_meses_especificacao,
                 peso_gramas_especificacao, iluminacao_rgb_especificacao, detalhes_especificacao)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const values = [
            id,
            conexao_especificacao || null,
            garantia_meses_especificacao || 0,
            peso_gramas_especificacao || 0,
            iluminacao_rgb_especificacao === true,
            detalhes_especificacao || null
        ];

        const result = await query(sql, values);
        res.status(201).json({ sucesso: true, mensagem: 'Especificação inserida com sucesso!', especificacao: result.rows[0] });
    } catch (error) {
        console.error('Erro ao criar especificação:', error);
        if (error.code === '23505') {
            return res.status(400).json({ sucesso: false, mensagem: 'Este periférico já possui especificação (relação 1:1).' });
        }
        if (error.code === '23503') {
            return res.status(400).json({ sucesso: false, mensagem: 'O periférico informado não existe.' });
        }
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao inserir especificação no banco de dados.' });
    }
};

// Atualizar especificação
exports.atualizarEspecificacao = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { conexao_especificacao, garantia_meses_especificacao,
                peso_gramas_especificacao, iluminacao_rgb_especificacao, detalhes_especificacao } = req.body;

        const sql = `
            UPDATE public.especificacao
            SET conexao_especificacao = $1,
                garantia_meses_especificacao = $2,
                peso_gramas_especificacao = $3,
                iluminacao_rgb_especificacao = $4,
                detalhes_especificacao = $5
            WHERE id_periferico = $6
            RETURNING *
        `;
        const values = [
            conexao_especificacao || null,
            garantia_meses_especificacao || 0,
            peso_gramas_especificacao || 0,
            iluminacao_rgb_especificacao === true,
            detalhes_especificacao || null,
            id
        ];

        const result = await query(sql, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ sucesso: false, mensagem: 'Especificação não encontrada.' });
        }

        res.json({ sucesso: true, mensagem: 'Especificação alterada com sucesso!', especificacao: result.rows[0] });
    } catch (error) {
        console.error('Erro ao atualizar especificação:', error);
        if (error.code === '23514') {
            return res.status(400).json({ sucesso: false, mensagem: 'Garantia e peso não podem ser negativos.' });
        }
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao atualizar especificação.' });
    }
};

// Deletar especificação
exports.deletarEspecificacao = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        await query('DELETE FROM public.especificacao WHERE id_periferico = $1', [id]);
        res.json({ sucesso: true, mensagem: 'Especificação excluída com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar especificação:', error);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao excluir especificação.' });
    }
};
