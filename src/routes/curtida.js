var express = require("express");
var router = express.Router();

var curtidaController = require("../controllers/curtidaController");

router.post("/curtir", function (req, res) {
    curtidaController.curtir(req, res);
});

router.delete("/descurtir", function (req, res) {
    curtidaController.descurtir(req, res);
});

router.get("/publicacao/:fkPublicacao", function (req, res) {
    curtidaController.contarCurtidas(req, res);
});

module.exports = router;