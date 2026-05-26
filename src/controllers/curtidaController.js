// Importa o model de curtida.
var curtidaModel = require("../models/curtidaModel");


// Cadastra uma curtida em uma publicação (Antes de inserir, verifica se o usuário já curtiu aquela publicação)
function curtir(req, res) {
    var fkUsuario = req.body.fkUsuarioServer;
    var fkPublicacao = req.body.fkPublicacaoServer;

    // Valida se o usuário foi enviado
    if (fkUsuario == undefined) {
        res.status(400).send("fkUsuario está undefined!");

    // Valida se a publicação foi enviada
    } else if (fkPublicacao == undefined) {
        res.status(400).send("fkPublicacao está undefined!");

    } else {

        // Primeiro verifica se já existe curtida desse usuário nessa publicação
        curtidaModel.verificarCurtida(fkPublicacao, fkUsuario)
            .then(function (resultadoVerificacao) {

                // Se já existir curtida, não vai inserir novamente
                if (resultadoVerificacao.length > 0) {
                    res.json({
                        mensagem: "Publicação já estava curtida."
                    });

                } else {

                    // Se não existe, insere uma nova curtida no banco
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


// Remove a curtida de uma publicação
function descurtir(req, res) {
    var fkUsuario = req.body.fkUsuarioServer;
    var fkPublicacao = req.body.fkPublicacaoServer;

    // Valida se o usuário foi enviado
    if (fkUsuario == undefined) {
        res.status(400).send("fkUsuario está undefined!");

    // Valida se a publicação foi enviada
    } else if (fkPublicacao == undefined) {
        res.status(400).send("fkPublicacao está undefined!");

    } else {

        // Chama o model para remover a curtida do banco
        curtidaModel.descurtir(fkUsuario, fkPublicacao)
            .then(function (resultado) {
                res.json(resultado);
            })
            .catch(function (erro) {
                res.status(500).json(erro.sqlMessage);
            });
    }
}


// Conta quantas curtidas uma publicação possui
// O id da publicação vem pela URL( ex = /perfis/listar/1)
function contarCurtidas(req, res) {
    var fkPublicacao = req.params.fkPublicacao;

    // Valida se a publicação foi enviada na URL
    if (fkPublicacao == undefined) {
        res.status(400).send("fkPublicacao está undefined!");

    } else {

        // Chama o model para contar as curtidas da publicação
        curtidaModel.contarCurtidas(fkPublicacao)
            .then(function (resultado) {
                res.json(resultado);
            })
            .catch(function (erro) {
                res.status(500).json(erro.sqlMessage);
            });
    }
}


// Verifica se o usuário logado já curtiu uma publicação (Essa função vai retornar true ou false para o front-end)
function verificarCurtida(req, res) {
    var fkPublicacao = req.params.fkPublicacao;
    var fkUsuario = req.params.fkUsuario;

    // Valida se a publicação foi enviada na URL
    if (fkPublicacao == undefined) {
        res.status(400).send("fkPublicacao está undefined!");

    // Valida se o usuário foi enviado na URL
    } else if (fkUsuario == undefined) {
        res.status(400).send("fkUsuario está undefined!");

    } else {

        // Busca se existe curtida com esse usuário e essa publicação
        curtidaModel.verificarCurtida(fkPublicacao, fkUsuario)
            .then(function (resultado) {

                // Se encontrou registro, o usuário já curtiu
                if (resultado.length > 0) {
                    res.json({ curtido: true });

                // Se não encontrou, o usuário ainda não curtiu
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