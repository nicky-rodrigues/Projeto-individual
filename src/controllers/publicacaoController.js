// Importa o model de publicação.
var publicacaoModel = require("../models/publicacaoModel");


// Cadastra uma nova publicação
// Os dados vêm do front-end pelo req.body
function cadastrar(req, res) {
    var fkUsuario = req.body.fkUsuarioServer;
    var fkLivro = req.body.fkLivroServer;
    var tipoPublicacao = req.body.tipoPublicacaoServer;
    var texto = req.body.textoServer;

    // Validação dos campos obrigatórios (fkUsuario identifica quem está publicando)
    if (fkUsuario == undefined) {
        res.status(400).send("fkUsuario está undefined!");

    // tipoPublicacao é se resenha, avaliação, citação, meta ou atualização
    } else if (tipoPublicacao == undefined) {
        res.status(400).send("tipoPublicacao está undefined!");

    // texto é o conteúdo da publicação
    } else if (texto == undefined) {
        res.status(400).send("texto está undefined!");

    } else {

        // O livro relacionado é opcional
        // Se não vier livro, vai salvar como NULL para manter a publicação sem vínculo com Livro
        if (fkLivro == undefined || fkLivro == "") {
            fkLivro = "NULL";
        }

        // Chama o model para inserir a publicação no banco
        publicacaoModel.cadastrar(fkUsuario, fkLivro, tipoPublicacao, texto)
            .then(function (resultado) {
                res.json(resultado);
            }).catch(function (erro) {
                console.log(erro);
                res.status(500).json(erro.sqlMessage);
            });
    }
}


// Lista todas as publicações do feed
function listar(req, res) {
    publicacaoModel.listar()
        .then(function (resultado) {
            res.json(resultado);
        }).catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}


// Lista as publicações de um usuário específico
// O id do usuário é recebido pela URL (  ex = /perfis/listar/1)
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