var database = require("../database/config");

function curtir(fkUsuario, fkPublicacao) {
    var instrucaoSql = `
        INSERT INTO Curtida (fkUsuario, fkPublicacao)
        VALUES (${fkUsuario}, ${fkPublicacao});
    `;

    return database.executar(instrucaoSql);
}

function descurtir(fkUsuario, fkPublicacao) {
    var instrucaoSql = `
        DELETE FROM Curtida
        WHERE fkUsuario = ${fkUsuario}
        AND fkPublicacao = ${fkPublicacao};
    `;

    return database.executar(instrucaoSql);
}

function contarCurtidas(fkPublicacao) {
    var instrucaoSql = `
        SELECT COUNT(*) AS totalCurtidas
        FROM Curtida
        WHERE fkPublicacao = ${fkPublicacao};
    `;

    return database.executar(instrucaoSql);
}

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