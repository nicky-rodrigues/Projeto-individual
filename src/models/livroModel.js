// Importa a configuração do banco de dados.
var database = require("../database/config");


// Busca um livro pelo título
// Essa função ajuda a evitar que o mesmo livro seja cadastrado várias vezes por diferença de autor digitado, letras maiúsculas ou minúsculas
function buscarPorTitulo(titulo) {
    var instrucaoSql = `
        SELECT *
        FROM Livro
        WHERE LOWER(TRIM(titulo)) = LOWER(TRIM('${titulo}'));
    `;

    return database.executar(instrucaoSql);
}


// Cadastra um novo livro no banco (essa função só é chamada quando o livro ainda não existe)
function cadastrar(titulo, autor, genero) {
    var instrucaoSql = `
        INSERT INTO Livro (titulo, autor, genero)
        VALUES ('${titulo}', '${autor}', '${genero}');
    `;

    return database.executar(instrucaoSql);
}


// Lista os livros cadastrados junto com indicadores calculados a partir da tabela Leitura
// A página Explorar usa esses dados para mostrar nota média, total de leitores e total de concluídos
function listar() {
    var instrucaoSql = `
        SELECT 
            l.idLivro,
            l.titulo,
            l.autor,
            l.genero,

            -- Calcula a nota média do livro com base nas avaliações registradas
            ROUND(AVG(le.nota), 1) AS notaMedia,

            -- Conta quantos usuários diferentes registraram esse livro
            COUNT(DISTINCT le.fkUsuario) AS totalLeitores,

            -- Conta quantas leituras desse livro foram concluídas (coalesce vai me retornar o primeiro valor não nulo)
            COALESCE(SUM(CASE WHEN le.statusLeitura = 'Concluído' THEN 1 ELSE 0 END), 0) AS totalConcluidos

        FROM Livro l

        -- LEFT JOIN permite listar livros mesmo que ainda não tenham leituras registradas
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