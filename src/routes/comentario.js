var express = require("express");
var router = express.Router();

var comentarioController = require("../controllers/comentarioController");

router.post("/cadastrar", function (req, res) {
    comentarioController.cadastrar(req, res);
});

router.get("/publicacao/:fkPublicacao", function (req, res) {
    comentarioController.listarPorPublicacao(req, res);
});

module.exports = router;