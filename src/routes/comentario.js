var express = require("express");
var router = express.Router();

// Importa o controller de comentário
// O controller valida os dados recebidos e chama o model
var comentarioController = require("../controllers/comentarioController");


// Rota POST usada para cadastrar um novo comentário
// Ela recebe o usuário, a publicação e o texto do comentário pelo body no js
router.post("/cadastrar", function (req, res) {
    comentarioController.cadastrar(req, res);
});


// Rota GET usada para listar os comentários de uma publicação específica
// O id da publicação vem pela URL como parâmetro( ex = /perfis/listar/1)
router.get("/publicacao/:fkPublicacao", function (req, res) {
    comentarioController.listarPorPublicacao(req, res);
});


module.exports = router;