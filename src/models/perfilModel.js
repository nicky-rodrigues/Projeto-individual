// Importa a configuração do banco de dados.
var database = require("../database/config");


// Cadastra as informações complementares do usuário (tabela Perfil guarda dados usados na página de perfil e na dashboard)
function cadastrar(fkUsuario, bio, generoFavorito, livroFavorito, metaMensal) {
    var instrucaoSql = `
        INSERT INTO Perfil (fkUsuario, bio, generoFavorito, livroFavorito, metaMensal)
        VALUES (${fkUsuario}, '${bio}', '${generoFavorito}', '${livroFavorito}', ${metaMensal});
    `;

    console.log("Executando a instrução SQL: \n" + instrucaoSql);
    return database.executar(instrucaoSql);
}


// Atualiza o perfil de um usuário já cadastrado (O where usa fkUsuario para garantir que apenas o perfil do usuário logado seja alterado)
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


// Busca o perfil de um usuário específico (O JOIN com Usuario permite trazer também nome e e-mail junto com os dados do perfil)
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