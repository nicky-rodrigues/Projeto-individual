
var ambiente_processo = 'desenvolvimento';

var caminho_env = ambiente_processo === 'producao' ? '.env' : '.env.dev';

require("dotenv").config({ path: caminho_env });

var express = require("express");
var cors = require("cors");
var path = require("path");

var PORTA_APP = process.env.APP_PORT;
var HOST_APP = process.env.APP_HOST;

var app = express();


var indexRouter = require("./src/routes/index");
var usuarioRouter = require("./src/routes/usuarios");


var perfilRouter = require("./src/routes/perfil");
var livroRouter = require("./src/routes/livro");
var leituraRouter = require("./src/routes/leitura");
var publicacaoRouter = require("./src/routes/publicacao");
var curtidaRouter = require("./src/routes/curtida");
var comentarioRouter = require("./src/routes/comentario");


app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(express.static(path.join(__dirname, "public")));

app.use(cors());


app.use("/", indexRouter);
app.use("/usuarios", usuarioRouter);

app.use("/perfis", perfilRouter);
app.use("/livros", livroRouter);
app.use("/leituras", leituraRouter);
app.use("/publicacoes", publicacaoRouter);
app.use("/curtidas", curtidaRouter);
app.use("/comentarios", comentarioRouter);



app.listen(PORTA_APP, function () {
    console.log(`
    ##   ##  ######   #####             ####       ##     ######     ##              ##  ##    ####    ######  
    ##   ##  ##       ##  ##            ## ##     ####      ##      ####             ##  ##     ##         ##  
    ##   ##  ##       ##  ##            ##  ##   ##  ##     ##     ##  ##            ##  ##     ##        ##   
    ## # ##  ####     #####    ######   ##  ##   ######     ##     ######   ######   ##  ##     ##       ##    
    #######  ##       ##  ##            ##  ##   ##  ##     ##     ##  ##            ##  ##     ##      ##     
    ### ###  ##       ##  ##            ## ##    ##  ##     ##     ##  ##             ####      ##     ##      
    ##   ##  ######   #####             ####     ##  ##     ##     ##  ##              ##      ####    ######  

    Servidor do seu site já está rodando! 
    Acesse: http://${HOST_APP}:${PORTA_APP}

    Você está rodando sua aplicação em ambiente de: ${process.env.AMBIENTE_PROCESSO}

    Se desenvolvimento, você está se conectando ao banco local.
    Se produção, você está se conectando ao banco remoto.

    Para alterar o ambiente, comente ou descomente as linhas 1 ou 2 no arquivo app.js.
    `);
});