const express = require('express');
const router = express.Router();
const especificacaoController = require('../controllers/especificacaoController');

// Rotas do CRUD de Especificacoes
// (/listar precisa vir antes de /:id)
router.get('/listar', especificacaoController.listarEspecificacoes);
router.get('/:id', especificacaoController.obterEspecificacao);
router.post('/', especificacaoController.criarEspecificacao);
router.put('/:id', especificacaoController.atualizarEspecificacao);
router.delete('/:id', especificacaoController.deletarEspecificacao);

module.exports = router;
