var express = require("express");
var router = express.Router();

// Importa o controller de curtida
// O controller valida os dados recebidos e chama o model
var curtidaController = require("../controllers/curtidaController");


// Rota POST usada para curtir uma publicação
// Ela recebe o usuário e a publicação pelo body da requisição no js
router.post("/curtir", function (req, res) {
    curtidaController.curtir(req, res);
});


// Rota DELETE usada para remover a curtida de uma publicação
// Ela também recebe o usuário e a publicação pelo body da requisição no js
router.delete("/descurtir", function (req, res) {
    curtidaController.descurtir(req, res);
});


// Rota GET usada para contar quantas curtidas uma publicação possui
// O id da publicação vem pela URL como parâmetro( ex = /perfis/listar/1)
router.get("/publicacao/:fkPublicacao", function (req, res) {
    curtidaController.contarCurtidas(req, res);
});


// Rota GET usada para verificar se um usuário já curtiu uma publicação
// Essa rota ajuda o front-end a mostrar "Curtir" ou "Curtido"
router.get("/verificar/:fkPublicacao/:fkUsuario", function (req, res) {
    curtidaController.verificarCurtida(req, res);
});


module.exports = router;