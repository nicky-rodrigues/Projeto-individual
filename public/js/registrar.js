// Guarda o id da leitura que está sendo editada.
// Quando está null, significa que o formulário está no modo de cadastro de uma nova leitura.
// Quando recebe um id, significa que o formulário está editando uma leitura existente.
let idLeituraEdicao = null;

// Vetor global que guarda as leituras carregadas do banco.
// Ele é usado principalmente na edição, para encontrar uma leitura pelo id.
let leiturasUsuario = [];


// Verifica se existe um usuário logado.
// Essa função é chamada antes de ações importantes, como salvar, atualizar ou listar leituras.
function verificarUsuarioLogado() {
    // Recupera o id do usuário salvo na sessão depois do login.
    let idUsuario = sessionStorage.ID_USUARIO;

    // Se não existir idUsuario, o usuário não deve continuar na página.
    if (idUsuario == undefined) {
        alert("Usuário não identificado. Faça login novamente.");

        // Redireciona para a tela de login.
        window.location = "login.html";

        // Retorna false para a função que chamou saber que deve parar.
        return false;
    }

    // Se chegou até aqui, existe usuário logado.
    return true;
}


// Essa função tenta encontrar o id do livro retornado pelo back-end.
// Ela existe porque o retorno pode vir em formatos diferentes dependendo da resposta do model/controller.
function obterIdLivro(retornoLivro) {
    // Se o retorno vier vazio, não há como pegar id.
    if (retornoLivro == undefined || retornoLivro == null) {
        return undefined;
    }

    // Caso o back-end retorne diretamente um objeto com idLivro.
    if (retornoLivro.idLivro != undefined) {
        return retornoLivro.idLivro;
    }

    // Caso o banco retorne um insertId depois de inserir o livro.
    if (retornoLivro.insertId != undefined) {
        return retornoLivro.insertId;
    }

    // Caso o retorno venha como vetor e o primeiro item tenha idLivro.
    if (retornoLivro[0] != undefined && retornoLivro[0].idLivro != undefined) {
        return retornoLivro[0].idLivro;
    }

    // Caso o retorno venha como vetor e o primeiro item tenha insertId.
    if (retornoLivro[0] != undefined && retornoLivro[0].insertId != undefined) {
        return retornoLivro[0].insertId;
    }

    // Se nenhum formato esperado foi encontrado, retorna undefined.
    return undefined;
}


// Decide se o formulário vai salvar uma nova leitura ou atualizar uma existente.
function salvarOuAtualizarLeitura() {
    // Antes de qualquer ação, verifica se o usuário está logado.
    if (!verificarUsuarioLogado()) {
        return;
    }

    // Se idLeituraEdicao está null, o usuário está cadastrando uma nova leitura.
    if (idLeituraEdicao == null) {
        salvarLeitura();

    // Se idLeituraEdicao tem valor, o usuário está editando uma leitura existente.
    } else {
        atualizarLeitura();
    }
}


// Valida os campos principais do formulário.
// Retorna true se estiver tudo certo e false se tiver algum erro.
function validarFormularioLeitura(tituloLivro, autor, genero, statusLeitura, nota) {
    // Valida se o nome do livro foi preenchido.
    if (tituloLivro == "") {
        alert("Digite o nome do livro.");
        return false;
    }

    // Valida se o autor foi preenchido.
    if (autor == "") {
        alert("Digite o autor do livro.");
        return false;
    }

    // Valida se o gênero foi selecionado.
    if (genero == "") {
        alert("Selecione o gênero do livro.");
        return false;
    }

    // Valida se o status foi selecionado.
    if (statusLeitura == "") {
        alert("Selecione o status da leitura.");
        return false;
    }

    // A nota não é obrigatória, mas se for preenchida precisa estar entre 1 e 5.
    if (nota != "" && (nota < 1 || nota > 5)) {
        alert("A nota precisa ser entre 1 e 5.");
        return false;
    }

    // Se passou por todas as validações, o formulário está válido.
    return true;
}


// Prepara a nota para ser enviada ao banco.
// Se a nota estiver vazia, envia NULL para o SQL.
// Isso evita salvar uma string vazia em um campo numérico.
function prepararNotaParaBanco(nota) {
    if (nota == "") {
        return "NULL";
    } else {
        return nota;
    }
}


// Salva uma nova leitura.
// Fluxo dessa função:
// 1. Pega os dados do formulário.
// 2. Valida os campos.
// 3. Cadastra ou busca o livro.
// 4. Usa o id do livro para cadastrar a leitura.
function salvarLeitura() {
    // Recupera o usuário logado.
    let idUsuario = sessionStorage.ID_USUARIO;

    // Pega os valores preenchidos no formulário.
    let tituloLivro = input_livro.value;
    let autor = input_autor.value;
    let genero = select_genero.value;
    let statusLeitura = select_status.value;
    let nota = input_nota.value;
    let comentario = input_comentario.value;

    // Valida os campos obrigatórios antes de enviar qualquer coisa ao banco.
    if (!validarFormularioLeitura(tituloLivro, autor, genero, statusLeitura, nota)) {
        return;
    }

    // Prepara a nota para o banco.
    // Se estiver vazia, vira NULL.
    let notaBanco = prepararNotaParaBanco(nota);

    // Primeiro fetch: cadastra o livro ou retorna um livro já existente.
    // Isso evita duplicidade na tabela Livro.
    fetch("/livros/cadastrar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },

        // Envia os dados do livro para o controller de livros.
        body: JSON.stringify({
            tituloServer: tituloLivro,
            autorServer: autor,
            generoServer: genero
        })
    })
        // Primeiro then: valida a resposta da rota /livros/cadastrar.
        .then(function (resposta) {
            if (resposta.ok) {
                // Converte a resposta para JSON.
                // Esse JSON deve conter o idLivro.
                return resposta.json();
            } else {
                throw "Erro ao cadastrar ou buscar livro.";
            }
        })

        // Segundo then: recebe o livro cadastrado ou encontrado.
        .then(function (livroCadastrado) {
            // Extrai o idLivro do retorno do back-end.
            let idLivro = obterIdLivro(livroCadastrado);

            // Se não conseguiu encontrar o idLivro, não dá para cadastrar a leitura.
            if (idLivro == undefined) {
                alert("O livro foi cadastrado, mas o id do livro não foi retornado.");
                return;
            }

            // Segundo fetch: cadastra a leitura usando o id do usuário e o id do livro.
            return fetch("/leituras/cadastrar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },

                // Envia a relação entre usuário, livro e os dados da leitura.
                body: JSON.stringify({
                    fkUsuarioServer: idUsuario,
                    fkLivroServer: idLivro,
                    statusLeituraServer: statusLeitura,
                    notaServer: notaBanco,
                    comentarioServer: comentario
                })
            });
        })

        // Terceiro then: trata a resposta do cadastro da leitura.
        .then(function (respostaLeitura) {
            // Se respostaLeitura for undefined, significa que o fluxo foi interrompido antes.
            if (respostaLeitura == undefined) {
                return;
            }

            // Se deu certo, mostra mensagem, limpa formulário e atualiza a lista.
            if (respostaLeitura.ok) {
                mensagem_sucesso.innerHTML = "Leitura registrada com sucesso!";

                // Limpa o formulário para um novo cadastro.
                limparFormularioLeitura();

                // Recarrega as leituras para mostrar o novo card na tela.
                listarLeituras();
            } else {
                alert("Erro ao registrar leitura.");
            }
        })

        // Captura erros de qualquer etapa do fluxo.
        .catch(function (erro) {
            console.log(erro);
            alert("Houve um erro ao salvar a leitura.");
        });
}


// Busca todas as leituras do usuário e monta os cards na tela.
function listarLeituras() {
    // Verifica se o usuário está logado antes de buscar dados.
    if (!verificarUsuarioLogado()) {
        return;
    }

    // Recupera o id do usuário logado.
    let idUsuario = sessionStorage.ID_USUARIO;

    // Busca as leituras do usuário no back-end.
    fetch(`/leituras/usuario/${idUsuario}`, {
        method: "GET"
    })
        // Primeiro then: valida a resposta.
        .then(function (resposta) {
            if (resposta.ok) {
                // Converte para JSON.
                // O resultado será um vetor de leituras.
                return resposta.json();
            } else {
                throw "Erro ao buscar leituras.";
            }
        })

        // Segundo then: recebe o vetor de leituras.
        .then(function (leituras) {
            // Guarda as leituras no vetor global.
            // Esse vetor será usado depois para localizar uma leitura na edição.
            leiturasUsuario = leituras;

            // Limpa a lista antes de montar novamente.
            // Isso evita duplicar cards quando listarLeituras() for chamada de novo.
            lista_leituras.innerHTML = "";

            // Se não houver leituras, mostra uma mensagem.
            if (leituras.length == 0) {
                mensagem_vazia.style.display = "block";
                mensagem_vazia.innerHTML = "Você ainda não registrou nenhuma leitura.";
                return;
            }

            // Se existem leituras, esconde a mensagem vazia.
            mensagem_vazia.style.display = "none";

            // Percorre cada leitura retornada pelo banco.
            for (let i = 0; i < leituras.length; i++) {
                // Para cada leitura, monta um card HTML e adiciona na lista.
                lista_leituras.innerHTML += montarCardLeitura(leituras[i]);
            }
        })

        // Se houver erro na busca, mostra uma mensagem na tela.
        .catch(function (erro) {
            console.log(erro);
            mensagem_vazia.style.display = "block";
            mensagem_vazia.innerHTML = "Erro ao carregar leituras.";
        });
}


// Retorna o texto da nota.
// Se não tiver nota, mostra "Sem nota".
function obterTextoNota(nota) {
    // Se a nota existe, mostra no formato 4/5, 5/5 etc.
    if (nota != null && nota != "") {
        return nota + "/5";
    } else {
        // Se não existe nota, evita mostrar null ou vazio na tela.
        return "Sem nota";
    }
}


// Retorna o texto do comentário.
// Se não tiver comentário, mostra uma mensagem padrão.
function obterTextoComentario(comentario) {
    // Se o comentário existe, retorna o comentário digitado.
    if (comentario != null && comentario != "") {
        return comentario;
    } else {
        // Se não existe comentário, retorna texto padrão.
        return "Sem comentário.";
    }
}


// Monta o HTML de um card de leitura.
// O botão editar passa apenas o id da leitura.
// Depois, esse id será usado para buscar a leitura completa no vetor leiturasUsuario.
function montarCardLeitura(leitura) {
    // Trata a nota antes de exibir.
    let notaTexto = obterTextoNota(leitura.nota);

    // Trata o comentário antes de exibir.
    let comentarioTexto = obterTextoComentario(leitura.comentario);

    // Cria a estrutura HTML do card.
    // Os dados vêm do objeto leitura retornado pelo banco.
    let card = `
        <div class="cartao-leitura">
            <div class="topo-leitura">
                <div>
                    <h4>${leitura.titulo}</h4>
                    <p>${leitura.autor}</p>
                </div>

                <span class="status-leitura">${leitura.statusLeitura}</span>
            </div>

            <div class="detalhes-leitura">
                <span>Gênero: <strong>${leitura.genero}</strong></span>
                <span>Nota: <strong>${notaTexto}</strong></span>
            </div>

            <p class="comentario-leitura">${comentarioTexto}</p>

            <div class="acoes-leitura">
                <button class="botao-editar" onclick="prepararEdicaoLeitura(${leitura.idLeitura})">
                    Editar
                </button>
            </div>
        </div>
    `;

    // Retorna o HTML pronto para ser inserido na lista.
    return card;
}


// Procura uma leitura dentro do vetor leiturasUsuario pelo id.
// Essa função evita passar muitos dados pelo onclick do botão editar.
function buscarLeituraPorId(idLeitura) {
    // Começa como null porque ainda não encontramos a leitura.
    let leituraEncontrada = null;

    // Percorre todas as leituras carregadas do banco.
    for (let i = 0; i < leiturasUsuario.length; i++) {

        // Compara o id da leitura atual com o id recebido.
        if (leiturasUsuario[i].idLeitura == idLeitura) {

            // Se encontrar, guarda essa leitura.
            leituraEncontrada = leiturasUsuario[i];
        }
    }

    // Retorna a leitura encontrada ou null.
    return leituraEncontrada;
}


// Prepara o formulário para editar uma leitura existente.
function prepararEdicaoLeitura(idLeitura) {
    // Busca a leitura completa no vetor global usando o id recebido pelo botão.
    let leituraEncontrada = buscarLeituraPorId(idLeitura);

    // Se não encontrar a leitura, mostra alerta e interrompe.
    if (leituraEncontrada == null) {
        alert("Leitura não encontrada.");
        return;
    }

    // Guarda o id da leitura em edição.
    // Isso muda o modo do formulário de cadastro para edição.
    idLeituraEdicao = leituraEncontrada.idLeitura;

    // Preenche o formulário com os dados da leitura escolhida.
    preencherFormularioEdicao(leituraEncontrada);

    // Bloqueia livro, autor e gênero para não alterar o vínculo da leitura.
    bloquearCamposLivro();

    // Altera os textos visuais para indicar que está no modo edição.
    titulo_formulario.innerHTML = "Editar leitura";
    botao_salvar_leitura.innerHTML = "Atualizar leitura";
    botao_cancelar_edicao.style.display = "inline-block";

    // Limpa mensagem anterior de sucesso, se existir.
    mensagem_sucesso.innerHTML = "";
}


// Preenche o formulário com os dados da leitura escolhida.
function preencherFormularioEdicao(leitura) {
    // Preenche os campos do livro.
    input_livro.value = leitura.titulo;
    input_autor.value = leitura.autor;
    select_genero.value = leitura.genero;

    // Preenche o status atual da leitura.
    select_status.value = leitura.statusLeitura;

    // Se a nota for null, deixa o campo vazio.
    if (leitura.nota == null) {
        input_nota.value = "";
    } else {
        input_nota.value = leitura.nota;
    }

    // Se o comentário for null, deixa o campo vazio.
    if (leitura.comentario == null) {
        input_comentario.value = "";
    } else {
        input_comentario.value = leitura.comentario;
    }
}


// Bloqueia os campos do livro na edição.
// A ideia é permitir editar apenas status, nota e comentário da leitura,
// sem trocar o livro relacionado.
function bloquearCamposLivro() {
    input_livro.disabled = true;
    input_autor.disabled = true;
    select_genero.disabled = true;
}


// Libera os campos do livro quando sai do modo de edição.
// Isso permite cadastrar uma nova leitura normalmente.
function desbloquearCamposLivro() {
    input_livro.disabled = false;
    input_autor.disabled = false;
    select_genero.disabled = false;
}


// Atualiza uma leitura já existente.
// Nesta função são atualizados apenas status, nota e comentário.
function atualizarLeitura() {
    // Recupera o usuário logado.
    let idUsuario = sessionStorage.ID_USUARIO;

    // Pega os campos editáveis do formulário.
    let statusLeitura = select_status.value;
    let nota = input_nota.value;
    let comentario = input_comentario.value;

    // Validação de segurança para usuário logado.
    if (idUsuario == undefined) {
        alert("Usuário não identificado. Faça login novamente.");
        window.location = "login.html";
        return;
    }

    // Na edição, o status continua sendo obrigatório.
    if (statusLeitura == "") {
        alert("Selecione o status da leitura.");
        return;
    }

    // A nota continua opcional, mas se preenchida precisa estar entre 1 e 5.
    if (nota != "" && (nota < 1 || nota > 5)) {
        alert("A nota precisa ser entre 1 e 5.");
        return;
    }

    // Prepara a nota para o banco.
    let notaBanco = prepararNotaParaBanco(nota);

    // Envia a atualização para o back-end.
    fetch("/leituras/atualizar", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },

        // Envia o id da leitura em edição e os novos valores.
        body: JSON.stringify({
            idLeituraServer: idLeituraEdicao,
            fkUsuarioServer: idUsuario,
            statusLeituraServer: statusLeitura,
            notaServer: notaBanco,
            comentarioServer: comentario
        })
    })
        .then(function (resposta) {
            if (resposta.ok) {
                mensagem_sucesso.innerHTML = "Leitura atualizada com sucesso!";

                // Sai do modo edição e volta o formulário ao estado normal.
                cancelarEdicao();

                // Recarrega a lista para mostrar os dados atualizados.
                listarLeituras();
            } else {
                alert("Erro ao atualizar leitura.");
            }
        })
        .catch(function (erro) {
            console.log(erro);
            alert("Houve um erro ao atualizar a leitura.");
        });
}


// Cancela o modo de edição e volta o formulário para nova leitura.
function cancelarEdicao() {
    // Remove o id da leitura em edição.
    // Isso faz salvarOuAtualizarLeitura() voltar a chamar salvarLeitura().
    idLeituraEdicao = null;

    // Volta o título do formulário para cadastro.
    titulo_formulario.innerHTML = "Nova leitura";

    // Limpa os campos do formulário.
    limparFormularioLeitura();

    // Libera os campos de livro, autor e gênero.
    desbloquearCamposLivro();

    // Volta o botão principal para salvar leitura.
    botao_salvar_leitura.innerHTML = "Salvar leitura";

    // Esconde o botão de cancelar edição.
    botao_cancelar_edicao.style.display = "none";
}


// Limpa todos os campos do formulário.
function limparFormularioLeitura() {
    input_livro.value = "";
    input_autor.value = "";
    select_genero.value = "";
    select_status.value = "";
    input_nota.value = "";
    input_comentario.value = "";
}


// Configuração inicial da tela.
// O botão de cancelar edição começa escondido porque a página inicia em modo de cadastro.
botao_cancelar_edicao.style.display = "none";

// Quando a página carrega, já lista as leituras do usuário.
listarLeituras();