var database = require("../database/config");

function cadastrar(fkUsuario, fkLivro, statusLeitura, nota, comentario) {
    var instrucaoSql = `
        INSERT INTO Leitura (fkUsuario, fkLivro, statusLeitura, nota, comentario)
        VALUES (${fkUsuario}, ${fkLivro}, '${statusLeitura}', ${nota}, '${comentario}');
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function atualizar(idLeitura, fkUsuario, statusLeitura, nota, comentario) {
    var instrucaoSql = `
        UPDATE Leitura
        SET 
            statusLeitura = '${statusLeitura}',
            nota = ${nota},
            comentario = '${comentario}'
        WHERE idLeitura = ${idLeitura}
        AND fkUsuario = ${fkUsuario};
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function listarPorUsuario(fkUsuario) {
    var instrucaoSql = `
        SELECT 
            Leitura.idLeitura,
            Leitura.fkUsuario,
            Livro.titulo,
            Livro.autor,
            Livro.genero,
            Leitura.statusLeitura,
            Leitura.nota,
            Leitura.comentario,
            Leitura.dataRegistro
        FROM Leitura
        JOIN Livro ON Leitura.fkLivro = Livro.idLivro
        WHERE Leitura.fkUsuario = ${fkUsuario}
        ORDER BY Leitura.dataRegistro DESC;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function buscarDadosDashboard(fkUsuario) {
    var instrucaoSql = `
        SELECT 
            Livro.genero,
            Leitura.statusLeitura,
            COUNT(*) AS quantidade
        FROM Leitura
        JOIN Livro ON Leitura.fkLivro = Livro.idLivro
        WHERE Leitura.fkUsuario = ${fkUsuario}
        GROUP BY Livro.genero, Leitura.statusLeitura;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    cadastrar,
    atualizar,
    listarPorUsuario,
    buscarDadosDashboard
};