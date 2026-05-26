// Importa a configuração do banco de dados.
var database = require("../database/config");


// Busca se o usuário já possui uma conquista salva para determinado mês e ano (evita cadastrar duas conquistas no mesmo mês)
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


// Cadastra uma nova conquista mensal (só vai ser usada quando o usuário ainda não possui conquista naquele mês)
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


// Atualiza uma conquista já existente (acontece quando o usuário melhora a medalha no mesmo mês)
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


// Lista o resumo de medalhas do usuário (quantidade de bronze, prata e ouro salvas no histórico)
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


// Lista o histórico mensal de conquistas do usuário ( das mais recentes para as mais antigas)
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