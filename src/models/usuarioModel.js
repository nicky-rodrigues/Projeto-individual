// Importa a configuração do banco de dados
var database = require("../database/config")

// Função que faz a autenticação de um usuário no banco
function autenticar(email, senha) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function entrar(): ", email, senha)
    
    // Consulta que busca um usuário com o e-mail e senha informados
    var instrucaoSql = `
        SELECT id, nome, email FROM Usuario WHERE email = '${email}' AND senha = '${senha}';
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);

    // Executa a consulta no banco e retorna o resultado
    return database.executar(instrucaoSql);
}

// Função responsável por inserir um novo usuário no banco de dados
function cadastrar(nome, email, senha) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrar():", nome, email, senha);
    


 // Comando que faz a inserção dos dados do novo usuário na tabela Usuario
    var instrucaoSql = `
        INSERT INTO usuario (nome, email, senha) VALUES ('${nome}', '${email}', '${senha}');
    `;
    console.log("Executando a instrução SQL: \n" + instrucaoSql);

    // Executa o comando de inserção no banco
    return database.executar(instrucaoSql);
}


// Função que busca todos os usuários cadastrados
function listarUsuariosCadastrados(){

    // Consulta SQL que retorna todos os registros da tabela Usuario
    var instrucaoSql = `
    SELECT * FROM Usuario;
    `;
    console.log(instrucaoSql);

    // Executa a consulta e retorna os usuários encontrados
    return database.executar(instrucaoSql);
}

// Exporta as funções para que o controller consiga usar
module.exports = {
    autenticar,
    cadastrar,
    listarUsuariosCadastrados
};