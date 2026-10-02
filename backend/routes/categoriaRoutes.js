const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');

// Rotas do CRUD de Categorias
// (/listar precisa vir antes de /:id)
router.get('/listar', categoriaController.listarCategorias);
router.get('/:id', categoriaController.obterCategoria);
router.post('/', categoriaController.criarCategoria);
router.put('/:id', categoriaController.atualizarCategoria);
router.delete('/:id', categoriaController.deletarCategoria);

module.exports = router;
