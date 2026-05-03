var database = require("../database/config");

function cadastrar(titulo, autor, genero) {
    console.log("ACESSEI O LIVRO MODEL");

    var instrucaoSql = `
        INSERT INTO Livro (titulo, autor, genero)
        VALUES ('${titulo}', '${autor}', '${genero}');
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);

    return database.executar(instrucaoSql);
}

function listar() {
    console.log("ACESSEI O LIVRO MODEL - listar");

    var instrucaoSql = `
        SELECT * FROM Livro;
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);

    return database.executar(instrucaoSql);
}

module.exports = {
    cadastrar,
    listar
};