const express = require('express');
const router = express.Router();
const fabricanteController = require('../controllers/fabricanteController');

// Rotas do CRUD de Fabricantes
// (/listar precisa vir antes de /:id)
router.get('/listar', fabricanteController.listarFabricantes);
router.get('/:id', fabricanteController.obterFabricante);
router.post('/', fabricanteController.criarFabricante);
router.put('/:id', fabricanteController.atualizarFabricante);
router.delete('/:id', fabricanteController.deletarFabricante);

module.exports = router;
