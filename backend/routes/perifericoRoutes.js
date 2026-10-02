const express = require('express');
const multer = require('multer');
const router = express.Router();
const perifericoController = require('../controllers/perifericoController');

// Multer guarda o arquivo em memória para o Sharp processar
const upload = multer({ storage: multer.memoryStorage() });

// Rotas do CRUD de Periféricos
router.get('/listar', perifericoController.listarPerifericos);
router.get('/:id', perifericoController.obterPeriferico);
router.post('/', perifericoController.criarPeriferico);
router.put('/:id', perifericoController.atualizarPeriferico);
router.delete('/:id', perifericoController.deletarPeriferico);

// Upload da imagem do periférico (salva em imagens/<id>.png)
router.post('/upload/:id', upload.single('imagem'), perifericoController.uploadImagem);

module.exports = router;
