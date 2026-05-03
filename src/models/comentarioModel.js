var database = require("../database/config");

function cadastrar(fkUsuario, fkPublicacao, texto) {
    var instrucaoSql = `
        INSERT INTO Comentario (fkUsuario, fkPublicacao, texto)
        VALUES (${fkUsuario}, ${fkPublicacao}, '${texto}');
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function listarPorPublicacao(fkPublicacao) {
    var instrucaoSql = `
        SELECT 
            Comentario.idComentario,
            Usuario.nome,
            Comentario.texto,
            Comentario.dataComentario
        FROM Comentario
        JOIN Usuario ON Comentario.fkUsuario = Usuario.id
        WHERE Comentario.fkPublicacao = ${fkPublicacao}
        ORDER BY Comentario.dataComentario ASC;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    cadastrar,
    listarPorPublicacao
};