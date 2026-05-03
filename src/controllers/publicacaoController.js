var publicacaoModel = require("../models/publicacaoModel");

function cadastrar(req, res) {
    var fkUsuario = req.body.fkUsuarioServer;
    var fkLivro = req.body.fkLivroServer;
    var tipoPublicacao = req.body.tipoPublicacaoServer;
    var texto = req.body.textoServer;

    if (fkUsuario == undefined) {
        res.status(400).send("fkUsuario está undefined!");
    } else if (tipoPublicacao == undefined) {
        res.status(400).send("tipoPublicacao está undefined!");
    } else if (texto == undefined) {
        res.status(400).send("texto está undefined!");
    } else {
        if (fkLivro == undefined || fkLivro == "") {
            fkLivro = "NULL";
        }

        publicacaoModel.cadastrar(fkUsuario, fkLivro, tipoPublicacao, texto)
            .then(function (resultado) {
                res.json(resultado);
            }).catch(function (erro) {
                console.log(erro);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

function listar(req, res) {
    publicacaoModel.listar()
        .then(function (resultado) {
            res.json(resultado);
        }).catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

function listarPorUsuario(req, res) {
    var fkUsuario = req.params.fkUsuario;

    publicacaoModel.listarPorUsuario(fkUsuario)
        .then(function (resultado) {
            res.json(resultado);
        }).catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    cadastrar,
    listar,
    listarPorUsuario
};