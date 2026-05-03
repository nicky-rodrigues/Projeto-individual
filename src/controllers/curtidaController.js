var curtidaModel = require("../models/curtidaModel");

function curtir(req, res) {
    var fkUsuario = req.body.fkUsuarioServer;
    var fkPublicacao = req.body.fkPublicacaoServer;

    if (fkUsuario == undefined) {
        res.status(400).send("fkUsuario está undefined!");
    } else if (fkPublicacao == undefined) {
        res.status(400).send("fkPublicacao está undefined!");
    } else {
        curtidaModel.curtir(fkUsuario, fkPublicacao)
            .then(function (resultado) {
                res.json(resultado);
            }).catch(function (erro) {
                console.log(erro);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

function descurtir(req, res) {
    var fkUsuario = req.body.fkUsuarioServer;
    var fkPublicacao = req.body.fkPublicacaoServer;

    if (fkUsuario == undefined) {
        res.status(400).send("fkUsuario está undefined!");
    } else if (fkPublicacao == undefined) {
        res.status(400).send("fkPublicacao está undefined!");
    } else {
        curtidaModel.descurtir(fkUsuario, fkPublicacao)
            .then(function (resultado) {
                res.json(resultado);
            }).catch(function (erro) {
                console.log(erro);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

function contarCurtidas(req, res) {
    var fkPublicacao = req.params.fkPublicacao;

    curtidaModel.contarCurtidas(fkPublicacao)
        .then(function (resultado) {
            res.json(resultado);
        }).catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    curtir,
    descurtir,
    contarCurtidas
};