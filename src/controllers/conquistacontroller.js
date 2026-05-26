// Importa o model de conquista.
var conquistaModel = require("../models/conquistaModel");


// Transforma o tipo da medalha em um nível numérico
// vai facilitar comparar se a nova medalha é melhor que a atual
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


// Salva ou atualiza a conquista mensal do usuário (Essa função é chamada pela dashboard depois de calcular o progresso da meta)
function salvarOuAtualizar(req, res) {
    var fkUsuario = req.body.fkUsuarioServer;
    var mesReferencia = req.body.mesReferenciaServer;
    var anoReferencia = req.body.anoReferenciaServer;
    var tipoMedalha = req.body.tipoMedalhaServer;
    var percentualMeta = req.body.percentualMetaServer;
    var livrosConcluidos = req.body.livrosConcluidosServer;
    var metaMensal = req.body.metaMensalServer;

    // Valida se o usuário foi enviado
    if (fkUsuario == undefined) {
        res.status(400).send("fkUsuario está undefined!");

    // Valida o mês da conquista
    } else if (mesReferencia == undefined) {
        res.status(400).send("mesReferencia está undefined!");

    // Valida o ano da conquista
    } else if (anoReferencia == undefined) {
        res.status(400).send("anoReferencia está undefined!");

    // Valida o tipo da medalha
    } else if (tipoMedalha == undefined) {
        res.status(400).send("tipoMedalha está undefined!");

    // Valida o percentual atingido da meta
    } else if (percentualMeta == undefined) {
        res.status(400).send("percentualMeta está undefined!");

    // Valida quantos livros foram concluídos
    } else if (livrosConcluidos == undefined) {
        res.status(400).send("livrosConcluidos está undefined!");

    // Valida qual era a meta mensal no momento da conquista
    } else if (metaMensal == undefined) {
        res.status(400).send("metaMensal está undefined!");

    } else {

        // Primeiro busca se já existe conquista para esse usuário no mês e ano informados
        conquistaModel.buscarConquistaMes(fkUsuario, mesReferencia, anoReferencia)
            .then(function (resultado) {

                // Se não existe conquista no mês, cadastra uma nova
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

                    // Se já existe, compara a medalha atual com a nova
                    var conquistaAtual = resultado[0];

                    var nivelAtual = nivelMedalha(conquistaAtual.tipoMedalha);
                    var nivelNovo = nivelMedalha(tipoMedalha);

                    // Só atualiza se a nova medalha for melhor
                    if (nivelNovo > nivelAtual) {
                        return conquistaModel.atualizar(
                            conquistaAtual.idConquista,
                            tipoMedalha,
                            percentualMeta,
                            livrosConcluidos,
                            metaMensal
                        );

                    // Se a medalha nova não for melhor, mantém a conquista atual
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


// Lista o resumo das medalhas do usuário
// Essa função é a que vai alimentar os cards de ouro, prata, bronze e pontuação no Perfil
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


// Lista o histórico mensal de conquistas
// Essa função é a que vai alimentar a lista de histórico na página Perfil
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