// Guarda o id da leitura que está sendo editada ( null == cadastro)
let idLeituraEdicao = null;

// Vetor global que guarda as leituras carregadas do banco
let leiturasUsuario = [];


// Verifica se existe um usuário logado
function verificarUsuarioLogado() {
    let idUsuario = sessionStorage.ID_USUARIO;

    if (idUsuario == undefined) {
        alert("Usuário não identificado. Faça login novamente.");
        window.location = "login.html";
        return false;
    }

    return true;
}


// Essa função tenta encontrar o id do livro retornado pelo back-end
function obterIdLivro(retornoLivro) {
    if (retornoLivro == undefined || retornoLivro == null) {
        return undefined;
    }

    if (retornoLivro.idLivro != undefined) {
        return retornoLivro.idLivro;
    }

    if (retornoLivro.insertId != undefined) {
        return retornoLivro.insertId;
    }

    if (retornoLivro[0] != undefined && retornoLivro[0].idLivro != undefined) {
        return retornoLivro[0].idLivro;
    }

    if (retornoLivro[0] != undefined && retornoLivro[0].insertId != undefined) {
        return retornoLivro[0].insertId;
    }

    return undefined;
}


// Decide se o formulário vai salvar uma nova leitura ou atualizar uma existente.
function salvarOuAtualizarLeitura() {
    if (!verificarUsuarioLogado()) {
        return;
    }

    if (idLeituraEdicao == null) {
        salvarLeitura();
    } else {
        atualizarLeitura();
    }
}


// Valida os campos principais do formulário.
// Retorna true se estiver tudo certo e false se tiver algum erro.
function validarFormularioLeitura(tituloLivro, autor, genero, statusLeitura, nota) {
    if (tituloLivro == "") {
        alert("Digite o nome do livro.");
        return false;
    }

    if (autor == "") {
        alert("Digite o autor do livro.");
        return false;
    }

    if (genero == "") {
        alert("Selecione o gênero do livro.");
        return false;
    }

    if (statusLeitura == "") {
        alert("Selecione o status da leitura.");
        return false;
    }

    if (nota != "" && (nota < 1 || nota > 5)) {
        alert("A nota precisa ser entre 1 e 5.");
        return false;
    }

    return true;
}


// Prepara a nota para ser enviada ao banco.
// Se a nota estiver vazia, envia NULL para não quebrar o insert ou uptdate
function prepararNotaParaBanco(nota) {
    if (nota == "") {
        return "NULL";
    } else {
        return nota;
    }
}


// Salva uma nova leitura.
// Primeiro cadastra ou busca o livro, depois registra a leitura vinculada ao usuário
function salvarLeitura() {
    let idUsuario = sessionStorage.ID_USUARIO;

    let tituloLivro = input_livro.value;
    let autor = input_autor.value;
    let genero = select_genero.value;
    let statusLeitura = select_status.value;
    let nota = input_nota.value;
    let comentario = input_comentario.value;

    if (!validarFormularioLeitura(tituloLivro, autor, genero, statusLeitura, nota)) {
        return;
    }

    let notaBanco = prepararNotaParaBanco(nota);

    fetch("/livros/cadastrar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            tituloServer: tituloLivro,
            autorServer: autor,
            generoServer: genero
        })
    })
        .then(function (resposta) {
            if (resposta.ok) {
                return resposta.json();
            } else {
                throw "Erro ao cadastrar ou buscar livro.";
            }
        })
        .then(function (livroCadastrado) {
            let idLivro = obterIdLivro(livroCadastrado);

            if (idLivro == undefined) {
                alert("O livro foi cadastrado, mas o id do livro não foi retornado.");
                return;
            }

            return fetch("/leituras/cadastrar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fkUsuarioServer: idUsuario,
                    fkLivroServer: idLivro,
                    statusLeituraServer: statusLeitura,
                    notaServer: notaBanco,
                    comentarioServer: comentario
                })
            });
        })
        .then(function (respostaLeitura) {
            if (respostaLeitura == undefined) {
                return;
            }

            if (respostaLeitura.ok) {
                mensagem_sucesso.innerHTML = "Leitura registrada com sucesso!";
                limparFormularioLeitura();
                listarLeituras();
            } else {
                alert("Erro ao registrar leitura.");
            }
        })
        .catch(function (erro) {
            console.log(erro);
            alert("Houve um erro ao salvar a leitura.");
        });
}


// Busca todas as leituras do usuário e monta os cards na tela
function listarLeituras() {
    if (!verificarUsuarioLogado()) {
        return;
    }

    let idUsuario = sessionStorage.ID_USUARIO;

    fetch(`/leituras/usuario/${idUsuario}`, {
        method: "GET"
    })
        .then(function (resposta) {
            if (resposta.ok) {
                return resposta.json();
            } else {
                throw "Erro ao buscar leituras.";
            }
        })
        .then(function (leituras) {
            leiturasUsuario = leituras;

            lista_leituras.innerHTML = "";

            if (leituras.length == 0) {
                mensagem_vazia.style.display = "block";
                mensagem_vazia.innerHTML = "Você ainda não registrou nenhuma leitura.";
                return;
            }

            mensagem_vazia.style.display = "none";

            for (let i = 0; i < leituras.length; i++) {
                lista_leituras.innerHTML += montarCardLeitura(leituras[i]);
            }
        })
        .catch(function (erro) {
            console.log(erro);
            mensagem_vazia.style.display = "block";
            mensagem_vazia.innerHTML = "Erro ao carregar leituras.";
        });
}


// Retorna o texto da nota
// Se não tiver nota, mostra "Sem nota"
function obterTextoNota(nota) {
    if (nota != null && nota != "") {
        return nota + "/5";
    } else {
        return "Sem nota";
    }
}


// Retorna o texto do comentário.
// Se não tiver comentário, mostra uma mensagem padrão.
function obterTextoComentario(comentario) {
    if (comentario != null && comentario != "") {
        return comentario;
    } else {
        return "Sem comentário.";
    }
}


// Monta o HTML de um card de leitura.
// O botão editar passa o id da leitura
function montarCardLeitura(leitura) {
    let notaTexto = obterTextoNota(leitura.nota);
    let comentarioTexto = obterTextoComentario(leitura.comentario);

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

    return card;
}


// Procura uma leitura dentro do vetor leiturasUsuario pelo id
function buscarLeituraPorId(idLeitura) {
    let leituraEncontrada = null;

    for (let i = 0; i < leiturasUsuario.length; i++) {
        if (leiturasUsuario[i].idLeitura == idLeitura) {
            leituraEncontrada = leiturasUsuario[i];
        }
    }

    return leituraEncontrada;
}


// Prepara o formulário para editar uma leitura existente.
function prepararEdicaoLeitura(idLeitura) {
    let leituraEncontrada = buscarLeituraPorId(idLeitura);

    if (leituraEncontrada == null) {
        alert("Leitura não encontrada.");
        return;
    }

    idLeituraEdicao = leituraEncontrada.idLeitura;

    preencherFormularioEdicao(leituraEncontrada);
    bloquearCamposLivro();

    titulo_formulario.innerHTML = "Editar leitura";
    botao_salvar_leitura.innerHTML = "Atualizar leitura";
    botao_cancelar_edicao.style.display = "inline-block";

    mensagem_sucesso.innerHTML = "";
}


// Preenche o formulário com os dados da leitura escolhida.
function preencherFormularioEdicao(leitura) {
    input_livro.value = leitura.titulo;
    input_autor.value = leitura.autor;
    select_genero.value = leitura.genero;
    select_status.value = leitura.statusLeitura;

    if (leitura.nota == null) {
        input_nota.value = "";
    } else {
        input_nota.value = leitura.nota;
    }

    if (leitura.comentario == null) {
        input_comentario.value = "";
    } else {
        input_comentario.value = leitura.comentario;
    }
}


// Bloqueia os campos do livro na edição para que o usuário edite apenas status, nota e comentário da leitura
function bloquearCamposLivro() {
    input_livro.disabled = true;
    input_autor.disabled = true;
    select_genero.disabled = true;
}


// Libera os campos do livro quando sai do modo de edição.
function desbloquearCamposLivro() {
    input_livro.disabled = false;
    input_autor.disabled = false;
    select_genero.disabled = false;
}


// Atualiza uma leitura já existente (apenas status, nota e comentário)
function atualizarLeitura() {
    let idUsuario = sessionStorage.ID_USUARIO;

    let statusLeitura = select_status.value;
    let nota = input_nota.value;
    let comentario = input_comentario.value;

    if (idUsuario == undefined) {
        alert("Usuário não identificado. Faça login novamente.");
        window.location = "login.html";
        return;
    }

    if (statusLeitura == "") {
        alert("Selecione o status da leitura.");
        return;
    }

    if (nota != "" && (nota < 1 || nota > 5)) {
        alert("A nota precisa ser entre 1 e 5.");
        return;
    }

    let notaBanco = prepararNotaParaBanco(nota);

    fetch("/leituras/atualizar", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
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
                cancelarEdicao();
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
    idLeituraEdicao = null;

    titulo_formulario.innerHTML = "Nova leitura";

    limparFormularioLeitura();
    desbloquearCamposLivro();

    botao_salvar_leitura.innerHTML = "Salvar leitura";
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
botao_cancelar_edicao.style.display = "none";

// Quando a página carrega, já lista as leituras do usuário.
listarLeituras();