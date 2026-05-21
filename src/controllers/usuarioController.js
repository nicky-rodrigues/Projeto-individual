// Importa o model de usuário, responsável por acessar o banco de dados
var usuarioModel = require("../models/usuarioModel");

// Função responsável por autenticar o login do usuário
function autenticar(req, res) {

    // Recebe o e-mail e a senha enviados pelo front-end no body da requisição
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;

    // Valida se o e-mail foi enviado corretamente
    if (email == undefined) {
        res.status(400).send("Seu email está undefined!");
    }

    // Valida se o e-mail foi enviado corretamente
    else if (senha == undefined) {
        res.status(400).send("Sua senha está indefinida!");
    } else {

        // Chama o model para verificar se existe usuário com esse e-mail e senha
        usuarioModel.autenticar(email, senha)
            .then(
                function (resultadoAutenticar) {
                    console.log(`\nResultados encontrados: ${resultadoAutenticar.length}`);
                    console.log(`Resultados: ${JSON.stringify(resultadoAutenticar)}`); // transforma JSON em String

                    // Se encontrou exatamente um usuário, o login é válido
                    if (resultadoAutenticar.length == 1) {
                        console.log(resultadoAutenticar);

                        // Retorna os dados do usuário autenticado para o front-end
                        res.json(resultadoAutenticar[0]);
                    }

                    // Se encontrou mais de um usuário, indica duplicidade no banco
                    else if (resultadoAutenticar.length == 0) {
                        res.status(403).send("Email e/ou senha inválido(s)");
                    } else {
                        res.status(403).send("Mais de um usuário com o mesmo login e senha!");
                    }
                }
            ).catch(
                function (erro) {

                    // Captura erros durante a autenticação
                    console.log(erro);
                    console.log("\nHouve um erro ao realizar o login! Erro: ", erro.sqlMessage);

                    // Retorna erro interno para o front-end
                    res.status(500).json(erro.sqlMessage);
                }
            );
    }

}


// Função responsável por cadastrar um novo usuário
function cadastrar(req, res) {
    var nome = req.body.nomeServer;
    var email = req.body.emailServer;
    var senha = req.body.senhaServer;

    // Valida se o nome foi enviado
    if (nome == undefined) {
        res.status(400).send("Seu nome está undefined!");
    }

    // Valida se o e-mail foi enviado
    else if (email == undefined) {
        res.status(400).send("Seu email está undefined!");
    }

    // Valida se a senha foi enviada
    else if (senha == undefined) {
        res.status(400).send("Sua senha está undefined!");
    } else {

        // Chama o model para inserir o usuário no banco de dados
        usuarioModel.cadastrar(nome, email, senha)
            .then(
                function (resultado) {

                    // Retorna o resultado do cadastro para o front-end
                    res.json(resultado);
                }
            ).catch(
                function (erro) {

                    // Captura erros durante o cadastro
                    console.log(erro);
                    console.log(
                        "\nHouve um erro ao realizar o cadastro! Erro: ",
                        erro.sqlMessage
                    );

                    // Retorna erro interno para o front-end
                    res.status(500).json(erro.sqlMessage);
                }
            );
    }
}

// Função responsável por listar todos os usuários cadastrados
function listarUsuariosCadastrados(req, res) {

    // Chama o model para buscar todos os usuários no banco
    usuarioModel.listarUsuariosCadastrados()
        .then(
            function (resultado) {

                // Retorna a lista de usuários em formato JSON
                res.json(resultado);
            }
        ).catch(
            function (erro) {

                // Captura erros na listagem
                console.log(erro);
                res.status(500).json(erro.message);
            }
        )
};

// Exporta as funções para que o arquivo de rotas consiga acessá-las
module.exports = {
    autenticar,
    cadastrar,
    listarUsuariosCadastrados
}