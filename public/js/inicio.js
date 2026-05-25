let tipoPublicacaoSelecionado = "";
let livrosInicio = [];
let metaMensalInicio = 0;
let idUsuario = sessionStorage.ID_USUARIO;

function verificarUsuarioLogado() {

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

                metaMensalInicio = Number(perfil[0].metaMensal);

                span_meta_mes.innerHTML = "0/" + perfil[0].metaMensal;
                resumo_meta_mes.innerHTML = "0/" + perfil[0].metaMensal;
            } else {
                bio_usuario_lateral.innerHTML = "Perfil ainda não configurado.";
                span_genero_favorito.innerHTML = "-";
                resumo_genero_favorito.innerHTML = "-";

                metaMensalInicio = 0;

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

            atualizarMedalhaBoasVindas(totalConcluidos);
        })
        .catch(function (erro) {
            console.log(erro);

            span_livros_lidos.innerHTML = "0";
            resumo_livros_lidos.innerHTML = "0";

            atualizarMedalhaBoasVindas(0);
        });
}

function atualizarMedalhaBoasVindas(totalConcluidos) {
    let porcentagemMeta = 0;

    if (metaMensalInicio > 0) {
        porcentagemMeta = (totalConcluidos * 100) / metaMensalInicio;
    }

    if (metaMensalInicio == 0) {
        span_medalha_mes.innerHTML = "🔒";
        span_titulo_medalha_mes.innerHTML = "sem meta";
    } else if (porcentagemMeta >= 150) {
        span_medalha_mes.innerHTML = "🥇";
        span_titulo_medalha_mes.innerHTML = "guardiã das histórias";
    } else if (porcentagemMeta >= 100) {
        span_medalha_mes.innerHTML = "🥈";
        span_titulo_medalha_mes.innerHTML = "meta concluída";
    } else if (porcentagemMeta >= 50) {
        span_medalha_mes.innerHTML = "🥉";
        span_titulo_medalha_mes.innerHTML = "leitora em jornada";
    } else {
        span_medalha_mes.innerHTML = "🔒";
        span_titulo_medalha_mes.innerHTML = "medalha bloqueada";
    }
}

function carregarLivrosInicio() {
    fetch("/livros", {
        method: "GET"
    })
        .then(function (resposta) {
            if (resposta.ok) {
                return resposta.json();
            } else {
                throw "Erro ao buscar livros.";
            }
        })
        .then(function (livros) {
            livrosInicio = livros;
        })
        .catch(function (erro) {
            console.log("Erro ao carregar livros para busca:", erro);
        });
}

function buscarLivrosInicio() {
    let busca = input_busca_inicio.value.toLowerCase().trim();

    if (busca == "") {
        carregarPublicacoes();
        return;
    }

    let livrosEncontrados = [];

    for (let i = 0; i < livrosInicio.length; i++) {
        let titulo = livrosInicio[i].titulo.toLowerCase();
        let autor = livrosInicio[i].autor.toLowerCase();
        let genero = livrosInicio[i].genero.toLowerCase();

        if (
            titulo.indexOf(busca) >= 0 ||
            autor.indexOf(busca) >= 0 ||
            genero.indexOf(busca) >= 0
        ) {
            livrosEncontrados.push(livrosInicio[i]);
        }
    }

    if (livrosEncontrados.length == 0) {
        feed_posts.innerHTML = `
            <div class="caixa-social cartao-publicacao resultado-busca-feed">
                <h3>Resultado da busca</h3>
                <p>Nenhum livro registrado foi encontrado para "${input_busca_inicio.value}".</p>
            </div>
        `;
        return;
    }

    let cardsLivros = "";

    for (let i = 0; i < livrosEncontrados.length; i++) {
        let livro = livrosEncontrados[i];

        let notaMedia = livro.notaMedia;

        if (notaMedia == null) {
            notaMedia = "Sem nota";
        }

        let totalLeitores = Number(livro.totalLeitores) || 0;
        let totalConcluidos = Number(livro.totalConcluidos) || 0;

        cardsLivros += `
            <div class="cartao-livro-busca">
                <h4>${livro.titulo}</h4>
                <p><strong>Autor:</strong> ${livro.autor}</p>

                <div class="info-livro-busca">
                    <span class="etiqueta-livro-busca">${livro.genero}</span>
                    <span>⭐ Nota média: ${notaMedia}</span>
                    <span>👥 ${totalLeitores} leitor(es)</span>
                    <span>📚 ${totalConcluidos} concluído(s)</span>
                </div>
            </div>
        `;
    }

    feed_posts.innerHTML = `
        <div class="caixa-social resultado-busca-feed">
            <h3>Resultado da busca</h3>
            <p>
                Encontramos ${livrosEncontrados.length} livro(s) registrado(s) para "${input_busca_inicio.value}".
            </p>

            <div class="lista-livros-busca">
                ${cardsLivros}
            </div>
        </div>
    `;
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
        textoFinal = textoPublicacao + " | " + livroRelacionado;
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
                            <button 
                                id="botao_curtir_${publicacao.idPublicacao}"
                                type="button" 
                                onclick="curtirOuDescurtirPublicacao(${publicacao.idPublicacao}, this)">
                                ♡ Curtir
                            </button>

                            <button type="button" onclick="mostrarComentario(${publicacao.idPublicacao})">
                                💬 Comentar
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

                carregarCurtidasPublicacao(publicacao.idPublicacao);
                carregarComentariosPublicacao(publicacao.idPublicacao);
                verificarCurtidaUsuario(publicacao.idPublicacao);
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

function carregarCurtidasPublicacao(idPublicacao) {
    fetch(`/curtidas/publicacao/${idPublicacao}`, {
        method: "GET"
    })
        .then(function (resposta) {
            if (resposta.ok) {
                return resposta.json();
            } else {
                throw "Erro ao buscar curtidas.";
            }
        })
        .then(function (dados) {
            let spanCurtidas = document.getElementById("curtidas_post_" + idPublicacao);

            if (spanCurtidas == null) {
                return;
            }

            let totalCurtidas = 0;

            if (Array.isArray(dados)) {
                if (dados.length > 0) {
                    totalCurtidas = dados[0].totalCurtidas || dados[0].total || dados[0].quantidade || 0;
                }
            } else {
                totalCurtidas = dados.totalCurtidas || dados.total || dados.quantidade || 0;
            }

            if (totalCurtidas == 1) {
                spanCurtidas.innerHTML = "1 curtida";
            } else {
                spanCurtidas.innerHTML = totalCurtidas + " curtidas";
            }
        })
        .catch(function (erro) {
            console.log("Erro ao carregar curtidas:", erro);
        });
}

function verificarCurtidaUsuario(idPublicacao) {
    
    if (idUsuario == undefined) {
        return;
    }

    fetch(`/curtidas/verificar/${idPublicacao}/${idUsuario}`, {
        method: "GET"
    })
        .then(function (resposta) {
            if (resposta.ok) {
                return resposta.json();
            } else {
                throw "Erro ao verificar curtida.";
            }
        })
        .then(function (dados) {
            let botaoCurtir = document.getElementById("botao_curtir_" + idPublicacao);

            if (botaoCurtir == null) {
                return;
            }

            if (dados.curtido) {
                botaoCurtir.innerHTML = "❤️ Curtido";
            } else {
                botaoCurtir.innerHTML = "♡ Curtir";
            }
        })
        .catch(function (erro) {
            console.log("Erro ao verificar curtida:", erro);
        });
}

function curtirOuDescurtirPublicacao(idPublicacao, botao) {
    if (!verificarUsuarioLogado()) {
        return;
    }

    let estaCurtido = botao.innerHTML.trim() == "❤️ Curtido";

    if (estaCurtido) {
        descurtirPublicacao(idPublicacao, botao);
    } else {
        curtirPublicacao(idPublicacao, botao);
    }
}

function curtirPublicacao(idPublicacao, botao) {
    
    fetch("/curtidas/curtir", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            fkUsuarioServer: idUsuario,
            fkPublicacaoServer: idPublicacao
        })
    })
        .then(function (resposta) {
            if (resposta.ok) {
                botao.innerHTML = "❤️ Curtido";
                carregarCurtidasPublicacao(idPublicacao);
            } else {
                alert("Erro ao curtir publicação.");
            }
        })
        .catch(function (erro) {
            console.log("Erro ao curtir publicação:", erro);
            alert("Houve um erro ao curtir a publicação.");
        });
}

function descurtirPublicacao(idPublicacao, botao) {
    
    fetch("/curtidas/descurtir", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            fkUsuarioServer: idUsuario,
            fkPublicacaoServer: idPublicacao
        })
    })
        .then(function (resposta) {
            if (resposta.ok) {
                botao.innerHTML = "♡ Curtir";
                carregarCurtidasPublicacao(idPublicacao);
            } else {
                alert("Erro ao remover curtida.");
            }
        })
        .catch(function (erro) {
            console.log("Erro ao descurtir publicação:", erro);
            alert("Houve um erro ao remover a curtida.");
        });
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
    if (!verificarUsuarioLogado()) {
        return;
    }

    let inputComentario = document.getElementById("comentario_input_" + idPublicacao);
    let textoComentario = inputComentario.value;

    if (textoComentario == "") {
        alert("Escreva um comentário antes de enviar.");
        return;
    }

    fetch("/comentarios/cadastrar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            fkUsuarioServer: idUsuario,
            fkPublicacaoServer: idPublicacao,
            textoServer: textoComentario
        })
    })
        .then(function (resposta) {
            if (resposta.ok) {
                inputComentario.value = "";
                carregarComentariosPublicacao(idPublicacao);
            } else {
                alert("Erro ao enviar comentário.");
            }
        })
        .catch(function (erro) {
            console.log("Erro ao comentar publicação:", erro);
            alert("Houve um erro ao enviar o comentário.");
        });
}

function carregarComentariosPublicacao(idPublicacao) {
    fetch(`/comentarios/publicacao/${idPublicacao}`, {
        method: "GET"
    })
        .then(function (resposta) {
            if (resposta.ok) {
                return resposta.json();
            } else {
                throw "Erro ao buscar comentários.";
            }
        })
        .then(function (comentarios) {
            let listaComentarios = document.getElementById("comentarios_post_" + idPublicacao);
            let totalComentarios = document.getElementById("comentarios_total_" + idPublicacao);

            if (listaComentarios == null || totalComentarios == null) {
                return;
            }

            listaComentarios.innerHTML = "";

            if (comentarios.length == 1) {
                totalComentarios.innerHTML = "1 comentário";
            } else {
                totalComentarios.innerHTML = comentarios.length + " comentários";
            }

            for (let i = 0; i < comentarios.length; i++) {
                let comentario = comentarios[i];

                let nomeComentario = comentario.nome || comentario.nomeUsuario || "Usuário";
                let textoComentario = comentario.texto || comentario.comentario || comentario.textoComentario || "";

                listaComentarios.innerHTML += `
                    <div class="item-comentario">
                        <strong>${nomeComentario}:</strong> ${textoComentario}
                    </div>
                `;
            }
        })
        .catch(function (erro) {
            console.log("Erro ao carregar comentários:", erro);
        });
}


carregarDadosUsuario();
carregarPublicacoes();
carregarLivrosInicio();