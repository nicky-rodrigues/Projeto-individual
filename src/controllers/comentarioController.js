// Importa o model de comentário.
var comentarioModel = require("../models/comentarioModel");


// Cadastra um novo comentário em uma publicação
// Os dados vêm do front-end pelo req.body
function cadastrar(req, res) {
    var fkUsuario = req.body.fkUsuarioServer;
    var fkPublicacao = req.body.fkPublicacaoServer;
    var texto = req.body.textoServer;

    // Valida se o usuário foi enviado
    if (fkUsuario == undefined) {
        res.status(400).send("fkUsuario está undefined!");

    // Valida se a publicação foi enviada
    } else if (fkPublicacao == undefined) {
        res.status(400).send("fkPublicacao está undefined!");

    // Valida se o texto do comentário foi enviado
    } else if (texto == undefined) {
        res.status(400).send("texto está undefined!");

    } else {

        // Chama o model para inserir o comentário no banco
        comentarioModel.cadastrar(fkUsuario, fkPublicacao, texto)
            .then(function (resultado) {
                res.json(resultado);
            }).catch(function (erro) {
                console.log(erro);
                res.status(500).json(erro.sqlMessage);
            });
    }
}


// Lista os comentários de uma publicação específica
// O id da publicação vem pela URL ( ex = /perfis/listar/1)
function listarPorPublicacao(req, res) {
    var fkPublicacao = req.params.fkPublicacao;

    // Chama o model para buscar os comentários daquela publicação
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