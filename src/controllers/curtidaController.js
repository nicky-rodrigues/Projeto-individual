var curtidaModel = require("../models/curtidaModel");

function curtir(req, res) {
    var fkUsuario = req.body.fkUsuarioServer;
    var fkPublicacao = req.body.fkPublicacaoServer;

    if (fkUsuario == undefined) {
        res.status(400).send("fkUsuario está undefined!");
    } else if (fkPublicacao == undefined) {
        res.status(400).send("fkPublicacao está undefined!");
    } else {
        curtidaModel.verificarCurtida(fkPublicacao, fkUsuario)
            .then(function (resultadoVerificacao) {
                if (resultadoVerificacao.length > 0) {
                    res.json({
                        mensagem: "Publicação já estava curtida."
                    });
                } else {
                    return curtidaModel.curtir(fkUsuario, fkPublicacao)
                        .then(function (resultado) {
                            res.json(resultado);
                        });
                }
            })
            .catch(function (erro) {
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
            })
            .catch(function (erro) {
                res.status(500).json(erro.sqlMessage);
            });
    }
}

function contarCurtidas(req, res) {
    var fkPublicacao = req.params.fkPublicacao;

    if (fkPublicacao == undefined) {
        res.status(400).send("fkPublicacao está undefined!");
    } else {
        curtidaModel.contarCurtidas(fkPublicacao)
            .then(function (resultado) {
                res.json(resultado);
            })
            .catch(function (erro) {
                res.status(500).json(erro.sqlMessage);
            });
    }
}

function verificarCurtida(req, res) {
    var fkPublicacao = req.params.fkPublicacao;
    var fkUsuario = req.params.fkUsuario;

    if (fkPublicacao == undefined) {
        res.status(400).send("fkPublicacao está undefined!");
    } else if (fkUsuario == undefined) {
        res.status(400).send("fkUsuario está undefined!");
    } else {
        curtidaModel.verificarCurtida(fkPublicacao, fkUsuario)
            .then(function (resultado) {
                if (resultado.length > 0) {
                    res.json({ curtido: true });
                } else {
                    res.json({ curtido: false });
                }
            })
            .catch(function (erro) {
                res.status(500).json(erro.sqlMessage);
            });
    }
}

module.exports = {
    curtir,
    descurtir,
    contarCurtidas,
    verificarCurtida
};