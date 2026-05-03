var express = require("express");
var router = express.Router();

var livroController = require("../controllers/livroController");

router.post("/cadastrar", function (req, res) {
    livroController.cadastrar(req, res);
});

router.get("/", function (req, res) {
    livroController.listar(req, res);
});

module.exports = router;