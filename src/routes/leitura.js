var express = require("express");
var router = express.Router();

// Importa o controller de leitura
// O controller valida os dados recebidos e chama o model
var leituraController = require("../controllers/leituraController");


// Rota POST usada para cadastrar uma nova leitura
// Ela é chamada quando o usuário registra um livro na estante
router.post("/cadastrar", function (req, res) {
    leituraController.cadastrar(req, res);
});


// Rota PUT usada para atualizar uma leitura já cadastrada (ela atualiza status, nota e comentário da leitura)
router.put("/atualizar", function (req, res) {
    leituraController.atualizar(req, res);
});


// Rota GET usada para listar todas as leituras de um usuário (essa rota vai alimentar a página Registrar, Perfil e Dashboard)
router.get("/usuario/:fkUsuario", function (req, res) {
    leituraController.listarPorUsuario(req, res);
});


// Rota GET usada para buscar dados agrupados para dashboard (Ela retorna quantidade de leituras por gênero e status)
router.get("/dashboard/:fkUsuario", function (req, res) {
    leituraController.buscarDadosDashboard(req, res);
});


module.exports = router;