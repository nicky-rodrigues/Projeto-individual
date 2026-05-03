var database = require("../database/config");

function cadastrar(fkUsuario, fkLivro, tipoPublicacao, texto) {
    var instrucaoSql = `
        INSERT INTO Publicacao (fkUsuario, fkLivro, tipoPublicacao, texto)
        VALUES (${fkUsuario}, ${fkLivro}, '${tipoPublicacao}', '${texto}');
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

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