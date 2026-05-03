var leituraModel = require("../models/leituraModel");

function cadastrar(req, res) {
    var fkUsuario = req.body.fkUsuarioServer;
    var fkLivro = req.body.fkLivroServer;
    var statusLeitura = req.body.statusLeituraServer;
    var nota = req.body.notaServer;
    var comentario = req.body.comentarioServer;

    if (fkUsuario == undefined) {
        res.status(400).send("fkUsuario está undefined!");
    } else if (fkLivro == undefined) {
        res.status(400).send("fkLivro está undefined!");
    } else if (statusLeitura == undefined) {
        res.status(400).send("statusLeitura está undefined!");
    } else if (nota == undefined) {
        res.status(400).send("nota está undefined!");
    } else if (comentario == undefined) {
        res.status(400).send("comentario está undefined!");
    } else {
        leituraModel.cadastrar(fkUsuario, fkLivro, statusLeitura, nota, comentario)
            .then(function (resultado) {
                res.json(resultado);
            })
            .catch(function (erro) {
                console.log(erro);
                console.log("Erro ao cadastrar leitura:", erro.sqlMessage);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

function atualizar(req, res) {
    var idLeitura = req.body.idLeituraServer;
    var fkUsuario = req.body.fkUsuarioServer;
    var statusLeitura = req.body.statusLeituraServer;
    var nota = req.body.notaServer;
    var comentario = req.body.comentarioServer;

    if (idLeitura == undefined) {
        res.status(400).send("idLeitura está undefined!");
    } else if (fkUsuario == undefined) {
        res.status(400).send("fkUsuario está undefined!");
    } else if (statusLeitura == undefined) {
        res.status(400).send("statusLeitura está undefined!");
    } else if (nota == undefined) {
        res.status(400).send("nota está undefined!");
    } else if (comentario == undefined) {
        res.status(400).send("comentario está undefined!");
    } else {
        leituraModel.atualizar(idLeitura, fkUsuario, statusLeitura, nota, comentario)
            .then(function (resultado) {
                res.json(resultado);
            })
            .catch(function (erro) {
                console.log(erro);
                console.log("Erro ao atualizar leitura:", erro.sqlMessage);
                res.status(500).json(erro.sqlMessage);
            });
    }
}

function listarPorUsuario(req, res) {
    var fkUsuario = req.params.fkUsuario;

    leituraModel.listarPorUsuario(fkUsuario)
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Erro ao listar leituras:", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

function buscarDadosDashboard(req, res) {
    var fkUsuario = req.params.fkUsuario;

    leituraModel.buscarDadosDashboard(fkUsuario)
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            console.log("Erro ao buscar dados da dashboard:", erro.sqlMessage);
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    cadastrar,
    atualizar,
    listarPorUsuario,
    buscarDadosDashboard
};