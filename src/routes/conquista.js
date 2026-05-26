var express = require("express");
var router = express.Router();

// Importa o controller de conquista
// O controller valida os dados recebidos e chama o model
var conquistaController = require("../controllers/conquistaController");


// Rota POST usada para salvar ou atualizar a conquista do mês (chamada pela dashboard quando o usuário atinge bronze, prata ou ouro)
router.post("/salvar-ou-atualizar", function (req, res) {
    conquistaController.salvarOuAtualizar(req, res);
});


// Rota GET usada para buscar um resumo das medalhas do usuário (Retorna quantas medalhas de cada tipo o usuário possui)
router.get("/resumo/:fkUsuario", function (req, res) {
    conquistaController.listarResumo(req, res);
});


// Rota GET usada para buscar o histórico mensal de conquistas (Retorna as medalhas salvas mês a mês)
router.get("/historico/:fkUsuario", function (req, res) {
    conquistaController.listarHistorico(req, res);
});


module.exports = router;