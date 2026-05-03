var express = require("express");
var router = express.Router();

var publicacaoController = require("../controllers/publicacaoController");

router.post("/cadastrar", function (req, res) {
    publicacaoController.cadastrar(req, res);
});

router.get("/", function (req, res) {
    publicacaoController.listar(req, res);
});

router.get("/usuario/:fkUsuario", function (req, res) {
    publicacaoController.listarPorUsuario(req, res);
});

module.exports = router;