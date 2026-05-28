// Controla se o usuário já possui um perfil cadastrado no banco.
// Começa como false porque só vamos saber depois de buscar o perfil pela rota /perfis/listar/:fkUsuario.
let perfilExiste = false;


// Função principal da página Perfil.
// Ela carrega os dados do usuário logado, busca o perfil no banco
// e depois chama as funções responsáveis por conquistas e histórico.
function carregarPerfil() {
    // Recupera o id e o nome do usuário salvos na sessão depois do login.
    let idUsuario = sessionStorage.ID_USUARIO;
    let nomeUsuario = sessionStorage.NOME_USUARIO;

    // Se não existir idUsuario, significa que a pessoa não está logada
    // ou perdeu a sessão. Nesse caso, ela volta para a tela de login.
    if (idUsuario == undefined) {
        alert("Usuário não identificado. Faça login novamente.");
        window.location = "login.html";
        return;
    }

    // Preenche informações básicas que já estão no sessionStorage.
    // Esses dados não precisam de fetch porque vieram do login.
    nome_exibido.innerHTML = nomeUsuario;
    avatar_perfil.innerHTML = nomeUsuario[0];
    input_nome.value = nomeUsuario;

    // Busca no banco se esse usuário já tem um perfil cadastrado.
    fetch(`/perfis/listar/${idUsuario}`, {
        method: "GET"
    })
        // Primeiro then: verifica se a resposta da API deu certo.
        .then(function (resposta) {
            if (resposta.ok) {
                // Converte a resposta para JSON.
                // O resultado será um vetor com 0 ou 1 perfil.
                return resposta.json();
            } else {
                // Se der erro, joga para o catch.
                throw "Erro ao buscar perfil.";
            }
        })

        // Segundo then: recebe os dados do perfil já convertidos.
        .then(function (dados) {

            // Se o vetor tem dados, significa que o perfil já existe.
            if (dados.length > 0) {
                perfilExiste = true;

                // Preenche a tela e o formulário com os dados vindos do banco.
                preencherPerfilExistente(dados[0]);

            } else {
                // Se o vetor veio vazio, o usuário ainda não cadastrou perfil.
                perfilExiste = false;

                // Preenche a tela com valores padrão.
                preencherPerfilVazio();
            }

            // Depois de tratar o perfil, carrega o progresso atual da meta.
            // Essa chamada depende da meta mensal, que foi preenchida no input_meta.
            carregarConquistaPerfil();

            // Carrega o resumo de medalhas salvas: ouro, prata, bronze e pontuação.
            carregarResumoConquistas();

            // Carrega a lista mensal de conquistas salvas no banco.
            carregarHistoricoConquistas();
        })

        // Se der erro ao buscar o perfil, mostra alerta e registra o erro no console.
        .catch(function (erro) {
            console.log(erro);
            alert("Houve um erro ao carregar o perfil.");
        });
}


// Preenche a tela com os dados do perfil que veio do banco.
function preencherPerfilExistente(perfil) {
    // Atualiza o card principal do perfil.
    bio_exibida.innerHTML = perfil.bio;
    genero_exibido.innerHTML = perfil.generoFavorito;
    livro_exibido.innerHTML = perfil.livroFavorito;
    meta_exibida.innerHTML = perfil.metaMensal + " livros";

    // Atualiza também os campos do formulário,
    // permitindo que o usuário veja e edite os próprios dados.
    select_genero.value = perfil.generoFavorito;
    input_livro.value = perfil.livroFavorito;
    input_meta.value = perfil.metaMensal;
    input_bio.value = perfil.bio;
}


// Preenche a tela quando o usuário ainda não cadastrou um perfil.
function preencherPerfilVazio() {
    // Textos padrão exibidos no card principal.
    bio_exibida.innerHTML = "Você ainda não cadastrou uma bio literária.";
    genero_exibido.innerHTML = "-";
    livro_exibido.innerHTML = "-";
    meta_exibida.innerHTML = "-";

    // Limpa o formulário para o primeiro cadastro.
    select_genero.value = "";
    input_livro.value = "";
    input_meta.value = "";
    input_bio.value = "";
}


// Função chamada quando o usuário clica em "Salvar perfil".
// Ela valida os campos e decide se deve cadastrar um perfil novo ou atualizar um existente.
function salvarPerfil() {
    // Recupera o id do usuário logado.
    let idUsuario = sessionStorage.ID_USUARIO;

    // Pega os valores digitados/selecionados no formulário.
    let genero = select_genero.value;
    let livro = input_livro.value;
    let meta = input_meta.value;
    let bio = input_bio.value;

    // Validação de segurança para impedir salvar sem usuário logado.
    if (idUsuario == undefined) {
        alert("Usuário não identificado. Faça login novamente.");
        window.location = "login.html";
        return;
    }

    // Chama a função de validação do formulário.
    // Se retornar false, interrompe o salvamento.
    if (!validarFormularioPerfil(genero, livro, meta, bio)) {
        return;
    }

    // Se o perfil já existe, usa PUT para atualizar.
    if (perfilExiste) {
        atualizarPerfil(idUsuario, bio, genero, livro, meta);

    // Se ainda não existe, usa POST para cadastrar.
    } else {
        cadastrarPerfil(idUsuario, bio, genero, livro, meta);
    }
}


// Separa as validações do formulário para deixar salvarPerfil menor e mais fácil de explicar.
function validarFormularioPerfil(genero, livro, meta, bio) {
    // Verifica se o usuário selecionou um gênero favorito.
    if (genero == "") {
        alert("Selecione seu gênero favorito.");
        return false;
    }

    // Verifica se o usuário digitou um livro favorito.
    if (livro == "") {
        alert("Digite seu livro favorito.");
        return false;
    }

    // Verifica se a meta foi preenchida.
    if (meta == "") {
        alert("Digite sua meta do mês.");
        return false;
    }

    // Garante que a meta seja maior que zero.
    // Isso evita cálculo de progresso com meta zerada.
    if (meta <= 0) {
        alert("A meta do mês precisa ser maior que zero.");
        return false;
    }

    // Verifica se a bio foi preenchida.
    if (bio == "") {
        alert("Escreva uma bio literária.");
        return false;
    }

    // Se passou por todas as validações, o formulário é válido.
    return true;
}


// Cadastra um novo perfil no banco.
// Essa função é usada quando perfilExiste ainda é false.
function cadastrarPerfil(idUsuario, bio, genero, livro, meta) {
    fetch("/perfis/cadastrar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },

        // Envia os dados do formulário no body da requisição.
        // Os nomes com "Server" são os nomes esperados pelo controller.
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

                // Depois de cadastrar, marca que o perfil agora existe.
                perfilExiste = true;

                // Recarrega o perfil para atualizar o card principal,
                // o formulário, o progresso e as conquistas.
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
// Essa função é usada quando perfilExiste é true.
function atualizarPerfil(idUsuario, bio, genero, livro, meta) {
    fetch("/perfis/atualizar", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },

        // Envia os novos dados para o controller atualizar no banco.
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

                // Recarrega os dados para refletir as alterações na tela.
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


// Calcula o progresso atual da meta.
// Esse progresso é calculado em tempo real a partir das leituras concluídas.
function carregarConquistaPerfil() {
    let idUsuario = sessionStorage.ID_USUARIO;

    // A meta vem do input porque ele já foi preenchido pelo perfil carregado.
    let meta = Number(input_meta.value);

    // Se não houver usuário, interrompe.
    if (idUsuario == undefined) {
        return;
    }

    // Se não houver meta cadastrada, mostra progresso 0 e estado sem medalha.
    if (meta == 0 || input_meta.value == "") {
        atualizarConquistaPerfil(0, 0, 0);
        return;
    }

    // Busca todas as leituras do usuário.
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
            // Conta apenas as leituras com status "Concluído".
            let totalConcluidos = contarLeiturasConcluidas(leituras);

            // Calcula a porcentagem da meta atingida.
            let porcentagemMeta = calcularPorcentagemMeta(totalConcluidos, meta);

            // Atualiza o card de medalha atual no HTML.
            atualizarConquistaPerfil(porcentagemMeta, meta, totalConcluidos);
        })
        .catch(function (erro) {
            console.log("Erro ao carregar conquista do perfil:", erro);
        });
}


// Percorre o vetor de leituras e conta quantas estão concluídas.
function contarLeiturasConcluidas(leituras) {
    let totalConcluidos = 0;

    // Percorre cada leitura retornada pelo banco.
    for (let i = 0; i < leituras.length; i++) {

        // Só soma quando o status da leitura é "Concluído".
        if (leituras[i].statusLeitura == "Concluído") {
            totalConcluidos++;
        }
    }

    return totalConcluidos;
}


// Calcula o percentual da meta.
// Exemplo: 3 livros concluídos e meta 6 = 50%.
function calcularPorcentagemMeta(totalConcluidos, meta) {
    let porcentagemMeta = 0;

    // Só calcula se a meta for maior que zero para evitar divisão por zero.
    if (meta > 0) {
        porcentagemMeta = (totalConcluidos * 100) / meta;
    }

    return porcentagemMeta;
}


// Retorna os dados da medalha de acordo com o percentual da meta.
// Em vez de atualizar o HTML aqui, essa função só monta um objeto com emoji, título e descrição.
function obterDadosMedalha(porcentagemMeta, meta, totalConcluidos) {
    // Objeto padrão: começa como medalha bloqueada.
    let medalha = {
        emoji: "🔒",
        titulo: "Medalha bloqueada",
        descricao: "Você concluiu " + totalConcluidos + " de " + meta + " leituras. Continue lendo para desbloquear sua conquista."
    };

    // Sem meta cadastrada.
    if (meta == 0) {
        medalha.emoji = "🔒";
        medalha.titulo = "Sem meta cadastrada";
        medalha.descricao = "Cadastre uma meta mensal para acompanhar suas conquistas.";

    // 150% ou mais da meta: ouro.
    } else if (porcentagemMeta >= 150) {
        medalha.emoji = "🥇";
        medalha.titulo = "Guardiã das Histórias";
        medalha.descricao = "Você concluiu " + totalConcluidos + " de " + meta + " leituras e ultrapassou sua meta mensal.";

    // 100% ou mais da meta: prata.
    } else if (porcentagemMeta >= 100) {
        medalha.emoji = "🥈";
        medalha.titulo = "Meta Concluída";
        medalha.descricao = "Você concluiu " + totalConcluidos + " de " + meta + " leituras e alcançou sua meta mensal.";

    // 50% ou mais da meta: bronze.
    } else if (porcentagemMeta >= 50) {
        medalha.emoji = "🥉";
        medalha.titulo = "Leitora em Jornada";
        medalha.descricao = "Você concluiu " + totalConcluidos + " de " + meta + " leituras e já passou da metade da sua meta.";
    }

    // Retorna o objeto para a função que atualiza o HTML.
    return medalha;
}


// Atualiza o card de progresso atual da meta no HTML.
function atualizarConquistaPerfil(porcentagemMeta, meta, totalConcluidos) {
    // Busca os dados da medalha com base no percentual calculado.
    let medalha = obterDadosMedalha(porcentagemMeta, meta, totalConcluidos);

    // Atualiza cada elemento visual do card.
    medalha_perfil.innerHTML = medalha.emoji;
    titulo_medalha_perfil.innerHTML = medalha.titulo;
    descricao_medalha_perfil.innerHTML = medalha.descricao;
    progresso_medalha_perfil.innerHTML = porcentagemMeta.toFixed(0) + "%";
}


// Busca no banco o total de medalhas salvas por tipo.
function carregarResumoConquistas() {
    let idUsuario = sessionStorage.ID_USUARIO;

    // Chama a rota que agrupa as conquistas por tipo: ouro, prata e bronze.
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
            // Atualiza os cards de medalhas acumuladas.
            atualizarResumoConquistas(resumo);
        })
        .catch(function (erro) {
            console.log("Erro ao carregar resumo de conquistas:", erro);
        });
}


// Atualiza os cards de ouro, prata, bronze e pontuação.
function atualizarResumoConquistas(resumo) {
    // Vetor com os tipos de medalha na ordem que queremos trabalhar.
    let tiposMedalha = ["ouro", "prata", "bronze"];

    // Vetor com as quantidades iniciais.
    // Começa com 0 para o caso de o usuário ainda não ter alguma medalha.
    let quantidades = [0, 0, 0];

    // Percorre o resumo que veio do banco.
    for (let i = 0; i < resumo.length; i++) {

        // Para cada item do banco, compara com os tipos esperados.
        for (let j = 0; j < tiposMedalha.length; j++) {

            // Se o tipo vindo do banco for igual ao tipo do vetor,
            // guarda a quantidade na mesma posição.
            if (resumo[i].tipoMedalha == tiposMedalha[j]) {
                quantidades[j] = Number(resumo[i].quantidade);
            }
        }
    }

    // Separa as quantidades para deixar a fórmula mais legível.
    let ouro = quantidades[0];
    let prata = quantidades[1];
    let bronze = quantidades[2];

    // Pontuação simples:
    // ouro vale 3 pontos, prata vale 2 e bronze vale 1.
    let pontuacao = (ouro * 3) + (prata * 2) + bronze;

    // Atualiza os cards no HTML.
    total_ouro.innerHTML = ouro;
    total_prata.innerHTML = prata;
    total_bronze.innerHTML = bronze;
    pontuacao_pessoal.innerHTML = pontuacao;
}


// Busca no banco o histórico mensal de conquistas salvas.
function carregarHistoricoConquistas() {
    let idUsuario = sessionStorage.ID_USUARIO;

    // Chama a rota que retorna as conquistas mês a mês.
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
            // Monta a lista visual com todas as conquistas salvas.
            montarHistoricoConquistas(historico);
        })
        .catch(function (erro) {
            console.log("Erro ao carregar histórico de conquistas:", erro);
        });
}


// Monta a lista de conquistas salvas no histórico.
function montarHistoricoConquistas(historico) {
    // Limpa a área antes de montar a lista.
    lista_historico_conquistas.innerHTML = "";

    // Se não houver conquistas salvas, mostra mensagem padrão.
    if (historico.length == 0) {
        lista_historico_conquistas.innerHTML = `
            <p>Você ainda não possui conquistas salvas no histórico.</p>
        `;
        return;
    }

    // Percorre cada conquista salva no banco.
    for (let i = 0; i < historico.length; i++) {
        let conquista = historico[i];

        // Transforma o tipo salvo no banco em emoji e nome amigável.
        let dadosMedalha = obterDadosMedalhaPorTipo(conquista.tipoMedalha);

        // Transforma o número do mês em nome do mês.
        let nomeMes = obterNomeMes(conquista.mesReferencia);

        // Adiciona o item no histórico.
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
    // Vetores relacionados:
    // tipos[0] corresponde a emojis[0] e nomes[0].
    let tipos = ["ouro", "prata", "bronze"];
    let emojis = ["🥇", "🥈", "🥉"];
    let nomes = ["Guardiã das Histórias", "Meta Concluída", "Leitora em Jornada"];

    // Percorre os tipos para encontrar o tipo recebido.
    for (let i = 0; i < tipos.length; i++) {

        // Quando encontra, retorna o emoji e o nome da mesma posição.
        if (tipoMedalha == tipos[i]) {
            return {
                emoji: emojis[i],
                nome: nomes[i]
            };
        }
    }

    // Caso venha algum tipo inesperado, retorna valor padrão.
    return {
        emoji: "🔒",
        nome: "Medalha"
    };
}


// Retorna o nome do mês com base no número salvo no banco.
// Exemplo: 1 = Janeiro, 2 = Fevereiro.
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

    // Percorre o vetor de meses.
    for (let i = 0; i < meses.length; i++) {

        // Como o vetor começa em 0, somamos 1 para comparar com o número do mês.
        // Exemplo: i = 0 representa Janeiro, então compara numeroMes == 1.
        if (numeroMes == i + 1) {
            return meses[i];
        }
    }

    // Caso venha um número inválido, retorna texto padrão.
    return "Mês";
}


// Quando o arquivo JS carrega, ele já busca os dados do perfil.
carregarPerfil();