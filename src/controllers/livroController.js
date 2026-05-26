// Importa o model de livro.
var livroModel = require("../models/livroModel");


// Formata textos como título e autor(ex= trono de vidro para Trono De Vidro)
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


// Cadastra um livro ou retorna um livro já existente (evita duplicidade na página Explorar)
function cadastrar(req, res) {
    var titulo = req.body.tituloServer;
    var autor = req.body.autorServer;
    var genero = req.body.generoServer;

    // Valida se o título foi enviado
    if (titulo == undefined || titulo == "") {
        res.status(400).send("O título está undefined ou vazio!");

    // Valida se o autor foi enviado
    } else if (autor == undefined || autor == "") {
        res.status(400).send("O autor está undefined ou vazio!");

    // Valida se o gênero foi enviado
    } else if (genero == undefined || genero == "") {
        res.status(400).send("O gênero está undefined ou vazio!");

    } else {

        // Padroniza título e autor antes de buscar ou cadastrar
        titulo = formatarTexto(titulo);
        autor = formatarTexto(autor);

        // Primeiro verifica se já existe um livro com o mesmo título
        livroModel.buscarPorTitulo(titulo)
            .then(function (livroEncontrado) {

                // Se encontrou o livro, retorna o id existente (para não criar duplicidade)
                if (livroEncontrado.length > 0) {
                    res.json({
                        idLivro: livroEncontrado[0].idLivro,
                        titulo: livroEncontrado[0].titulo,
                        autor: livroEncontrado[0].autor,
                        genero: livroEncontrado[0].genero,
                        livroJaExistia: true
                    });

                } else {

                    // Se não encontrou, cadastra um novo livro
                    livroModel.cadastrar(titulo, autor, genero)
                        .then(function () {

                            // Depois de cadastrar, procura pelo título denovo para recuperar o idLivro criado
                            livroModel.buscarPorTitulo(titulo)
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
                                        res.status(500).send("O livro foi cadastrado, mas o id do livro não foi encontrado.");
                                    }
                                })
                                .catch(function (erro) {
                                    console.log(erro);
                                    res.status(500).json(erro.sqlMessage);
                                });
                        })
                        .catch(function (erro) {
                            console.log(erro);
                            res.status(500).json(erro.sqlMessage);
                        });
                }
            })
            .catch(function (erro) {
                console.log(erro);
                res.status(500).json(erro.sqlMessage);
            });
    }
}


// Lista os livros cadastrados com seus indicadores (usada pela página Explorar)
function listar(req, res) {
    livroModel.listar()
        .then(function (resultado) {
            res.json(resultado);
        })
        .catch(function (erro) {
            console.log(erro);
            res.status(500).json(erro.sqlMessage);
        });
}


module.exports = {
    cadastrar,
    listar
};