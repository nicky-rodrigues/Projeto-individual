let tipoPublicacaoSelecionado = "";
let curtidasTemporarias = 0;

function verificarUsuarioLogado() {
    let idUsuario = sessionStorage.ID_USUARIO;

    if (idUsuario == undefined) {
        alert("Usuário não identificado. Faça login novamente.");
        window.location = "login.html";
        return false;
    }

    return true;
}

function carregarDadosUsuario() {
    if (!verificarUsuarioLogado()) {
        return;
    }

    let idUsuario = sessionStorage.ID_USUARIO;
    let nomeUsuario = sessionStorage.NOME_USUARIO;

    titulo_boas_vindas.innerHTML = "Olá, " + nomeUsuario;
    nome_usuario_lateral.innerHTML = nomeUsuario;
    avatar_usuario.innerHTML = nomeUsuario[0];
    avatar_criar_publicacao.innerHTML = nomeUsuario[0];

    fetch(`/perfis/listar/${idUsuario}`, {
        method: "GET"
    })
        .then(function (resposta) {
            if (resposta.ok) {
                return resposta.json();
            } else {
                throw "Erro ao buscar perfil.";
            }
        })
        .then(function (perfil) {
            if (perfil.length > 0) {
                bio_usuario_lateral.innerHTML = perfil[0].bio;
                span_genero_favorito.innerHTML = perfil[0].generoFavorito;
                resumo_genero_favorito.innerHTML = perfil[0].generoFavorito;

                span_meta_mes.innerHTML = "0/" + perfil[0].metaMensal;
                resumo_meta_mes.innerHTML = "0/" + perfil[0].metaMensal;
            } else {
                bio_usuario_lateral.innerHTML = "Perfil ainda não configurado.";
                span_genero_favorito.innerHTML = "-";
                resumo_genero_favorito.innerHTML = "-";

                span_meta_mes.innerHTML = "0/0";
                resumo_meta_mes.innerHTML = "0/0";
            }

            carregarResumoLeituras();
        })
        .catch(function (erro) {
            console.log(erro);
            bio_usuario_lateral.innerHTML = "Erro ao carregar perfil.";
            carregarResumoLeituras();
        });
}

function carregarResumoLeituras() {
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
            let totalConcluidos = 0;

            for (let i = 0; i < leituras.length; i++) {
                if (leituras[i].statusLeitura == "Concluído") {
                    totalConcluidos++;
                }
            }

            span_livros_lidos.innerHTML = totalConcluidos;
            resumo_livros_lidos.innerHTML = totalConcluidos;

            let metaAtual = span_meta_mes.innerHTML;
            let partesMeta = metaAtual.split("/");

            if (partesMeta.length == 2) {
                span_meta_mes.innerHTML = totalConcluidos + "/" + partesMeta[1];
                resumo_meta_mes.innerHTML = totalConcluidos + "/" + partesMeta[1];
            }
        })
        .catch(function (erro) {
            console.log(erro);
            span_livros_lidos.innerHTML = "0";
            resumo_livros_lidos.innerHTML = "0";
        });
}

function selecionarTipoPublicacao(tipo) {
    tipoPublicacaoSelecionado = tipo;

    botao_resenha.style.backgroundColor = "rgba(243, 235, 221, 0.04)";
    botao_resenha.style.color = "#E8DCC8";

    botao_avaliacao.style.backgroundColor = "rgba(243, 235, 221, 0.04)";
    botao_avaliacao.style.color = "#E8DCC8";

    botao_citacao.style.backgroundColor = "rgba(243, 235, 221, 0.04)";
    botao_citacao.style.color = "#E8DCC8";

    botao_meta.style.backgroundColor = "rgba(243, 235, 221, 0.04)";
    botao_meta.style.color = "#E8DCC8";

    if (tipo == "resenha") {
        botao_resenha.style.backgroundColor = "#B08A57";
        botao_resenha.style.color = "#1E1A17";
    } else if (tipo == "avaliacao") {
        botao_avaliacao.style.backgroundColor = "#B08A57";
        botao_avaliacao.style.color = "#1E1A17";
    } else if (tipo == "citacao") {
        botao_citacao.style.backgroundColor = "#B08A57";
        botao_citacao.style.color = "#1E1A17";
    } else if (tipo == "meta") {
        botao_meta.style.backgroundColor = "#B08A57";
        botao_meta.style.color = "#1E1A17";
    }
}

function limparBotoesTipoPublicacao() {
    botao_resenha.style.backgroundColor = "rgba(243, 235, 221, 0.04)";
    botao_resenha.style.color = "#E8DCC8";

    botao_avaliacao.style.backgroundColor = "rgba(243, 235, 221, 0.04)";
    botao_avaliacao.style.color = "#E8DCC8";

    botao_citacao.style.backgroundColor = "rgba(243, 235, 221, 0.04)";
    botao_citacao.style.color = "#E8DCC8";

    botao_meta.style.backgroundColor = "rgba(243, 235, 221, 0.04)";
    botao_meta.style.color = "#E8DCC8";
}

function publicar() {
    if (!verificarUsuarioLogado()) {
        return;
    }

    let idUsuario = sessionStorage.ID_USUARIO;
    let textoPublicacao = input_post.value;
    let livroRelacionado = input_livro.value;

    if (textoPublicacao == "") {
        alert("Escreva algo antes de publicar.");
        return;
    }

    if (tipoPublicacaoSelecionado == "") {
        tipoPublicacaoSelecionado = "atualizacao";
    }

    let textoFinal = textoPublicacao;

    if (livroRelacionado != "") {
        textoFinal = textoPublicacao + " | Livro relacionado: " + livroRelacionado;
    }

    fetch("/publicacoes/cadastrar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            fkUsuarioServer: idUsuario,
            fkLivroServer: "",
            tipoPublicacaoServer: tipoPublicacaoSelecionado,
            textoServer: textoFinal
        })
    })
        .then(function (resposta) {
            if (resposta.ok) {
                mensagem_publicacao.innerHTML = "Publicação criada com sucesso!";

                input_post.value = "";
                input_livro.value = "";
                tipoPublicacaoSelecionado = "";

                limparBotoesTipoPublicacao();
                carregarPublicacoes();
            } else {
                alert("Erro ao criar publicação.");
            }
        })
        .catch(function (erro) {
            console.log(erro);
            alert("Houve um erro ao publicar.");
        });
}

function carregarPublicacoes() {
    fetch("/publicacoes", {
        method: "GET"
    })
        .then(function (resposta) {
            if (resposta.ok) {
                return resposta.json();
            } else {
                throw "Erro ao buscar publicações.";
            }
        })
        .then(function (publicacoes) {
            feed_posts.innerHTML = "";

            if (publicacoes.length == 0) {
                feed_posts.innerHTML = `
                    <div class="caixa-social cartao-publicacao">
                        <p>Nenhuma publicação ainda. Seja a primeira pessoa a compartilhar uma leitura!</p>
                    </div>
                `;
                return;
            }

            for (let i = 0; i < publicacoes.length; i++) {
                let publicacao = publicacoes[i];

                let tipoTexto = "publicou uma atualização";

                if (publicacao.tipoPublicacao == "resenha") {
                    tipoTexto = "publicou uma resenha";
                } else if (publicacao.tipoPublicacao == "avaliacao") {
                    tipoTexto = "publicou uma avaliação";
                } else if (publicacao.tipoPublicacao == "citacao") {
                    tipoTexto = "compartilhou uma citação";
                } else if (publicacao.tipoPublicacao == "meta") {
                    tipoTexto = "atualizou uma meta de leitura";
                }

                let inicialUsuario = publicacao.nome[0];

                let blocoLivro = "";

                if (publicacao.titulo != null) {
                    blocoLivro = `
                        <div class="livro-publicacao">
                            <div>
                                <strong>${publicacao.titulo}</strong>
                                <span>${publicacao.autor}</span>
                            </div>
                        </div>
                    `;
                }

                feed_posts.innerHTML += `
                    <article class="caixa-social cartao-publicacao">
                        <div class="cabecalho-publicacao">
                            <div class="avatar-pequeno">${inicialUsuario}</div>

                            <div class="info-usuario-publicacao">
                                <h4>${publicacao.nome}</h4>
                                <span>${tipoTexto}</span>
                            </div>
                        </div>

                        <p class="texto-publicacao">${publicacao.texto}</p>

                        ${blocoLivro}

                        <div class="contadores-publicacao">
                            <span id="curtidas_post_${publicacao.idPublicacao}">0 curtidas</span>
                            <span id="comentarios_total_${publicacao.idPublicacao}">0 comentários</span>
                        </div>

                        <div class="rodape-publicacao">
                            <button type="button" onclick="curtirPublicacao(${publicacao.idPublicacao}, this)">
                                ♡ Curtir
                            </button>

                            <button type="button" onclick="mostrarComentario(${publicacao.idPublicacao})">
                                💬 Comentar
                            </button>

                            <button type="button" onclick="salvarPublicacao(this)">
                                🔖 Salvar
                            </button>
                        </div>

                        <div id="comentario_area_${publicacao.idPublicacao}" class="area-comentario">
                            <input 
                                id="comentario_input_${publicacao.idPublicacao}" 
                                type="text" 
                                placeholder="Escreva um comentário...">

                            <button type="button" onclick="comentarPublicacao(${publicacao.idPublicacao})">
                                Enviar
                            </button>
                        </div>

                        <div id="comentarios_post_${publicacao.idPublicacao}" class="lista-comentarios"></div>
                    </article>
                `;
            }
        })
        .catch(function (erro) {
            console.log(erro);

            feed_posts.innerHTML = `
                <div class="caixa-social cartao-publicacao">
                    <p>Erro ao carregar publicações.</p>
                </div>
            `;
        });
}

function curtirPublicacao(idPublicacao, botao) {
    let spanCurtidas = document.getElementById("curtidas_post_" + idPublicacao);

    if (botao.innerHTML.trim() == "♡ Curtir") {
        curtidasTemporarias = 1;
        spanCurtidas.innerHTML = curtidasTemporarias + " curtida";
        botao.innerHTML = "❤️ Curtido";
    } else {
        curtidasTemporarias = 0;
        spanCurtidas.innerHTML = curtidasTemporarias + " curtidas";
        botao.innerHTML = "♡ Curtir";
    }
}

function mostrarComentario(idPublicacao) {
    let areaComentario = document.getElementById("comentario_area_" + idPublicacao);

    if (areaComentario.style.display == "flex") {
        areaComentario.style.display = "none";
    } else {
        areaComentario.style.display = "flex";
    }
}

function comentarPublicacao(idPublicacao) {
    let inputComentario = document.getElementById("comentario_input_" + idPublicacao);
    let listaComentarios = document.getElementById("comentarios_post_" + idPublicacao);
    let totalComentarios = document.getElementById("comentarios_total_" + idPublicacao);

    if (inputComentario.value == "") {
        alert("Escreva um comentário antes de enviar.");
        return;
    }

    listaComentarios.innerHTML += `
        <div class="item-comentario">
            <strong>${sessionStorage.NOME_USUARIO}:</strong> ${inputComentario.value}
        </div>
    `;

    let textoAtual = totalComentarios.innerHTML;
    let numeroAtual = Number(textoAtual.split(" ")[0]);

    numeroAtual++;

    if (numeroAtual == 1) {
        totalComentarios.innerHTML = numeroAtual + " comentário";
    } else {
        totalComentarios.innerHTML = numeroAtual + " comentários";
    }

    inputComentario.value = "";
}

function salvarPublicacao(botao) {
    if (botao.innerHTML.trim() == "🔖 Salvar") {
        botao.innerHTML = "✅ Salvo";
    } else {
        botao.innerHTML = "🔖 Salvar";
    }
}

carregarDadosUsuario();
carregarPublicacoes();