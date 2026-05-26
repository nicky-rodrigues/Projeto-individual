// Importa a configuração do banco de dados.
var database = require("../database/config");


// Insere uma curtida no banco
// Cada curtida liga um usuário a uma publicação
function curtir(fkUsuario, fkPublicacao) {
    var instrucaoSql = `
        INSERT INTO Curtida (fkUsuario, fkPublicacao)
        VALUES (${fkUsuario}, ${fkPublicacao});
    `;

    return database.executar(instrucaoSql);
}


// Remove uma curtida do banco
// O DELETE usa usuário e publicação para remover exatamente aquela curtida
function descurtir(fkUsuario, fkPublicacao) {
    var instrucaoSql = `
        DELETE FROM Curtida
        WHERE fkUsuario = ${fkUsuario}
        AND fkPublicacao = ${fkPublicacao};
    `;

    return database.executar(instrucaoSql);
}


// Conta o total de curtidas de uma publicação
function contarCurtidas(fkPublicacao) {
    var instrucaoSql = `
        SELECT COUNT(*) AS totalCurtidas
        FROM Curtida
        WHERE fkPublicacao = ${fkPublicacao};
    `;

    return database.executar(instrucaoSql);
}


// Verifica se um usuário já curtiu uma publicação
// Essa função é usada antes de inserir uma curtida para evitar curtir duas vezes
function verificarCurtida(fkPublicacao, fkUsuario) {
    var instrucaoSql = `
        SELECT idCurtida
        FROM Curtida
        WHERE fkPublicacao = ${fkPublicacao}
        AND fkUsuario = ${fkUsuario};
    `;

    return database.executar(instrucaoSql);
}


module.exports = {
    curtir,
    descurtir,
    contarCurtidas,
    verificarCurtida
};