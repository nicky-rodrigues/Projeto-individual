let idLeituraEdicao = null;

function verificarUsuarioLogado() {
    let idUsuario = sessionStorage.ID_USUARIO;

    if (idUsuario == undefined) {
        alert("Usuário não identificado. Faça login novamente.");
        window.location = "login.html";
        return false;
    }

    return true;
}

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

function salvarLeitura() {
    let idUsuario = sessionStorage.ID_USUARIO;

    let tituloLivro = input_livro.value;
    let autor = input_autor.value;
    let genero = select_genero.value;
    let statusLeitura = select_status.value;
    let nota = input_nota.value;
    let comentario = input_comentario.value;

    if (tituloLivro == "") {
        alert("Digite o nome do livro.");
        return;
    }

    if (autor == "") {
        alert("Digite o autor do livro.");
        return;
    }

    if (genero == "") {
        alert("Selecione o gênero do livro.");
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
                    notaServer: nota,
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
            lista_leituras.innerHTML = "";

            if (leituras.length == 0) {
                mensagem_vazia.style.display = "block";
                mensagem_vazia.innerHTML = "Você ainda não registrou nenhuma leitura.";
                return;
            }

            mensagem_vazia.style.display = "none";

            for (let i = 0; i < leituras.length; i++) {
                let leitura = leituras[i];

                let notaTexto = "Sem nota";

                if (leitura.nota != null && leitura.nota != "") {
                    notaTexto = leitura.nota + "/5";
                }

                let comentarioTexto = "Sem comentário.";

                if (leitura.comentario != null && leitura.comentario != "") {
                    comentarioTexto = leitura.comentario;
                }

                lista_leituras.innerHTML += `
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
    <button class="botao-editar" onclick="prepararEdicaoLeitura(
        ${leitura.idLeitura},
        '${leitura.titulo}',
        '${leitura.autor}',
        '${leitura.genero}',
        '${leitura.statusLeitura}',
        '${leitura.nota == null ? "" : leitura.nota}',
        '${leitura.comentario == null ? "" : leitura.comentario}'
    )">
        Editar
    </button>
</div>
                    </div>
                `;
            }
        })
        .catch(function (erro) {
            console.log(erro);
            mensagem_vazia.style.display = "block";
            mensagem_vazia.innerHTML = "Erro ao carregar leituras.";
        });
}

function prepararEdicaoLeitura(idLeitura, titulo, autor, genero, statusLeitura, nota, comentario) {
    idLeituraEdicao = idLeitura;

    titulo_formulario.innerHTML = "Editar leitura";

    input_livro.value = titulo;
    input_autor.value = autor;
    select_genero.value = genero;
    select_status.value = statusLeitura;
    input_nota.value = nota;
    input_comentario.value = comentario;

    input_livro.disabled = true;
    input_autor.disabled = true;
    select_genero.disabled = true;

    botao_salvar_leitura.innerHTML = "Atualizar leitura";
    botao_cancelar_edicao.style.display = "inline-block";

    mensagem_sucesso.innerHTML = "";
}

function atualizarLeitura() {
    let statusLeitura = select_status.value;
    let nota = input_nota.value;
    let comentario = input_comentario.value;

    if (statusLeitura == "") {
        alert("Selecione o status da leitura.");
        return;
    }

    if (nota != "" && (nota < 1 || nota > 5)) {
        alert("A nota precisa ser entre 1 e 5.");
        return;
    }

    fetch("/leituras/atualizar", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            idLeituraServer: idLeituraEdicao,
            statusLeituraServer: statusLeitura,
            notaServer: nota,
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

function cancelarEdicao() {
    idLeituraEdicao = null;

    titulo_formulario.innerHTML = "Nova leitura";

    limparFormularioLeitura();

    input_livro.disabled = false;
    input_autor.disabled = false;
    select_genero.disabled = false;

    botao_salvar_leitura.innerHTML = "Salvar leitura";
    botao_cancelar_edicao.style.display = "none";
}

function limparFormularioLeitura() {
    input_livro.value = "";
    input_autor.value = "";
    select_genero.value = "";
    select_status.value = "";
    input_nota.value = "";
    input_comentario.value = "";
}

botao_cancelar_edicao.style.display = "none";

listarLeituras();