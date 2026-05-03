var express = require("express");
var router = express.Router();

var leituraController = require("../controllers/leituraController");

router.post("/cadastrar", function (req, res) {
    leituraController.cadastrar(req, res);
});

router.put("/atualizar", function (req, res) {
    leituraController.atualizar(req, res);
});

router.get("/usuario/:fkUsuario", function (req, res) {
    leituraController.listarPorUsuario(req, res);
});

router.get("/dashboard/:fkUsuario", function (req, res) {
    leituraController.buscarDadosDashboard(req, res);
});

module.exports = router;