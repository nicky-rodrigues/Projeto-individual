var database = require("../database/config");

function buscarConquistaMes(fkUsuario, mesReferencia, anoReferencia) {
    var instrucaoSql = `
        SELECT *
        FROM Conquista
        WHERE fkUsuario = ${fkUsuario}
        AND mesReferencia = ${mesReferencia}
        AND anoReferencia = ${anoReferencia};
    `;

    return database.executar(instrucaoSql);
}

function cadastrar(fkUsuario, mesReferencia, anoReferencia, tipoMedalha, percentualMeta, livrosConcluidos, metaMensal) {
    var instrucaoSql = `
        INSERT INTO Conquista (
            fkUsuario,
            mesReferencia,
            anoReferencia,
            tipoMedalha,
            percentualMeta,
            livrosConcluidos,
            metaMensal
        )
        VALUES (
            ${fkUsuario},
            ${mesReferencia},
            ${anoReferencia},
            '${tipoMedalha}',
            ${percentualMeta},
            ${livrosConcluidos},
            ${metaMensal}
        );
    `;

    return database.executar(instrucaoSql);
}

function atualizar(idConquista, tipoMedalha, percentualMeta, livrosConcluidos, metaMensal) {
    var instrucaoSql = `
        UPDATE Conquista
        SET 
            tipoMedalha = '${tipoMedalha}',
            percentualMeta = ${percentualMeta},
            livrosConcluidos = ${livrosConcluidos},
            metaMensal = ${metaMensal},
            dataConquista = CURRENT_TIMESTAMP
        WHERE idConquista = ${idConquista};
    `;

    return database.executar(instrucaoSql);
}

function listarResumo(fkUsuario) {
    var instrucaoSql = `
        SELECT
            tipoMedalha,
            COUNT(*) AS quantidade
        FROM Conquista
        WHERE fkUsuario = ${fkUsuario}
        GROUP BY tipoMedalha;
    `;

    return database.executar(instrucaoSql);
}

function listarHistorico(fkUsuario) {
    var instrucaoSql = `
        SELECT
            idConquista,
            mesReferencia,
            anoReferencia,
            tipoMedalha,
            percentualMeta,
            livrosConcluidos,
            metaMensal,
            dataConquista
        FROM Conquista
        WHERE fkUsuario = ${fkUsuario}
        ORDER BY anoReferencia DESC, mesReferencia DESC;
    `;

    return database.executar(instrucaoSql);
}

module.exports = {
    buscarConquistaMes,
    cadastrar,
    atualizar,
    listarResumo,
    listarHistorico
};