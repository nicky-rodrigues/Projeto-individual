var database = require("../database/config");

function buscarPorTitulo(titulo) {
    var instrucaoSql = `
        SELECT *
        FROM Livro
        WHERE LOWER(TRIM(titulo)) = LOWER(TRIM('${titulo}'));
    `;

    return database.executar(instrucaoSql);
}

function cadastrar(titulo, autor, genero) {
    var instrucaoSql = `
        INSERT INTO Livro (titulo, autor, genero)
        VALUES ('${titulo}', '${autor}', '${genero}');
    `;

    return database.executar(instrucaoSql);
}

function listar() {
    var instrucaoSql = `
        SELECT 
            l.idLivro,
            l.titulo,
            l.autor,
            l.genero,
            ROUND(AVG(le.nota), 1) AS notaMedia,
            COUNT(DISTINCT le.fkUsuario) AS totalLeitores,
            COALESCE(SUM(CASE WHEN le.statusLeitura = 'Concluído' THEN 1 ELSE 0 END), 0) AS totalConcluidos
        FROM Livro l
        LEFT JOIN Leitura le 
            ON le.fkLivro = l.idLivro
        GROUP BY 
            l.idLivro,
            l.titulo,
            l.autor,
            l.genero
        ORDER BY 
            totalLeitores DESC,
            l.titulo ASC;
    `;

    return database.executar(instrucaoSql);
}

module.exports = {
    buscarPorTitulo,
    cadastrar,
    listar
};