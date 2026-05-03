var livroModel = require("../models/livroModel");

function cadastrar(req, res) {
    var titulo = req.body.tituloServer;
    var autor = req.body.autorServer;
    var genero = req.body.generoServer;

    console.log("Dados recebidos no livroController:");
    console.log("titulo:", titulo);
    console.log("autor:", autor);
    console.log("genero:", genero);

    if (titulo == undefined || titulo == "") {
        res.status(400).send("O título está undefined ou vazio!");
    } else if (autor == undefined || autor == "") {
        res.status(400).send("O autor está undefined ou vazio!");
    } else if (genero == undefined || genero == "") {
        res.status(400).send("O gênero está undefined ou vazio!");
    } else {
        livroModel.cadastrar(titulo, autor, genero)
            .then(function (resultado) {
                console.log("Livro cadastrado com sucesso:");
                console.log(resultado);

                res.json(resultado);
            })
            .catch(function (erro) {
                console.log("Erro ao cadastrar livro:");
                console.log(erro);

                res.status(500).json(erro.sqlMessage);
            });
    }
}

function listar(req, res) {
    livroModel.listar()
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            console.log("Erro ao listar livros:");
            console.log(erro);

            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    cadastrar,
    listar
};