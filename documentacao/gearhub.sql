-- =====================================================================
-- Gearhub V2 - DDL + carga inicial (PostgreSQL)
-- Antes de executar, crie o banco:   CREATE DATABASE gearhub;
-- Depois conecte nele (\c gearhub) e execute este arquivo inteiro.
-- =====================================================================

-- Recriação limpa (ordem inversa das dependências)
DROP TABLE IF EXISTS public.especificacao CASCADE;
DROP TABLE IF EXISTS public.periferico CASCADE;
DROP TABLE IF EXISTS public.fabricante CASCADE;
DROP TABLE IF EXISTS public.categoria CASCADE;

-- ---------------------------------------------------------------------
-- 1. CREATE TABLE
-- ---------------------------------------------------------------------

-- Tabela independente
CREATE TABLE public.categoria (
    id_categoria        integer      NOT NULL,
    nome_categoria      varchar(50)  NOT NULL,
    descricao_categoria varchar(150),
    CONSTRAINT categoria_pkey PRIMARY KEY (id_categoria),
    CONSTRAINT categoria_nome_unique UNIQUE (nome_categoria)
);

-- Tabela independente
CREATE TABLE public.fabricante (
    id_fabricante   integer      NOT NULL,
    nome_fabricante varchar(50)  NOT NULL,
    pais_fabricante varchar(40),
    CONSTRAINT fabricante_pkey PRIMARY KEY (id_fabricante)
);

-- Relacionamento 1:N -> uma categoria tem N periféricos; um fabricante tem N periféricos
CREATE TABLE public.periferico (
    id_periferico                 integer        NOT NULL,
    nome_periferico               varchar(80)    NOT NULL,
    preco_periferico              numeric(10,2)  NOT NULL DEFAULT 0,
    quantidade_estoque_periferico integer        NOT NULL DEFAULT 0,
    id_categoria                  integer        NOT NULL,
    id_fabricante                 integer        NOT NULL,
    CONSTRAINT periferico_pkey PRIMARY KEY (id_periferico),
    CONSTRAINT fk_periferico_categoria  FOREIGN KEY (id_categoria)  REFERENCES public.categoria (id_categoria),
    CONSTRAINT fk_periferico_fabricante FOREIGN KEY (id_fabricante) REFERENCES public.fabricante (id_fabricante),
    CONSTRAINT periferico_preco_check   CHECK (preco_periferico >= 0),
    CONSTRAINT periferico_estoque_check CHECK (quantidade_estoque_periferico >= 0)
);

-- Relacionamento 1:1 -> cada periférico tem no máximo UMA especificação.
-- A PK é também a FK (id_periferico), o que garante a cardinalidade 1:1.
CREATE TABLE public.especificacao (
    id_periferico                integer      NOT NULL,
    conexao_especificacao        varchar(30),
    garantia_meses_especificacao integer      NOT NULL DEFAULT 0,
    peso_gramas_especificacao    integer      NOT NULL DEFAULT 0,
    iluminacao_rgb_especificacao boolean      NOT NULL DEFAULT false,
    detalhes_especificacao       varchar(200),
    CONSTRAINT especificacao_pkey PRIMARY KEY (id_periferico),
    CONSTRAINT fk_especificacao_periferico FOREIGN KEY (id_periferico)
        REFERENCES public.periferico (id_periferico) ON DELETE CASCADE,
    CONSTRAINT especificacao_garantia_check CHECK (garantia_meses_especificacao >= 0),
    CONSTRAINT especificacao_peso_check     CHECK (peso_gramas_especificacao >= 0)
);

-- ---------------------------------------------------------------------
-- 2. INSERT INTO (mínimo de 10 registros por tabela)
-- ---------------------------------------------------------------------

-- 2.1 CATEGORIA (10)
INSERT INTO public.categoria (id_categoria, nome_categoria, descricao_categoria) VALUES
(1,  'Teclado',       'Teclados mecânicos, de membrana e compactos'),
(2,  'Mouse',         'Mouses gamer e de produtividade'),
(3,  'Headset',       'Fones com microfone para jogos e chamadas'),
(4,  'Monitor',       'Monitores com alta taxa de atualização'),
(5,  'Mousepad',      'Superfícies para mouse em vários tamanhos'),
(6,  'Webcam',        'Câmeras para streaming e reuniões'),
(7,  'Microfone',     'Microfones USB para streaming e podcast'),
(8,  'Cadeira Gamer', 'Cadeiras ergonômicas para longas sessões'),
(9,  'Gamepad',       'Controles para PC e consoles'),
(10, 'Acessórios',    'Hubs, suportes e itens úteis para o setup');

-- 2.2 FABRICANTE (10)
INSERT INTO public.fabricante (id_fabricante, nome_fabricante, pais_fabricante) VALUES
(1,  'Logitech',    'Suíça'),
(2,  'Razer',       'Estados Unidos'),
(3,  'Redragon',    'China'),
(4,  'HyperX',      'Estados Unidos'),
(5,  'Corsair',     'Estados Unidos'),
(6,  'SteelSeries', 'Dinamarca'),
(7,  'Fifine',      'China'),
(8,  'Multilaser',  'Brasil'),
(9,  'Samsung',     'Coreia do Sul'),
(10, 'Elgato',      'Alemanha');

-- 2.3 PERIFERICO (12) - cada linha referencia uma categoria e um fabricante (1:N)
INSERT INTO public.periferico
    (id_periferico, nome_periferico, preco_periferico, quantidade_estoque_periferico, id_categoria, id_fabricante) VALUES
(1,  'Teclado Mecânico Kumara K552',   189.90, 40, 1, 3),
(2,  'Mouse G203 Lightsync',           139.90, 75, 2, 1),
(3,  'Headset Cloud II',               599.90, 25, 3, 4),
(4,  'Monitor Odyssey G3 24" 144Hz',  1099.00, 15, 4, 9),
(5,  'Mousepad QcK Heavy XL',          149.90, 60, 5, 6),
(6,  'Webcam C920 HD Pro',             379.90, 30, 6, 1),
(7,  'Microfone Fifine AmpliGame A6',  259.90, 35, 7, 7),
(8,  'Cadeira Gamer Elite Reclinável', 899.90, 10, 8, 8),
(9,  'Controle Wolverine V2',          699.90, 20, 9, 2),
(10, 'Hub USB 3.0 4 Portas',            59.90, 120, 10, 8),
(11, 'Headset Virtuoso RGB Wireless',  999.90, 12, 3, 5),
(12, 'Stream Deck Mini',               599.90, 18, 10, 10);

-- 2.4 ESPECIFICACAO (12) - no máximo uma por periférico (1:1)
INSERT INTO public.especificacao
    (id_periferico, conexao_especificacao, garantia_meses_especificacao, peso_gramas_especificacao, iluminacao_rgb_especificacao, detalhes_especificacao) VALUES
(1,  'USB com fio',       12, 850,  true,  'Switch mecânico outemu blue, layout ABNT2, iluminação LED'),
(2,  'USB com fio',       24, 85,   true,  'Sensor óptico de 8000 DPI, 6 botões programáveis'),
(3,  'P2 / USB',          24, 320,  false, 'Drivers de 53 mm, microfone removível com cancelamento de ruído'),
(4,  'HDMI / DisplayPort',36, 3800, false, 'Painel VA 144 Hz, 1 ms, Full HD, FreeSync Premium'),
(5,  'Não se aplica',     6,  650,  false, 'Tecido micro-texturizado, base de borracha antiderrapante, 900x400 mm'),
(6,  'USB com fio',       24, 162,  false, 'Full HD 1080p 30 fps, microfone estéreo embutido'),
(7,  'USB com fio',       12, 420,  true,  'Condensador cardioide, botão mute com LED, suporte de mesa incluso'),
(8,  'Não se aplica',     12, 18500,false, 'Encosto reclinável 180 graus, apoio de braço ajustável, suporta 120 kg'),
(9,  'USB com fio',       12, 280,  false, 'Gatilhos mecânicos, botões multifunção extras, compatível com PC e Xbox'),
(10, 'USB 3.0',           6,  45,   false, '4 portas USB 3.0, velocidade de até 5 Gbps, cabo de 30 cm'),
(11, 'Wireless 2.4 GHz',  24, 370,  true,  'Bateria de até 20 horas, áudio hi-fi, microfone flip-to-mute'),
(12, 'USB com fio',       12, 100,  false, '6 teclas LCD personalizáveis para atalhos, macros e streaming');

-- ---------------------------------------------------------------------
-- 3. Consultas de conferência
-- ---------------------------------------------------------------------
-- Periféricos com categoria e fabricante (JOIN 1:N):
-- SELECT p.id_periferico, p.nome_periferico, c.nome_categoria, f.nome_fabricante
-- FROM periferico p JOIN categoria c USING (id_categoria) JOIN fabricante f USING (id_fabricante);
--
-- Periféricos com especificação (JOIN 1:1):
-- SELECT p.nome_periferico, e.conexao_especificacao, e.garantia_meses_especificacao
-- FROM periferico p JOIN especificacao e USING (id_periferico);
