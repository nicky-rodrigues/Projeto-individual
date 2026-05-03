var perfilModel = require("../models/perfilModel");

function cadastrar(req, res) {
    var fkUsuario = req.body.fkUsuarioServer;
    var bio = req.body.bioServer;
    var generoFavorito = req.body.generoFavoritoServer;
    var livroFavorito = req.body.livroFavoritoServer;
    var metaMensal = req.body.metaMensalServer;

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
        perfilModel.cadastrar(fkUsuario, bio, generoFavorito, livroFavorito, metaMensal)
            .then(function (resultado) {
                res.json(resultado);
            }).catch(function (erro) {
                console.log(erro);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

function atualizar(req, res) {
    var fkUsuario = req.body.fkUsuarioServer;
    var bio = req.body.bioServer;
    var generoFavorito = req.body.generoFavoritoServer;
    var livroFavorito = req.body.livroFavoritoServer;
    var metaMensal = req.body.metaMensalServer;

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
        perfilModel.atualizar(fkUsuario, bio, generoFavorito, livroFavorito, metaMensal)
            .then(function (resultado) {
                res.json(resultado);
            }).catch(function (erro) {
                console.log(erro);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

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