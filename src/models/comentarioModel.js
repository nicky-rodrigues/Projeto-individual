// Importa a configuração do banco de dados.
var database = require("../database/config");


// Cadastra um comentário no banco (Cada comentário está ligado a um usuário e a uma publicação)
function cadastrar(fkUsuario, fkPublicacao, texto) {
    var instrucaoSql = `
        INSERT INTO Comentario (fkUsuario, fkPublicacao, texto)
        VALUES (${fkUsuario}, ${fkPublicacao}, '${texto}');
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}


// Lista todos os comentários de uma publicação (O JOIN com Usuario mostra o nome de quem comentou)
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