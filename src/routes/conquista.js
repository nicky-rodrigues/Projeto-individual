var express = require("express");
var router = express.Router();

var conquistaController = require("../controllers/conquistaController");

router.post("/salvar-ou-atualizar", function (req, res) {
    conquistaController.salvarOuAtualizar(req, res);
});

router.get("/resumo/:fkUsuario", function (req, res) {
    conquistaController.listarResumo(req, res);
});

router.get("/historico/:fkUsuario", function (req, res) {
    conquistaController.listarHistorico(req, res);
});

module.exports = router;