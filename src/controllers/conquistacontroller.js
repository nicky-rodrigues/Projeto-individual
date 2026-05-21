var conquistaModel = require("../models/conquistaModel");

function nivelMedalha(tipoMedalha) {
    if (tipoMedalha == "bronze") {
        return 1;
    } else if (tipoMedalha == "prata") {
        return 2;
    } else if (tipoMedalha == "ouro") {
        return 3;
    } else {
        return 0;
    }
}

function salvarOuAtualizar(req, res) {
    var fkUsuario = req.body.fkUsuarioServer;
    var mesReferencia = req.body.mesReferenciaServer;
    var anoReferencia = req.body.anoReferenciaServer;
    var tipoMedalha = req.body.tipoMedalhaServer;
    var percentualMeta = req.body.percentualMetaServer;
    var livrosConcluidos = req.body.livrosConcluidosServer;
    var metaMensal = req.body.metaMensalServer;

    if (fkUsuario == undefined) {
        res.status(400).send("fkUsuario está undefined!");
    } else if (mesReferencia == undefined) {
        res.status(400).send("mesReferencia está undefined!");
    } else if (anoReferencia == undefined) {
        res.status(400).send("anoReferencia está undefined!");
    } else if (tipoMedalha == undefined) {
        res.status(400).send("tipoMedalha está undefined!");
    } else if (percentualMeta == undefined) {
        res.status(400).send("percentualMeta está undefined!");
    } else if (livrosConcluidos == undefined) {
        res.status(400).send("livrosConcluidos está undefined!");
    } else if (metaMensal == undefined) {
        res.status(400).send("metaMensal está undefined!");
    } else {
        conquistaModel.buscarConquistaMes(fkUsuario, mesReferencia, anoReferencia)
            .then(function (resultado) {
                if (resultado.length == 0) {
                    return conquistaModel.cadastrar(
                        fkUsuario,
                        mesReferencia,
                        anoReferencia,
                        tipoMedalha,
                        percentualMeta,
                        livrosConcluidos,
                        metaMensal
                    );
                } else {
                    var conquistaAtual = resultado[0];

                    var nivelAtual = nivelMedalha(conquistaAtual.tipoMedalha);
                    var nivelNovo = nivelMedalha(tipoMedalha);

                    if (nivelNovo > nivelAtual) {
                        return conquistaModel.atualizar(
                            conquistaAtual.idConquista,
                            tipoMedalha,
                            percentualMeta,
                            livrosConcluidos,
                            metaMensal
                        );
                    } else {
                        return resultado;
                    }
                }
            })
            .then(function (resultadoFinal) {
                res.json(resultadoFinal);
            })
            .catch(function (erro) {
                res.status(500).json(erro.sqlMessage);
            });
    }
}

function listarResumo(req, res) {
    var fkUsuario = req.params.fkUsuario;

    conquistaModel.listarResumo(fkUsuario)
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            res.status(500).json(erro.sqlMessage);
        });
}

function listarHistorico(req, res) {
    var fkUsuario = req.params.fkUsuario;

    conquistaModel.listarHistorico(fkUsuario)
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    salvarOuAtualizar,
    listarResumo,
    listarHistorico
};