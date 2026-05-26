// Controla se o usuário já possui um perfil cadastrado
let perfilExiste = false;


// Função que carrega os dados do usuário logado, busca o perfil no banco
// e depois chama as funções de conquista e histórico.
function carregarPerfil() {
    let idUsuario = sessionStorage.ID_USUARIO;
    let nomeUsuario = sessionStorage.NOME_USUARIO;

    if (idUsuario == undefined) {
        alert("Usuário não identificado. Faça login novamente.");
        window.location = "login.html";
        return;
    }

    nome_exibido.innerHTML = nomeUsuario;
    avatar_perfil.innerHTML = nomeUsuario[0];
    input_nome.value = nomeUsuario;

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
        .then(function (dados) {
            if (dados.length > 0) {
                perfilExiste = true;
                preencherPerfilExistente(dados[0]);
            } else {
                perfilExiste = false;
                preencherPerfilVazio();
            }

            carregarConquistaPerfil();
            carregarResumoConquistas();
            carregarHistoricoConquistas();
        })
        .catch(function (erro) {
            console.log(erro);
            alert("Houve um erro ao carregar o perfil.");
        });
}


// Preenche a tela com os dados do perfil que veio do banco.
function preencherPerfilExistente(perfil) {
    bio_exibida.innerHTML = perfil.bio;
    genero_exibido.innerHTML = perfil.generoFavorito;
    livro_exibido.innerHTML = perfil.livroFavorito;
    meta_exibida.innerHTML = perfil.metaMensal + " livros";

    select_genero.value = perfil.generoFavorito;
    input_livro.value = perfil.livroFavorito;
    input_meta.value = perfil.metaMensal;
    input_bio.value = perfil.bio;
}


// Preenche a tela quando o usuário ainda não cadastrou um perfil.
function preencherPerfilVazio() {
    bio_exibida.innerHTML = "Você ainda não cadastrou uma bio literária.";
    genero_exibido.innerHTML = "-";
    livro_exibido.innerHTML = "-";
    meta_exibida.innerHTML = "-";

    select_genero.value = "";
    input_livro.value = "";
    input_meta.value = "";
    input_bio.value = "";
}


// Valida os campos do formulário e analisa se vai cadastrar ou atualizar o perfil.
function salvarPerfil() {
    let idUsuario = sessionStorage.ID_USUARIO;
    let genero = select_genero.value;
    let livro = input_livro.value;
    let meta = input_meta.value;
    let bio = input_bio.value;

    if (idUsuario == undefined) {
        alert("Usuário não identificado. Faça login novamente.");
        window.location = "login.html";
        return;
    }

    if (!validarFormularioPerfil(genero, livro, meta, bio)) {
        return;
    }

    if (perfilExiste) {
        atualizarPerfil(idUsuario, bio, genero, livro, meta);
    } else {
        cadastrarPerfil(idUsuario, bio, genero, livro, meta);
    }
}


// Separa as validações do formulário para deixar a função salvarPerfil menor
function validarFormularioPerfil(genero, livro, meta, bio) {
    if (genero == "") {
        alert("Selecione seu gênero favorito.");
        return false;
    }

    if (livro == "") {
        alert("Digite seu livro favorito.");
        return false;
    }

    if (meta == "") {
        alert("Digite sua meta do mês.");
        return false;
    }

    if (meta <= 0) {
        alert("A meta do mês precisa ser maior que zero.");
        return false;
    }

    if (bio == "") {
        alert("Escreva uma bio literária.");
        return false;
    }

    return true;
}


// Cadastra um novo perfil no banco.
function cadastrarPerfil(idUsuario, bio, genero, livro, meta) {
    fetch("/perfis/cadastrar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            fkUsuarioServer: idUsuario,
            bioServer: bio,
            generoFavoritoServer: genero,
            livroFavoritoServer: livro,
            metaMensalServer: meta
        })
    })
        .then(function (resposta) {
            if (resposta.ok) {
                mensagem_sucesso.innerHTML = "Perfil cadastrado com sucesso!";
                perfilExiste = true;
                carregarPerfil();
            } else {
                alert("Erro ao cadastrar perfil.");
            }
        })
        .catch(function (erro) {
            console.log(erro);
            alert("Houve um erro ao cadastrar o perfil.");
        });
}


// Atualiza um perfil que já existe no banco.
function atualizarPerfil(idUsuario, bio, genero, livro, meta) {
    fetch("/perfis/atualizar", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            fkUsuarioServer: idUsuario,
            bioServer: bio,
            generoFavoritoServer: genero,
            livroFavoritoServer: livro,
            metaMensalServer: meta
        })
    })
        .then(function (resposta) {
            if (resposta.ok) {
                mensagem_sucesso.innerHTML = "Perfil atualizado com sucesso!";
                carregarPerfil();
            } else {
                alert("Erro ao atualizar perfil.");
            }
        })
        .catch(function (erro) {
            console.log(erro);
            alert("Houve um erro ao atualizar o perfil.");
        });
}


// Calcula o progresso atual da meta
function carregarConquistaPerfil() {
    let idUsuario = sessionStorage.ID_USUARIO;
    let meta = Number(input_meta.value);

    if (idUsuario == undefined) {
        return;
    }

    if (meta == 0 || input_meta.value == "") {
        atualizarConquistaPerfil(0, 0, 0);
        return;
    }

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
            let totalConcluidos = contarLeiturasConcluidas(leituras);
            let porcentagemMeta = calcularPorcentagemMeta(totalConcluidos, meta);

            atualizarConquistaPerfil(porcentagemMeta, meta, totalConcluidos);
        })
        .catch(function (erro) {
            console.log("Erro ao carregar conquista do perfil:", erro);
        });
}


// Percorre o vetor de leituras e conta quantas estão concluídas.
function contarLeiturasConcluidas(leituras) {
    let totalConcluidos = 0;

    for (let i = 0; i < leituras.length; i++) {
        if (leituras[i].statusLeitura == "Concluído") {
            totalConcluidos++;
        }
    }

    return totalConcluidos;
}


// Calcula o percentual da meta
function calcularPorcentagemMeta(totalConcluidos, meta) {
    let porcentagemMeta = 0;

    if (meta > 0) {
        porcentagemMeta = (totalConcluidos * 100) / meta;
    }

    return porcentagemMeta;
}


// Retorna os dados da medalha de acordo com o percentual da meta
function obterDadosMedalha(porcentagemMeta, meta, totalConcluidos) {
    let medalha = {
        emoji: "🔒",
        titulo: "Medalha bloqueada",
        descricao: "Você concluiu " + totalConcluidos + " de " + meta + " leituras. Continue lendo para desbloquear sua conquista."
    };

    if (meta == 0) {
        medalha.emoji = "🔒";
        medalha.titulo = "Sem meta cadastrada";
        medalha.descricao = "Cadastre uma meta mensal para acompanhar suas conquistas.";
    } else if (porcentagemMeta >= 150) {
        medalha.emoji = "🥇";
        medalha.titulo = "Guardiã das Histórias";
        medalha.descricao = "Você concluiu " + totalConcluidos + " de " + meta + " leituras e ultrapassou sua meta mensal.";
    } else if (porcentagemMeta >= 100) {
        medalha.emoji = "🥈";
        medalha.titulo = "Meta Concluída";
        medalha.descricao = "Você concluiu " + totalConcluidos + " de " + meta + " leituras e alcançou sua meta mensal.";
    } else if (porcentagemMeta >= 50) {
        medalha.emoji = "🥉";
        medalha.titulo = "Leitora em Jornada";
        medalha.descricao = "Você concluiu " + totalConcluidos + " de " + meta + " leituras e já passou da metade da sua meta.";
    }

    return medalha;
}


// Atualiza o card de progresso atual da meta no HTML.
function atualizarConquistaPerfil(porcentagemMeta, meta, totalConcluidos) {
    let medalha = obterDadosMedalha(porcentagemMeta, meta, totalConcluidos);

    medalha_perfil.innerHTML = medalha.emoji;
    titulo_medalha_perfil.innerHTML = medalha.titulo;
    descricao_medalha_perfil.innerHTML = medalha.descricao;
    progresso_medalha_perfil.innerHTML = porcentagemMeta.toFixed(0) + "%";
}


// Busca no banco o total de medalhas salvas por tipo.
function carregarResumoConquistas() {
    let idUsuario = sessionStorage.ID_USUARIO;

    fetch(`/conquistas/resumo/${idUsuario}`, {
        method: "GET"
    })
        .then(function (resposta) {
            if (resposta.ok) {
                return resposta.json();
            } else {
                throw "Erro ao buscar resumo de conquistas.";
            }
        })
        .then(function (resumo) {
            atualizarResumoConquistas(resumo);
        })
        .catch(function (erro) {
            console.log("Erro ao carregar resumo de conquistas:", erro);
        });
}


// Atualiza os cards de ouro, prata, bronze e pontuação.
function atualizarResumoConquistas(resumo) {
    let tiposMedalha = ["ouro", "prata", "bronze"];
    let quantidades = [0, 0, 0];

    for (let i = 0; i < resumo.length; i++) {
        for (let j = 0; j < tiposMedalha.length; j++) {
            if (resumo[i].tipoMedalha == tiposMedalha[j]) {
                quantidades[j] = Number(resumo[i].quantidade);
            }
        }
    }

    let ouro = quantidades[0];
    let prata = quantidades[1];
    let bronze = quantidades[2];

    let pontuacao = (ouro * 3) + (prata * 2) + bronze;

    total_ouro.innerHTML = ouro;
    total_prata.innerHTML = prata;
    total_bronze.innerHTML = bronze;
    pontuacao_pessoal.innerHTML = pontuacao;
}


// Busca no banco o histórico mensal de conquistas salvas.
function carregarHistoricoConquistas() {
    let idUsuario = sessionStorage.ID_USUARIO;

    fetch(`/conquistas/historico/${idUsuario}`, {
        method: "GET"
    })
        .then(function (resposta) {
            if (resposta.ok) {
                return resposta.json();
            } else {
                throw "Erro ao buscar histórico de conquistas.";
            }
        })
        .then(function (historico) {
            montarHistoricoConquistas(historico);
        })
        .catch(function (erro) {
            console.log("Erro ao carregar histórico de conquistas:", erro);
        });
}


// Monta a lista de conquistas salvas no histórico.
function montarHistoricoConquistas(historico) {
    lista_historico_conquistas.innerHTML = "";

    if (historico.length == 0) {
        lista_historico_conquistas.innerHTML = `
            <p>Você ainda não possui conquistas salvas no histórico.</p>
        `;
        return;
    }

    for (let i = 0; i < historico.length; i++) {
        let conquista = historico[i];
        let dadosMedalha = obterDadosMedalhaPorTipo(conquista.tipoMedalha);
        let nomeMes = obterNomeMes(conquista.mesReferencia);

        lista_historico_conquistas.innerHTML += `
            <div class="item-historico-conquista">
                <div>
                    <strong>${dadosMedalha.emoji} ${dadosMedalha.nome}</strong>
                    <p>${nomeMes}/${conquista.anoReferencia}</p>
                </div>

                <span>${Number(conquista.percentualMeta).toFixed(0)}%</span>
            </div>
        `;
    }
}


// Retorna o emoji e o nome da medalha com base no tipo salvo no banco.
function obterDadosMedalhaPorTipo(tipoMedalha) {
    let tipos = ["ouro", "prata", "bronze"];
    let emojis = ["🥇", "🥈", "🥉"];
    let nomes = ["Guardiã das Histórias", "Meta Concluída", "Leitora em Jornada"];

    for (let i = 0; i < tipos.length; i++) {
        if (tipoMedalha == tipos[i]) {
            return {
                emoji: emojis[i],
                nome: nomes[i]
            };
        }
    }

    return {
        emoji: "🔒",
        nome: "Medalha"
    };
}


// Retorna o nome do mês com base no número
function obterNomeMes(numeroMes) {
    let meses = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro"
    ];

    for (let i = 0; i < meses.length; i++) {
        if (numeroMes == i + 1) {
            return meses[i];
        }
    }

    return "Mês";
}



// Quando o arquivo JS carrega, ele já busca os dados do perfil.
carregarPerfil();