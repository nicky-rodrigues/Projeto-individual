// Importa o model de perfil
var perfilModel = require("../models/perfilModel");


// Cadastra um novo perfil (usada quando o usuário ainda não tem dados salvos no perfil)
function cadastrar(req, res) {
    var fkUsuario = req.body.fkUsuarioServer;
    var bio = req.body.bioServer;
    var generoFavorito = req.body.generoFavoritoServer;
    var livroFavorito = req.body.livroFavoritoServer;
    var metaMensal = req.body.metaMensalServer;

    // Valida se o id do usuário foi enviado
    if (fkUsuario == undefined) {
        res.status(400).send("fkUsuario está undefined!");

    // Valida se a bio foi enviada
    } else if (bio == undefined) {
        res.status(400).send("bio está undefined!");

    // Valida se o gênero favorito foi enviado
    } else if (generoFavorito == undefined) {
        res.status(400).send("generoFavorito está undefined!");

    // Valida se o livro favorito foi enviado
    } else if (livroFavorito == undefined) {
        res.status(400).send("livroFavorito está undefined!");

    // Valida se a meta mensal foi enviada
    } else if (metaMensal == undefined) {
        res.status(400).send("metaMensal está undefined!");

    } else {

        // Chama o model para inserir o perfil no banco
        perfilModel.cadastrar(fkUsuario, bio, generoFavorito, livroFavorito, metaMensal)
            .then(function (resultado) {
                res.json(resultado);
            }).catch(function (erro) {
                console.log(erro);
                res.status(500).json(erro.sqlMessage);
            });
    }
}


// Atualiza um perfil já existente
function atualizar(req, res) {
    var fkUsuario = req.body.fkUsuarioServer;
    var bio = req.body.bioServer;
    var generoFavorito = req.body.generoFavoritoServer;
    var livroFavorito = req.body.livroFavoritoServer;
    var metaMensal = req.body.metaMensalServer;

    // As validações para manter o perfil completo.
    if (fkUsuario == undefined) {
        res.status(400).send("fkUsuario está undefined!");

    } else if (bio == undefined) {
        res.status(400).send("bio está undefined!");

    } else if (generoFavorito == undefined) {
        res.status(400).send("generoFavorito está undefined!");

    } else if (livroFavorito == undefined) {
        res.status(400).send("livroFavorito está undefined!");

    } else if (metaMensal == undefined) {
        res.status(400).send("metaMensal está undefined!");

    } else {

        // Chama o model para atualizar o perfil do usuário
        perfilModel.atualizar(fkUsuario, bio, generoFavorito, livroFavorito, metaMensal)
            .then(function (resultado) {
                res.json(resultado);
            }).catch(function (erro) {
                console.log(erro);
                res.status(500).json(erro.sqlMessage);
            });
    }
}


// Lista o perfil de um usuário específico
// O id do usuário vem pela URL( ex = /perfis/listar/1)
function listarPorUsuario(req, res) {
    var fkUsuario = req.params.fkUsuario;

    perfilModel.listarPorUsuario(fkUsuario)
        .then(function (resultado) {
            res.json(resultado);
        }).catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}


module.exports = {
    cadastrar,
    atualizar,
    listarPorUsuario
};