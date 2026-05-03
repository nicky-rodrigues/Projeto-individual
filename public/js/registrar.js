let leituraEmEdicao = 0;

function verificarUsuarioLogado() {
    let idUsuario = sessionStorage.ID_USUARIO;

    if (idUsuario == undefined) {
        mensagem_vazia.innerHTML = "Usuário não identificado. Faça login novamente.";
        return false;
    }

    return true;
}

function carregarLeituras() {
    if (!verificarUsuarioLogado()) {
        return;
    }

    let idUsuario = sessionStorage.ID_USUARIO;

    mensagem_vazia.style.display = "block";
    mensagem_vazia.innerHTML = "Carregando leituras...";
    lista_leituras.innerHTML = "";

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
                mensagem_vazia.innerHTML = "Nenhuma leitura registrada ainda.";
            } else {
                mensagem_vazia.style.display = "none";

                for (let i = 0; i < leituras.length; i++) {
                    let leitura = leituras[i];

                    let comentarioTratado = leitura.comentario;

                    if (comentarioTratado == null || comentarioTratado == "") {
                        comentarioTratado = "Sem comentário.";
                    }

                    lista_leituras.innerHTML += `
                        <div class="cartao-leitura">
                            <h4>${leitura.titulo}</h4>
                            <p><strong>Autor:</strong> ${leitura.autor}</p>

                            <div class="etiquetas-leitura">
                                <span>${leitura.genero}</span>
                                <span>${leitura.statusLeitura}</span>
                                <span>⭐ ${leitura.nota}/5</span>
                            </div>

                            <p><strong>Comentário:</strong> ${comentarioTratado}</p>

                            <button class="botao-editar" onclick="prepararEdicao(${leitura.idLeitura}, '${leitura.titulo}', '${leitura.autor}', '${leitura.genero}', '${leitura.statusLeitura}', ${leitura.nota}, '${comentarioTratado}')">
                                Editar leitura
                            </button>
                        </div>
                    `;
                }
            }
        })
        .catch(function (erro) {
            console.log("Erro no carregarLeituras:", erro);

            mensagem_vazia.style.display = "block";
            mensagem_vazia.innerHTML = "Erro ao carregar leituras. Verifique o terminal do Node.";
        });
}

function salvarOuAtualizarLeitura() {
    if (leituraEmEdicao == 0) {
        salvarLeitura();
    } else {
        atualizarLeitura();
    }
}

function salvarLeitura() {
    if (!verificarUsuarioLogado()) {
        return;
    }

    let idUsuario = sessionStorage.ID_USUARIO;

    let titulo = input_livro.value;
    let autor = input_autor.value;
    let genero = select_genero.value;
    let statusLeitura = select_status.value;
    let nota = input_nota.value;
    let comentario = input_comentario.value;

    if (titulo == "") {
        alert("Digite o nome do livro.");
        return;
    }

    if (autor == "") {
        alert("Digite o nome do autor.");
        return;
    }

    if (genero == "") {
        alert("Selecione o gênero.");
        return;
    }

    if (statusLeitura == "") {
        alert("Selecione o status da leitura.");
        return;
    }

    if (nota == "") {
        alert("Digite uma nota de 1 a 5.");
        return;
    }

    if (nota < 1 || nota > 5) {
        alert("A nota precisa ser entre 1 e 5.");
        return;
    }

    if (comentario == "") {
        comentario = "Sem comentário.";
    }

    mensagem_sucesso.innerHTML = "Salvando livro...";

    fetch("/livros/cadastrar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            tituloServer: titulo,
            autorServer: autor,
            generoServer: genero
        })
    })
        .then(function (resposta) {
            if (resposta.ok) {
                return resposta.json();
            } else {
                throw "Erro ao cadastrar livro.";
            }
        })
        .then(function (resultadoLivro) {
            let fkLivro = resultadoLivro.insertId;

            if (fkLivro == undefined) {
                alert("O livro foi cadastrado, mas o id do livro não foi retornado.");
                mensagem_sucesso.innerHTML = "";
                console.log(resultadoLivro);
                return;
            }

            mensagem_sucesso.innerHTML = "Salvando leitura...";

            fetch("/leituras/cadastrar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fkUsuarioServer: idUsuario,
                    fkLivroServer: fkLivro,
                    statusLeituraServer: statusLeitura,
                    notaServer: nota,
                    comentarioServer: comentario
                })
            })
                .then(function (resposta) {
                    if (resposta.ok) {
                        mensagem_sucesso.innerHTML = "Leitura registrada com sucesso!";

                        limparFormulario();
                        carregarLeituras();
                    } else {
                        throw "Erro ao registrar leitura.";
                    }
                })
                .catch(function (erro) {
                    console.log("Erro no cadastro da leitura:", erro);
                    alert("Houve um erro ao registrar a leitura. Veja o terminal.");
                    mensagem_sucesso.innerHTML = "";
                });
        })
        .catch(function (erro) {
            console.log("Erro no cadastro do livro:", erro);
            alert("Houve um erro ao cadastrar o livro. Veja o terminal.");
            mensagem_sucesso.innerHTML = "";
        });
}

function prepararEdicao(idLeitura, titulo, autor, genero, statusLeitura, nota, comentario) {
    leituraEmEdicao = idLeitura;

    input_livro.value = titulo;
    input_autor.value = autor;
    select_genero.value = genero;
    select_status.value = statusLeitura;
    input_nota.value = nota;
    input_comentario.value = comentario;

    input_livro.disabled = true;
    input_autor.disabled = true;
    select_genero.disabled = true;

    titulo_formulario.innerHTML = "Editar leitura";
    botao_salvar_leitura.innerHTML = "Atualizar leitura";
    botao_cancelar_edicao.style.display = "inline-block";

    mensagem_sucesso.innerHTML = "Editando leitura selecionada. Altere status, nota ou comentário.";
}

function atualizarLeitura() {
    if (!verificarUsuarioLogado()) {
        return;
    }

    let idUsuario = sessionStorage.ID_USUARIO;

    let statusLeitura = select_status.value;
    let nota = input_nota.value;
    let comentario = input_comentario.value;

    if (statusLeitura == "") {
        alert("Selecione o status da leitura.");
        return;
    }

    if (nota == "") {
        alert("Digite uma nota de 1 a 5.");
        return;
    }

    if (nota < 1 || nota > 5) {
        alert("A nota precisa ser entre 1 e 5.");
        return;
    }

    if (comentario == "") {
        comentario = "Sem comentário.";
    }

    mensagem_sucesso.innerHTML = "Atualizando leitura...";

    fetch("/leituras/atualizar", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            idLeituraServer: leituraEmEdicao,
            fkUsuarioServer: idUsuario,
            statusLeituraServer: statusLeitura,
            notaServer: nota,
            comentarioServer: comentario
        })
    })
        .then(function (resposta) {
            if (resposta.ok) {
                mensagem_sucesso.innerHTML = "Leitura atualizada com sucesso!";

                cancelarEdicao();
                carregarLeituras();
            } else {
                throw "Erro ao atualizar leitura.";
            }
        })
        .catch(function (erro) {
            console.log("Erro ao atualizar leitura:", erro);
            alert("Houve um erro ao atualizar a leitura.");
            mensagem_sucesso.innerHTML = "";
        });
}

function cancelarEdicao() {
    leituraEmEdicao = 0;

    limparFormulario();

    input_livro.disabled = false;
    input_autor.disabled = false;
    select_genero.disabled = false;

    titulo_formulario.innerHTML = "Nova leitura";
    botao_salvar_leitura.innerHTML = "Salvar leitura";
    botao_cancelar_edicao.style.display = "none";

    mensagem_sucesso.innerHTML = "";
}

function limparFormulario() {
    input_livro.value = "";
    input_autor.value = "";
    select_genero.value = "";
    select_status.value = "";
    input_nota.value = "";
    input_comentario.value = "";
}

carregarLeituras();