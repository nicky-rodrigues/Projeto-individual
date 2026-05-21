var express = require("express");
var router = express.Router();

// Importa o controller de usuário (onde estão as regras de cada ação)
var usuarioController = require("../controllers/usuarioController");


// Rota POST responsável por cadastrar um novo usuário
router.post("/cadastrar", function (req, res) {
    usuarioController.cadastrar(req, res);
})

// Rota POST responsável por autenticar o login do usuário
router.post("/autenticar", function (req, res) {
    usuarioController.autenticar(req, res);
});

// Rota GET responsável por listar todos os usuários cadastrados
router.get("/", function (req, res) {
    usuarioController.listarUsuariosCadastrados(req, res);
});

// Exporta as rotas para serem usadas no arquivo principal do servidor
module.exports = router;