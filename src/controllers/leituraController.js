// Importa o model de leitura.
var leituraModel = require("../models/leituraModel");


// Cadastra uma nova leitura (Os dados vêm do front-end pelo req.body)
function cadastrar(req, res) {
    var fkUsuario = req.body.fkUsuarioServer;
    var fkLivro = req.body.fkLivroServer;
    var statusLeitura = req.body.statusLeituraServer;
    var nota = req.body.notaServer;
    var comentario = req.body.comentarioServer;

    // Valida se o usuário foi enviado
    if (fkUsuario == undefined) {
        res.status(400).send("fkUsuario está undefined!");

    // Valida se o livro foi enviado
    } else if (fkLivro == undefined) {
        res.status(400).send("fkLivro está undefined!");

    // Valida o status da leitura
    } else if (statusLeitura == undefined) {
        res.status(400).send("statusLeitura está undefined!");

    // A nota pode vir como número ou NULL (enviada pelo front)
    } else if (nota == undefined) {
        res.status(400).send("nota está undefined!");

    // O comentário também pode vir vazio, mas precisa ser enviado
    } else if (comentario == undefined) {
        res.status(400).send("comentario está undefined!");

    } else {

        // Chama o model para inserir a leitura no banco
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


// Atualiza uma leitura existente
// No front-end, os campos de livro ficam bloqueados durante a edição então aqui são atualizados apenas status, nota e comentário
function atualizar(req, res) {
    var idLeitura = req.body.idLeituraServer;
    var fkUsuario = req.body.fkUsuarioServer;
    var statusLeitura = req.body.statusLeituraServer;
    var nota = req.body.notaServer;
    var comentario = req.body.comentarioServer;

    // Valida se o id da leitura foi enviado
    if (idLeitura == undefined) {
        res.status(400).send("idLeitura está undefined!");

    // Valida se o usuário foi enviado
    } else if (fkUsuario == undefined) {
        res.status(400).send("fkUsuario está undefined!");

    // Valida se o status foi enviado
    } else if (statusLeitura == undefined) {
        res.status(400).send("statusLeitura está undefined!");

    // A nota pode ser NULL, mas não pode estar undefined
    } else if (nota == undefined) {
        res.status(400).send("nota está undefined!");

    // O comentário pode ser vazio, mas não pode estar undefined
    } else if (comentario == undefined) {
        res.status(400).send("comentario está undefined!");

    } else {

        // Chama o model para atualizar a leitura do usuário
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


// Lista todas as leituras de um usuário específico
// O id do usuário vem pela URL( ex = /perfis/listar/1)
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


// Busca dados agrupados para a dashboard (essa função retorna quantidade por gênero e status)
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