// Importa a configuração do banco de dados
var database = require("../database/config");


// Cadastra uma nova publicação no banco
// fkLivro pode receber um id de livro ou NULL, caso a publicação não esteja ligada a um livro
function cadastrar(fkUsuario, fkLivro, tipoPublicacao, texto) {
    var instrucaoSql = `
        INSERT INTO Publicacao (fkUsuario, fkLivro, tipoPublicacao, texto)
        VALUES (${fkUsuario}, ${fkLivro}, '${tipoPublicacao}', '${texto}');
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}


// Lista todas as publicações do feed
// O JOIN com Usuario busca o nome de quem publicou
// O LEFT JOIN com Livro permite que a publicação apareça mesmo se não tiver livro relacionado
function listar() {
    var instrucaoSql = `
        SELECT 
            Publicacao.idPublicacao,
            Usuario.nome,
            Livro.titulo,
            Livro.autor,
            Publicacao.tipoPublicacao,
            Publicacao.texto,
            Publicacao.dataPublicacao
        FROM Publicacao
        JOIN Usuario ON Publicacao.fkUsuario = Usuario.id
        LEFT JOIN Livro ON Publicacao.fkLivro = Livro.idLivro
        ORDER BY Publicacao.dataPublicacao DESC;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}


// Lista apenas as publicações de um usuário específico
function listarPorUsuario(fkUsuario) {
    var instrucaoSql = `
        SELECT 
            Publicacao.idPublicacao,
            Usuario.nome,
            Livro.titulo,
            Livro.autor,
            Publicacao.tipoPublicacao,
            Publicacao.texto,
            Publicacao.dataPublicacao
        FROM Publicacao
        JOIN Usuario ON Publicacao.fkUsuario = Usuario.id
        LEFT JOIN Livro ON Publicacao.fkLivro = Livro.idLivro
        WHERE Publicacao.fkUsuario = ${fkUsuario}
        ORDER BY Publicacao.dataPublicacao DESC;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}


module.exports = {
    cadastrar,
    listar,
    listarPorUsuario
};