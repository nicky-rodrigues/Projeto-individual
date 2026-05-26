var express = require("express");
var router = express.Router();

// Importa o controller de publicação
// O controller contém as funções que validam os dados e chamar o model
var publicacaoController = require("../controllers/publicacaoController");


// Rota POST usada para cadastrar uma nova publicação no feed
// Ela recebe os dados enviados pelo front-end e encaminha para o controller
router.post("/cadastrar", function (req, res) {
    publicacaoController.cadastrar(req, res);
});


// Rota GET usada para listar todas as publicações do feed (rota usada na página inicial para carregar o feed)
router.get("/", function (req, res) {
    publicacaoController.listar(req, res);
});


// Rota GET usada para listar publicações de um usuário específico (O id do usuário vem pela URL como parâmetro; ex = /perfis/listar/1)
router.get("/usuario/:fkUsuario", function (req, res) {
    publicacaoController.listarPorUsuario(req, res);
});


module.exports = router;