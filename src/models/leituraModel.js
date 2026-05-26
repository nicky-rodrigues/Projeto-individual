// Importa a configuração do banco de dados.
var database = require("../database/config");


// Cadastra uma nova leitura no banco (cada leitura pertence a um usuário e está ligada a um livro)
function cadastrar(fkUsuario, fkLivro, statusLeitura, nota, comentario) {
    var instrucaoSql = `
        INSERT INTO Leitura (fkUsuario, fkLivro, statusLeitura, nota, comentario)
        VALUES (${fkUsuario}, ${fkLivro}, '${statusLeitura}', ${nota}, '${comentario}');
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}


// Atualiza uma leitura já cadastrada
// O where usa idLeitura e fkUsuario para garantir que o usuário só altere a própria leitura
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


// Lista todas as leituras de um usuário
// O JOIN com Livro exibe título, autor e gênero junto com os dados da leitura
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


// Busca dados agrupados para a dashboard (agrupa as leituras por gênero e status)
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