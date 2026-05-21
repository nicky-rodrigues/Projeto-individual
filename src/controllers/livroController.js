var livroModel = require("../models/livroModel");

function formatarTexto(texto) {
    texto = texto.trim();

    var palavras = texto.split(" ");
    var textoFormatado = "";

    for (var i = 0; i < palavras.length; i++) {
        if (palavras[i] != "") {
            var primeiraLetra = palavras[i][0].toUpperCase();
            var restoPalavra = palavras[i].substring(1).toLowerCase();

            if (textoFormatado == "") {
                textoFormatado = primeiraLetra + restoPalavra;
            } else {
                textoFormatado += " " + primeiraLetra + restoPalavra;
            }
        }
    }

    return textoFormatado;
}

function cadastrar(req, res) {
    var titulo = req.body.tituloServer;
    var autor = req.body.autorServer;
    var genero = req.body.generoServer;

    if (titulo == undefined || titulo == "") {
        res.status(400).send("O título está undefined ou vazio!");
    } else if (autor == undefined || autor == "") {
        res.status(400).send("O autor está undefined ou vazio!");
    } else if (genero == undefined || genero == "") {
        res.status(400).send("O gênero está undefined ou vazio!");
    } else {
        titulo = formatarTexto(titulo);
        autor = formatarTexto(autor);

        livroModel.buscarPorTituloAutor(titulo, autor)
            .then(function (livroEncontrado) {
                if (livroEncontrado.length > 0) {
                    res.json({
                        idLivro: livroEncontrado[0].idLivro,
                        titulo: livroEncontrado[0].titulo,
                        autor: livroEncontrado[0].autor,
                        genero: livroEncontrado[0].genero,
                        livroJaExistia: true
                    });
                } else {
                    livroModel.cadastrar(titulo, autor, genero)
                        .then(function () {
                            livroModel.buscarPorTituloAutor(titulo, autor)
                                .then(function (livroCriado) {
                                    if (livroCriado.length > 0) {
                                        res.json({
                                            idLivro: livroCriado[0].idLivro,
                                            titulo: livroCriado[0].titulo,
                                            autor: livroCriado[0].autor,
                                            genero: livroCriado[0].genero,
                                            livroJaExistia: false
                                        });
                                    } else {
                                        res.status(500).send("O livro foi cadastrado, mas o id do livro não foi retornado.");
                                    }
                                })
                                .catch(function (erro) {
                                    res.status(500).json(erro.sqlMessage);
                                });
                        })
                        .catch(function (erro) {
                            res.status(500).json(erro.sqlMessage);
                        });
                }
            })
            .catch(function (erro) {
                res.status(500).json(erro.sqlMessage);
            });
    }
}

function listar(req, res) {
    livroModel.listar()
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            res.status(500).json(erro.sqlMessage);
        });
}

module.exports = {
    cadastrar,
    listar
};