var express = require("express");
var router = express.Router();

// Importa o controller de perfil
// O controller valida os dados recebidos e chama o model
var perfilController = require("../controllers/perfilController");


// Rota POST usada para cadastrar um novo perfil (chamada quando o usuário ainda não possui informações salvas)
router.post("/cadastrar", function (req, res) {
    perfilController.cadastrar(req, res);
});


// Rota PUT usada para atualizar um perfil já existente (chamada quando o usuário edita bio, gênero favorito, livro favorito ou meta mensal)
router.put("/atualizar", function (req, res) {
    perfilController.atualizar(req, res);
});


// Rota GET usada para buscar o perfil de um usuário específico (O id do usuário vem pela URL como parâmetro; ex = /perfis/listar/1)
router.get("/listar/:fkUsuario", function (req, res) {
    perfilController.listarPorUsuario(req, res);
});


module.exports = router;