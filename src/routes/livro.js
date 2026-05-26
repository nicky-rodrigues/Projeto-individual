var express = require("express");
var router = express.Router();

// Importa o controller de livro
// O controller valida os dados recebidos e chama o model
var livroController = require("../controllers/livroController");


// Rota POST usada para cadastrar um livro
// Antes de criar um novo livro, o controller verifica se o título já existe
router.post("/cadastrar", function (req, res) {
    livroController.cadastrar(req, res);
});


// Rota GET usada para listar os livros cadastrados
// Essa rota é usada principalmente na página Explorar
router.get("/", function (req, res) {
    livroController.listar(req, res);
});


module.exports = router;