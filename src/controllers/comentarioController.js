var comentarioModel = require("../models/comentarioModel");

function cadastrar(req, res) {
    var fkUsuario = req.body.fkUsuarioServer;
    var fkPublicacao = req.body.fkPublicacaoServer;
    var texto = req.body.textoServer;

    if (fkUsuario == undefined) {
        res.status(400).send("fkUsuario está undefined!");
    } else if (fkPublicacao == undefined) {
        res.status(400).send("fkPublicacao está undefined!");
    } else if (texto == undefined) {
        res.status(400).send("texto está undefined!");
    } else {
        comentarioModel.cadastrar(fkUsuario, fkPublicacao, texto)
            .then(function (resultado) {
                res.json(resultado);
            }).catch(function (erro) {
                console.log(erro);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

function listarPorPublicacao(req, res) {
    var fkPublicacao = req.params.fkPublicacao;

    comentarioModel.listarPorPublicacao(fkPublicacao)
        .then(function (resultado) {
            res.json(resultado);
        }).catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    cadastrar,
    listarPorPublicacao
};