// Tipo de publicação escolhido pelo usuário.
// Essa variável começa vazia porque o usuário ainda não clicou em nenhum botão.
// Depois ela pode receber valores como: resenha, avaliacao, citacao, meta ou atualizacao.
let tipoPublicacaoSelecionado = "";

// Vetor que pode guardar livros carregados do banco.
// Neste arquivo atual ele ainda não está sendo usado diretamente,
// mas pode ser útil se depois você quiser relacionar uma publicação a um livro cadastrado.
let livrosInicio = [];

// Guarda a meta mensal do usuário.
// Esse valor vem da tabela Perfil e é usado para calcular a medalha exibida na página inicial.
let metaMensalInicio = 0;

// Guarda o id do usuário logado.
// Esse id foi salvo no sessionStorage depois que o login foi realizado com sucesso.
let idUsuario = sessionStorage.ID_USUARIO;


// Verifica se existe um usuário logado antes de permitir o uso da página.
function verificarUsuarioLogado() {

    // Se idUsuario estiver undefined, significa que não existe usuário na sessão.
    if (idUsuario == undefined) {
        alert("Usuário não identificado. Faça login novamente.");

        // Redireciona para o login para impedir acesso à área logada sem autenticação.
        window.location = "login.html";

        // Retorna false para avisar à função que chamou que ela deve parar.
        return false;
    }

    // Se chegou até aqui, existe um usuário logado.
    return true;
}


// Carrega os dados principais do usuário para montar o resumo da página inicial.
function carregarDadosUsuario() {

    // Antes de carregar qualquer dado, valida se o usuário está logado.
    // Se não estiver, o return interrompe a função.
    if (!verificarUsuarioLogado()) {
        return;
    }

    // Recupera o nome do usuário salvo na sessão após o login.
    let nomeUsuario = sessionStorage.NOME_USUARIO;

    // Atualiza os elementos do HTML com o nome e a inicial do usuário.
    titulo_boas_vindas.innerHTML = "Olá, " + nomeUsuario;
    nome_usuario_lateral.innerHTML = nomeUsuario;
    avatar_usuario.innerHTML = nomeUsuario[0];
    avatar_criar_publicacao.innerHTML = nomeUsuario[0];

    // Busca o perfil do usuário no banco.
    // Essa rota retorna bio, gênero favorito, livro favorito e meta mensal.
    fetch(`/perfis/listar/${idUsuario}`, {
        method: "GET"
    })

        // Primeiro then: verifica se a resposta do servidor deu certo.
        .then(function (resposta) {
            if (resposta.ok) {

                // Converte a resposta para JSON.
                return resposta.json();
            } else {

                // Se a resposta não estiver ok, joga para o catch.
                throw "Erro ao buscar perfil.";
            }
        })

        // Segundo then: recebe o perfil convertido em JSON.
        .then(function (perfil) {

            // Se encontrou perfil, preenche os dados reais do usuário.
            if (perfil.length > 0) {
                bio_usuario_lateral.innerHTML = perfil[0].bio;
                span_genero_favorito.innerHTML = perfil[0].generoFavorito;
                resumo_genero_favorito.innerHTML = perfil[0].generoFavorito;

                // Converte a meta mensal para número, pois ela será usada em cálculo.
                metaMensalInicio = Number(perfil[0].metaMensal);

                // Inicialmente mostra 0 livros concluídos de acordo com a meta cadastrada.
                // Depois essa informação será atualizada em carregarResumoLeituras().
                span_meta_mes.innerHTML = "0/" + perfil[0].metaMensal;
                resumo_meta_mes.innerHTML = "0/" + perfil[0].metaMensal;

            } else {

                // Se o usuário ainda não cadastrou perfil, mostra valores padrão.
                bio_usuario_lateral.innerHTML = "Perfil ainda não configurado.";
                span_genero_favorito.innerHTML = "-";
                resumo_genero_favorito.innerHTML = "-";

                // Meta 0 indica que ainda não existe meta mensal cadastrada.
                metaMensalInicio = 0;

                span_meta_mes.innerHTML = "0/0";
                resumo_meta_mes.innerHTML = "0/0";
            }

            // Depois de carregar o perfil, busca as leituras do usuário.
            // Essa chamada depende da meta mensal já ter sido carregada,
            // porque as leituras concluídas serão comparadas com a meta.
            carregarResumoLeituras();
        })

        // Se der erro ao carregar o perfil, ainda tenta carregar as leituras.
        .catch(function (erro) {
            console.log(erro);

            bio_usuario_lateral.innerHTML = "Erro ao carregar perfil.";

            // Mesmo com erro no perfil, chama o resumo de leituras
            // para não deixar a página inteira sem informação.
            carregarResumoLeituras();
        });
}


// Busca as leituras do usuário e calcula quantas estão concluídas.
function carregarResumoLeituras() {

    // Busca todas as leituras do usuário logado.
    fetch(`/leituras/usuario/${idUsuario}`, {
        method: "GET"
    })

        // Primeiro then: valida se a requisição deu certo.
        .then(function (resposta) {
            if (resposta.ok) {

                // Converte a resposta para JSON.
                // O resultado será um vetor de leituras.
                return resposta.json();
            } else {
                throw "Erro ao buscar leituras.";
            }
        })

        // Segundo then: recebe o vetor de leituras.
        .then(function (leituras) {

            // Chama uma função auxiliar para contar apenas leituras concluídas.
            // Isso separa a lógica de contagem da lógica de atualização da tela.
            let totalConcluidos = contarLeiturasConcluidas(leituras);

            // Atualiza os indicadores de livros lidos no card principal e no resumo lateral.
            span_livros_lidos.innerHTML = totalConcluidos;
            resumo_livros_lidos.innerHTML = totalConcluidos;

            // Atualiza o texto da meta, por exemplo: 3/5.
            atualizarTextoMeta(totalConcluidos);

            // Atualiza a medalha exibida no card de boas-vindas.
            // A medalha depende da relação entre livros concluídos e meta mensal.
            atualizarMedalhaBoasVindas(totalConcluidos);
        })

        // Se der erro ao buscar leituras, exibe valores padrão.
        .catch(function (erro) {
            console.log(erro);

            span_livros_lidos.innerHTML = "0";
            resumo_livros_lidos.innerHTML = "0";

            // Como não conseguiu carregar leituras, calcula medalha com 0 concluídos.
            atualizarMedalhaBoasVindas(0);
        });
}


// Percorre o vetor de leituras e retorna quantas foram concluídas.
function contarLeiturasConcluidas(leituras) {
    // Começa em 0 porque ainda não contamos nenhuma leitura.
    let totalConcluidos = 0;

    // Percorre todas as posições do vetor de leituras.
    for (let i = 0; i < leituras.length; i++) {

        // Verifica se a leitura atual está com status "Concluído".
        if (leituras[i].statusLeitura == "Concluído") {

            // Se estiver concluída, soma 1 ao contador.
            totalConcluidos++;
        }
    }

    // Retorna o total encontrado para a função que chamou.
    return totalConcluidos;
}


// Atualiza os textos de meta na tela inicial.
function atualizarTextoMeta(totalConcluidos) {

    // Pega o texto atual da meta.
    // Exemplo: "0/5".
    let metaAtual = span_meta_mes.innerHTML;

    // Divide o texto usando "/" como separador.
    // Exemplo: "0/5" vira ["0", "5"].
    let partesMeta = metaAtual.split("/");

    // Garante que o texto tinha o formato esperado: número/meta.
    if (partesMeta.length == 2) {

        // Mantém a meta original e troca apenas a quantidade de concluídos.
        // Exemplo: se totalConcluidos = 3 e partesMeta[1] = 5, vira "3/5".
        span_meta_mes.innerHTML = totalConcluidos + "/" + partesMeta[1];
        resumo_meta_mes.innerHTML = totalConcluidos + "/" + partesMeta[1];
    }
}


// Calcula e atualiza a medalha exibida no card de boas-vindas.
function atualizarMedalhaBoasVindas(totalConcluidos) {
    // Por padrão, a porcentagem começa em 0.
    let porcentagemMeta = 0;

    // Só calcula porcentagem se existir uma meta mensal maior que 0.
    // Isso evita divisão por zero.
    if (metaMensalInicio > 0) {
        porcentagemMeta = (totalConcluidos * 100) / metaMensalInicio;
    }

    // Se o usuário não cadastrou meta, mostra estado bloqueado por falta de meta.
    if (metaMensalInicio == 0) {
        span_medalha_mes.innerHTML = "🔒";
        span_titulo_medalha_mes.innerHTML = "sem meta";

    // 150% ou mais da meta libera a medalha de ouro.
    } else if (porcentagemMeta >= 150) {
        span_medalha_mes.innerHTML = "🥇";
        span_titulo_medalha_mes.innerHTML = "guardiã das histórias";

    // 100% ou mais libera a medalha de prata.
    } else if (porcentagemMeta >= 100) {
        span_medalha_mes.innerHTML = "🥈";
        span_titulo_medalha_mes.innerHTML = "meta concluída";

    // 50% ou mais libera a medalha de bronze.
    } else if (porcentagemMeta >= 50) {
        span_medalha_mes.innerHTML = "🥉";
        span_titulo_medalha_mes.innerHTML = "leitora em jornada";

    // Abaixo de 50%, a medalha continua bloqueada.
    } else {
        span_medalha_mes.innerHTML = "🔒";
        span_titulo_medalha_mes.innerHTML = "medalha bloqueada";
    }
}


// Limpa o estilo visual dos botões de tipo de publicação.
function limparBotoesTipoPublicacao() {

    // Coloca todos os botões em um vetor para facilitar o uso do for.
    let botoes = [
        botao_resenha,
        botao_avaliacao,
        botao_citacao,
        botao_meta
    ];

    // Percorre todos os botões e volta cada um para o estilo padrão.
    for (let i = 0; i < botoes.length; i++) {
        botoes[i].style.backgroundColor = "rgba(243, 235, 221, 0.04)";
        botoes[i].style.color = "#E8DCC8";
    }
}


// Marca visualmente o botão do tipo de publicação selecionado.
function selecionarTipoPublicacao(tipo) {

    // Guarda o tipo escolhido para ser usado depois na função publicar().
    tipoPublicacaoSelecionado = tipo;

    // Antes de destacar o botão escolhido, limpa o estilo de todos.
    // Assim, só um botão fica selecionado por vez.
    limparBotoesTipoPublicacao();

    // Verifica qual tipo foi escolhido e chama destacarBotaoTipo()
    // passando o botão correspondente.
    if (tipo == "resenha") {
        destacarBotaoTipo(botao_resenha);
    } else if (tipo == "avaliacao") {
        destacarBotaoTipo(botao_avaliacao);
    } else if (tipo == "citacao") {
        destacarBotaoTipo(botao_citacao);
    } else if (tipo == "meta") {
        destacarBotaoTipo(botao_meta);
    }
}


// Aplica o estilo visual de botão selecionado.
function destacarBotaoTipo(botao) {

    // Altera a cor de fundo e a cor do texto do botão recebido como parâmetro.
    botao.style.backgroundColor = "#B08A57";
    botao.style.color = "#1E1A17";
}


// Cria uma nova publicação no feed.
function publicar() {

    // Garante que só usuários logados consigam publicar.
    if (!verificarUsuarioLogado()) {
        return;
    }

    // Pega o texto digitado no textarea.
    let textoPublicacao = input_post.value;

    // Pega o texto digitado no campo de livro relacionado.
    // No código atual, esse valor é juntado ao texto da publicação.
    let livroRelacionado = input_livro.value;

    // Valida se o usuário escreveu algo.
    if (textoPublicacao == "") {
        alert("Escreva algo antes de publicar.");
        return;
    }

    // Se o usuário não escolheu um tipo, define como atualização.
    // Isso evita enviar tipo vazio para o banco.
    if (tipoPublicacaoSelecionado == "") {
        tipoPublicacaoSelecionado = "atualizacao";
    }

    // Monta o texto final da publicação.
    // Se houver livro relacionado, ele é concatenado ao texto principal.
    let textoFinal = montarTextoPublicacao(textoPublicacao, livroRelacionado);

    // Envia a publicação para o back-end.
    fetch("/publicacoes/cadastrar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },

        // O body envia os dados necessários para cadastrar a publicação.
        body: JSON.stringify({
            fkUsuarioServer: idUsuario,

            // Neste momento, o livro não está vinculado pelo id no banco,
            // por isso fkLivroServer vai vazio.
            fkLivroServer: "",

            tipoPublicacaoServer: tipoPublicacaoSelecionado,
            textoServer: textoFinal
        })
    })

        // Verifica se o cadastro deu certo.
        .then(function (resposta) {
            if (resposta.ok) {
                mensagem_publicacao.innerHTML = "Publicação criada com sucesso!";

                // Limpa os campos após publicar.
                input_post.value = "";
                input_livro.value = "";

                // Reseta o tipo selecionado.
                tipoPublicacaoSelecionado = "";

                // Volta os botões para o estado padrão.
                limparBotoesTipoPublicacao();

                // Recarrega o feed para mostrar a nova publicação.
                carregarPublicacoes();

            } else {
                alert("Erro ao criar publicação.");
            }
        })

        // Se algo falhar na requisição, mostra erro.
        .catch(function (erro) {
            console.log(erro);
            alert("Houve um erro ao publicar.");
        });
}


// Junta o texto da publicação com o livro relacionado, se o usuário preencher esse campo.
function montarTextoPublicacao(textoPublicacao, livroRelacionado) {

    // Se o usuário escreveu um livro relacionado, adiciona ao final do texto.
    if (livroRelacionado != "") {
        return textoPublicacao + " | " + livroRelacionado;
    } else {

        // Se não escreveu livro, retorna só o texto da publicação.
        return textoPublicacao;
    }
}


// Retorna o texto que aparece abaixo do nome do usuário na publicação.
function obterTextoTipoPublicacao(tipoPublicacao) {

    // Vetor com os tipos que podem vir do banco.
    let tipos = [
        "resenha",
        "avaliacao",
        "citacao",
        "meta"
    ];

    // Vetor com o texto correspondente a cada tipo.
    let textos = [
        "publicou uma resenha",
        "publicou uma avaliação",
        "compartilhou uma citação",
        "atualizou uma meta de leitura"
    ];

    // Percorre os tipos para encontrar o texto correto.
    for (let i = 0; i < tipos.length; i++) {

        // Se o tipo recebido for igual ao tipo da posição atual,
        // retorna o texto da mesma posição.
        if (tipoPublicacao == tipos[i]) {
            return textos[i];
        }
    }

    // Se não encontrar tipo conhecido, trata como atualização genérica.
    return "publicou uma atualização";
}


// Carrega todas as publicações do banco e monta o feed.
function carregarPublicacoes() {

    // Busca todas as publicações pela rota /publicacoes.
    fetch("/publicacoes", {
        method: "GET"
    })

        // Valida a resposta do back-end.
        .then(function (resposta) {
            if (resposta.ok) {
                return resposta.json();
            } else {
                throw "Erro ao buscar publicações.";
            }
        })

        // Recebe o vetor de publicações.
        .then(function (publicacoes) {

            // Limpa o feed antes de montar novamente.
            // Isso evita duplicar publicações quando recarregar.
            feed_posts.innerHTML = "";

            // Se não houver publicações, mostra uma mensagem padrão.
            if (publicacoes.length == 0) {
                feed_posts.innerHTML = `
                    <div class="caixa-social cartao-publicacao">
                        <p>Nenhuma publicação ainda. Seja a primeira pessoa a compartilhar uma leitura!</p>
                    </div>
                `;
                return;
            }

            // Percorre todas as publicações retornadas pelo banco.
            for (let i = 0; i < publicacoes.length; i++) {
                let publicacao = publicacoes[i];

                // Monta o HTML da publicação e adiciona ao feed.
                feed_posts.innerHTML += montarCardPublicacao(publicacao);

                // Depois de criar o card, carrega a quantidade de curtidas daquela publicação.
                carregarCurtidasPublicacao(publicacao.idPublicacao);

                // Depois de criar o card, carrega os comentários daquela publicação.
                carregarComentariosPublicacao(publicacao.idPublicacao);

                // Verifica se o usuário logado já curtiu essa publicação.
                // Isso atualiza o botão para "Curtido" quando necessário.
                verificarCurtidaUsuario(publicacao.idPublicacao);
            }
        })

        // Se houver erro, mostra uma mensagem no lugar do feed.
        .catch(function (erro) {
            console.log(erro);

            feed_posts.innerHTML = `
                <div class="caixa-social cartao-publicacao">
                    <p>Erro ao carregar publicações.</p>
                </div>
            `;
        });
}


// Monta o HTML de uma publicação do feed.
function montarCardPublicacao(publicacao) {

    // Converte o tipo da publicação em um texto mais amigável.
    let tipoTexto = obterTextoTipoPublicacao(publicacao.tipoPublicacao);

    // Pega a primeira letra do nome para montar o avatar.
    let inicialUsuario = publicacao.nome[0];

    // Começa vazio porque nem toda publicação tem livro ligado pelo banco.
    let blocoLivro = "";

    // Se a publicação tiver um título de livro vindo do banco,
    // monta um bloco visual para mostrar esse livro.
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

    // Monta a estrutura completa do card.
    // Os ids dinâmicos usam idPublicacao para cada card ter elementos únicos.
    let cardPublicacao = `
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

    // Retorna o HTML montado para ser inserido no feed.
    return cardPublicacao;
}


// Carrega a quantidade de curtidas de uma publicação.
function carregarCurtidasPublicacao(idPublicacao) {

    // Busca o total de curtidas usando o id da publicação na URL.
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

            // Busca o span específico daquela publicação.
            let spanCurtidas = document.getElementById("curtidas_post_" + idPublicacao);

            // Se por algum motivo o elemento não existir, interrompe a função.
            if (spanCurtidas == null) {
                return;
            }

            // Começa com 0 curtidas por segurança.
            let totalCurtidas = 0;

            // Se o back-end retornou algum resultado, pega o total.
            if (dados.length > 0) {
                totalCurtidas = dados[0].totalCurtidas;
            }

            // Ajusta singular/plural do texto.
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


// Verifica se o usuário já curtiu uma publicação.
function verificarCurtidaUsuario(idPublicacao) {

    // Se não houver usuário, não há como verificar curtida.
    if (idUsuario == undefined) {
        return;
    }

    // Envia idPublicacao e idUsuario pela URL.
    // O back-end retorna { curtido: true } ou { curtido: false }.
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

            // Busca o botão de curtir daquela publicação.
            let botaoCurtir = document.getElementById("botao_curtir_" + idPublicacao);

            if (botaoCurtir == null) {
                return;
            }

            // Se o usuário já curtiu, mostra o botão como curtido.
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


// Decide se a ação será curtir ou descurtir.
function curtirOuDescurtirPublicacao(idPublicacao, botao) {

    // Garante que só usuário logado possa interagir.
    if (!verificarUsuarioLogado()) {
        return;
    }

    // Verifica o texto atual do botão.
    // Se estiver "Curtido", o próximo clique deve remover a curtida.
    let estaCurtido = botao.innerHTML.trim() == "❤️ Curtido";

    if (estaCurtido) {

        // Se já está curtido, chama a função que remove a curtida.
        descurtirPublicacao(idPublicacao, botao);

    } else {

        // Se ainda não está curtido, chama a função que adiciona a curtida.
        curtirPublicacao(idPublicacao, botao);
    }
}


// Envia uma curtida para o banco.
function curtirPublicacao(idPublicacao, botao) {

    // Requisição POST porque estamos criando um registro na tabela Curtida.
    fetch("/curtidas/curtir", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },

        // Envia o usuário logado e a publicação curtida no body da requisição.
        body: JSON.stringify({
            fkUsuarioServer: idUsuario,
            fkPublicacaoServer: idPublicacao
        })
    })
        .then(function (resposta) {
            if (resposta.ok) {

                // Atualiza o botão visualmente.
                botao.innerHTML = "❤️ Curtido";

                // Atualiza o contador de curtidas na tela.
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


// Remove a curtida do usuário.
function descurtirPublicacao(idPublicacao, botao) {

    // Requisição DELETE porque estamos removendo um registro da tabela Curtida.
    fetch("/curtidas/descurtir", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },

        // Envia o usuário e a publicação para o back-end saber qual curtida remover.
        body: JSON.stringify({
            fkUsuarioServer: idUsuario,
            fkPublicacaoServer: idPublicacao
        })
    })
        .then(function (resposta) {
            if (resposta.ok) {

                // Volta o botão para o estado de não curtido.
                botao.innerHTML = "♡ Curtir";

                // Atualiza o contador de curtidas.
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


// Mostra ou esconde a área de comentário de uma publicação.
function mostrarComentario(idPublicacao) {

    // Busca a área de comentário específica da publicação.
    let areaComentario = document.getElementById("comentario_area_" + idPublicacao);

    // Se já está visível, esconde.
    if (areaComentario.style.display == "flex") {
        areaComentario.style.display = "none";

    // Se está escondida, mostra usando display flex.
    } else {
        areaComentario.style.display = "flex";
    }
}


// Envia um comentário para o banco.
function comentarPublicacao(idPublicacao) {

    // Garante que só usuário logado possa comentar.
    if (!verificarUsuarioLogado()) {
        return;
    }

    // Busca o input específico daquela publicação.
    let inputComentario = document.getElementById("comentario_input_" + idPublicacao);

    // Pega o texto digitado pelo usuário.
    let textoComentario = inputComentario.value;

    // Valida se o comentário está vazio.
    if (textoComentario == "") {
        alert("Escreva um comentário antes de enviar.");
        return;
    }

    // Envia o comentário para o back-end.
    fetch("/comentarios/cadastrar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },

        // Envia usuário, publicação e texto do comentário no body.
        body: JSON.stringify({
            fkUsuarioServer: idUsuario,
            fkPublicacaoServer: idPublicacao,
            textoServer: textoComentario
        })
    })
        .then(function (resposta) {
            if (resposta.ok) {

                // Limpa o campo depois de comentar.
                inputComentario.value = "";

                // Recarrega os comentários daquela publicação para mostrar o novo comentário.
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


// Carrega os comentários de uma publicação.
function carregarComentariosPublicacao(idPublicacao) {

    // Busca os comentários usando o id da publicação na URL.
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

            // Busca a div onde os comentários serão exibidos.
            let listaComentarios = document.getElementById("comentarios_post_" + idPublicacao);

            // Busca o span que mostra a quantidade de comentários.
            let totalComentarios = document.getElementById("comentarios_total_" + idPublicacao);

            // Se algum elemento não existir, interrompe a função.
            if (listaComentarios == null || totalComentarios == null) {
                return;
            }

            // Limpa a lista antes de montar novamente.
            listaComentarios.innerHTML = "";

            // Atualiza o contador com singular ou plural.
            if (comentarios.length == 1) {
                totalComentarios.innerHTML = "1 comentário";
            } else {
                totalComentarios.innerHTML = comentarios.length + " comentários";
            }

            // Percorre todos os comentários retornados pelo banco.
            for (let i = 0; i < comentarios.length; i++) {
                let comentario = comentarios[i];

                // Adiciona cada comentário na área da publicação correspondente.
                listaComentarios.innerHTML += `
                    <div class="item-comentario">
                        <strong>${comentario.nome}:</strong> ${comentario.texto}
                    </div>
                `;
            }
        })
        .catch(function (erro) {
            console.log("Erro ao carregar comentários:", erro);
        });
}


// Chamadas iniciais do arquivo.
// Quando a página carrega, primeiro monta o resumo do usuário.
carregarDadosUsuario();

// Depois carrega o feed com todas as publicações.
carregarPublicacoes();