const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Importa a função de consulta do banco
const { query } = require('./database');

// Importa as rotas (Router = mapeamento dos endpoints)
const categoriaRoutes = require('./routes/categoriaRoutes');
const fabricanteRoutes = require('./routes/fabricanteRoutes');
const perifericoRoutes = require('./routes/perifericoRoutes');
const especificacaoRoutes = require('./routes/especificacaoRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Servir imagens dos periféricos e o front-end (assim http://localhost:3001 já abre o sistema)
app.use('/imagens', express.static(path.join(__dirname, '../imagens')));
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => res.redirect('/frontend/menu/menu.html'));

// Definir Rotas
app.use('/categoria', categoriaRoutes);
app.use('/fabricante', fabricanteRoutes);
app.use('/periferico', perifericoRoutes);
app.use('/especificacao', especificacaoRoutes);

const PORT = process.env.PORT || 3001;

// Inicializa o servidor e testa o PostgreSQL
app.listen(PORT, async () => {
    console.log(`\n=================================`);
    console.log(`🚀 Gearhub V2 executando na porta ${PORT}`);
    console.log(`🌐 Abra: http://localhost:${PORT}`);

    try {
        await query('SELECT 1');
        console.log(`✅ Banco de Dados ${process.env.DB_NAME} conectado com sucesso!`);
    } catch (error) {
        console.error(`❌ FALHA NA CONEXÃO COM O BANCO DE DADOS:`);
        console.error(`   Motivo: ${error.message}`);
        console.error(`👉 Ajuste o arquivo backend/.env com a senha correta do seu PostgreSQL.`);
    }
    console.log(`=================================\n`);
});
