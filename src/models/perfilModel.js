var database = require("../database/config");

function cadastrar(fkUsuario, bio, generoFavorito, livroFavorito, metaMensal) {
    var instrucaoSql = `
        INSERT INTO Perfil (fkUsuario, bio, generoFavorito, livroFavorito, metaMensal)
        VALUES (${fkUsuario}, '${bio}', '${generoFavorito}', '${livroFavorito}', ${metaMensal});
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function atualizar(fkUsuario, bio, generoFavorito, livroFavorito, metaMensal) {
    var instrucaoSql = `
        UPDATE Perfil
        SET 
            bio = '${bio}',
            generoFavorito = '${generoFavorito}',
            livroFavorito = '${livroFavorito}',
            metaMensal = ${metaMensal}
        WHERE fkUsuario = ${fkUsuario};
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

function listarPorUsuario(fkUsuario) {
    var instrucaoSql = `
        SELECT 
            Perfil.idPerfil,
            Perfil.fkUsuario,
            Usuario.nome,
            Usuario.email,
            Perfil.bio,
            Perfil.generoFavorito,
            Perfil.livroFavorito,
            Perfil.metaMensal
        FROM Perfil
        JOIN Usuario ON Perfil.fkUsuario = Usuario.id
        WHERE Perfil.fkUsuario = ${fkUsuario};
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}

module.exports = {
    cadastrar,
    atualizar,
    listarPorUsuario
};