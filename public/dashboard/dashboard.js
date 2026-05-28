// Variáveis globais dos gráficos.
// Elas ficam fora das funções porque os gráficos precisam ser acessados depois,
// principalmente para destruir o gráfico antigo antes de criar um novo.
let graficoGeneros;
let graficoMeta;
let graficoStatus;

// Dados do perfil do usuário usados nos cálculos da dashboard.
// metaMensal vem da tabela Perfil.
// generoFavoritoUsuario também vem da tabela Perfil e aparece no resumo da dashboard.
let metaMensal = 0;
let generoFavoritoUsuario = "-";


// Verifica se existe um usuário logado.
// Como a dashboard está dentro da pasta "dashboard",
// o caminho para login precisa voltar uma pasta: ../login.html.
function verificarUsuarioLogado() {
    // Recupera o id do usuário salvo na sessão após o login.
    let idUsuario = sessionStorage.ID_USUARIO;

    // Se não houver idUsuario, o usuário não deveria acessar essa página.
    if (idUsuario == undefined) {
        alert("Usuário não identificado. Faça login novamente.");

        // Redireciona para a tela de login.
        window.location = "../login.html";

        // Retorna false para interromper o fluxo da função que chamou.
        return false;
    }

    // Se chegou até aqui, o usuário está logado.
    return true;
}


// Retorna o tipo de medalha de acordo com a porcentagem da meta.
// Essa função transforma a regra da gamificação em código.
function obterTipoMedalha(porcentagemMeta) {
    // 150% ou mais da meta libera ouro.
    if (porcentagemMeta >= 150) {
        return "ouro";

    // 100% ou mais libera prata.
    } else if (porcentagemMeta >= 100) {
        return "prata";

    // 50% ou mais libera bronze.
    } else if (porcentagemMeta >= 50) {
        return "bronze";

    // Abaixo de 50%, não existe medalha para salvar.
    } else {
        return "";
    }
}


// Salva ou atualiza a conquista mensal no banco.
// Essa função é chamada depois que a dashboard calcula a porcentagem da meta.
function salvarConquistaDoMes(porcentagemMeta, livrosConcluidos) {
    // Recupera o id do usuário logado.
    let idUsuario = sessionStorage.ID_USUARIO;

    // Se não tiver usuário, não tenta salvar conquista.
    if (idUsuario == undefined) {
        return;
    }

    // Se a meta mensal for 0, o usuário ainda não cadastrou meta no perfil.
    // Nesse caso, não existe conquista para salvar.
    if (metaMensal == 0) {
        return;
    }

    // Converte a porcentagem da meta em tipo de medalha: bronze, prata ou ouro.
    let tipoMedalha = obterTipoMedalha(porcentagemMeta);

    // Se não atingiu nenhuma medalha, interrompe a função.
    if (tipoMedalha == "") {
        return;
    }

    // Cria um objeto Date para descobrir o mês e o ano atuais.
    // Isso permite salvar uma conquista por mês.
    let dataAtual = new Date();

    // getMonth() retorna de 0 a 11, então somamos 1 para ficar de 1 a 12.
    let mesReferencia = dataAtual.getMonth() + 1;

    // Pega o ano atual.
    let anoReferencia = dataAtual.getFullYear();

    // Envia os dados da conquista para o back-end.
    fetch("/conquistas/salvar-ou-atualizar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },

        // Envia todas as informações necessárias para registrar a conquista.
        // O controller vai decidir se cadastra uma nova ou atualiza a existente.
        body: JSON.stringify({
            fkUsuarioServer: idUsuario,
            mesReferenciaServer: mesReferencia,
            anoReferenciaServer: anoReferencia,
            tipoMedalhaServer: tipoMedalha,

            // toFixed(2) limita a porcentagem a duas casas decimais.
            // Number() converte de volta para número.
            percentualMetaServer: Number(porcentagemMeta.toFixed(2)),

            livrosConcluidosServer: livrosConcluidos,
            metaMensalServer: metaMensal
        })
    })
        // Aqui não mostro alerta porque salvar conquista é uma ação automática.
        // Se der erro, apenas registro no console.
        .catch(function (erro) {
            console.log("Erro ao salvar conquista do mês:", erro);
        });
}


// Função principal da dashboard.
// Primeiro valida o usuário, depois carrega perfil e leituras.
function carregarDashboard() {
    // Se o usuário não estiver logado, interrompe a dashboard.
    if (!verificarUsuarioLogado()) {
        return;
    }

    // Recupera o nome do usuário salvo na sessão.
    let nomeUsuario = sessionStorage.NOME_USUARIO;

    // Mostra o nome no card de resumo da dashboard.
    nome_usuario.innerHTML = nomeUsuario;

    // Depois de validar usuário, carrega os dados do perfil.
    // O perfil precisa vir primeiro porque contém a meta mensal.
    carregarPerfilDashboard();
}


// Busca o perfil do usuário para recuperar a meta mensal e o gênero favorito.
function carregarPerfilDashboard() {
    let idUsuario = sessionStorage.ID_USUARIO;

    // Busca o perfil do usuário no banco.
    fetch(`/perfis/listar/${idUsuario}`, {
        method: "GET"
    })
        // Primeiro then: valida se a resposta deu certo.
        .then(function (resposta) {
            if (resposta.ok) {
                // Converte a resposta para JSON.
                // O resultado esperado é um vetor com 0 ou 1 perfil.
                return resposta.json();
            } else {
                throw "Erro ao buscar perfil.";
            }
        })

        // Segundo then: recebe o perfil convertido.
        .then(function (perfil) {

            // Se encontrou perfil, preenche a dashboard com os dados reais.
            if (perfil.length > 0) {
                preencherDadosPerfilDashboard(perfil[0]);

            // Se não encontrou perfil, usa valores padrão.
            } else {
                preencherPerfilDashboardVazio();
            }

            // Depois de carregar o perfil, busca as leituras.
            // Essa ordem é importante porque as leituras usam metaMensal no cálculo da porcentagem.
            carregarLeituras();
        })

        // Se der erro ao carregar o perfil, usa valores padrão e ainda tenta carregar as leituras.
        .catch(function (erro) {
            console.log("Erro ao carregar perfil:", erro);

            preencherPerfilDashboardVazio();
            carregarLeituras();
        });
}


// Preenche no HTML os dados de perfil encontrados no banco.
function preencherDadosPerfilDashboard(perfil) {
    // Converte metaMensal para número porque será usada em cálculos.
    metaMensal = Number(perfil.metaMensal);

    // Guarda o gênero favorito vindo do banco.
    generoFavoritoUsuario = perfil.generoFavorito;

    // Atualiza os elementos visuais da dashboard com os dados do perfil.
    genero_favorito.innerHTML = generoFavoritoUsuario;
    meta_resumo.innerHTML = metaMensal + " livros";
    meta_mes_card.innerHTML = metaMensal;
    texto_meta.innerHTML = metaMensal;
}


// Define valores padrão quando o usuário ainda não cadastrou perfil.
function preencherPerfilDashboardVazio() {
    // Sem perfil, a meta é 0 e o gênero favorito fica indefinido.
    metaMensal = 0;
    generoFavoritoUsuario = "-";

    // Atualiza o HTML com valores neutros.
    genero_favorito.innerHTML = "-";
    meta_resumo.innerHTML = "0 livros";
    meta_mes_card.innerHTML = "0";
    texto_meta.innerHTML = "0";
}


// Busca as leituras do usuário no banco.
function carregarLeituras() {
    let idUsuario = sessionStorage.ID_USUARIO;

    // Busca todas as leituras do usuário.
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

        // Segundo then: recebe as leituras.
        .then(function (leituras) {
            // Envia as leituras para a função central de cálculo.
            calcularIndicadores(leituras);
        })

        // Se der erro, mostra alerta porque a dashboard depende desses dados.
        .catch(function (erro) {
            console.log("Erro ao carregar leituras:", erro);
            alert("Erro ao carregar dados da dashboard.");
        });
}


// Função central da dashboard.
// Ela transforma as leituras do banco em indicadores, porcentagens e dados para gráficos.
function calcularIndicadores(leituras) {
    // Total na estante é o total de leituras registradas, independentemente do status.
    let totalEstante = leituras.length;

    // Conta quantas leituras existem em cada status.
    let contagemStatus = contarStatusLeituras(leituras);

    // Conta os gêneros apenas dos livros concluídos.
    let contagemGeneros = contarGenerosConcluidos(leituras);

    // Separa os valores do objeto para deixar o código mais legível.
    let totalConcluidos = contagemStatus.concluidos;
    let totalLendo = contagemStatus.lendo;
    let totalQueroLer = contagemStatus.queroLer;

    // Calcula a porcentagem real da meta.
    // Exemplo: 6 concluídos com meta 4 = 150%.
    let porcentagemMetaReal = calcularPorcentagemMeta(totalConcluidos);

    // Limita a porcentagem exibida no card para no máximo 100%.
    // A porcentagem real continua sendo usada para medalha.
    let porcentagemMetaExibida = limitarPorcentagemParaCard(porcentagemMetaReal);

    // Descobre qual status aparece mais nas leituras do usuário.
    let statusMaisComum = calcularStatusMaisComum(totalConcluidos, totalLendo, totalQueroLer);

    // Atualiza os textos e números principais da dashboard.
    atualizarIndicadoresHTML(
        totalConcluidos,
        totalEstante,
        porcentagemMetaReal,
        porcentagemMetaExibida,
        statusMaisComum
    );

    // Atualiza o card da medalha do mês.
    atualizarMedalha(porcentagemMetaReal);

    // Atualiza o texto que diz quanto falta para a próxima medalha.
    atualizarProximaMedalha(porcentagemMetaReal);

    // Salva ou atualiza a conquista mensal no banco, se o usuário atingiu alguma medalha.
    salvarConquistaDoMes(porcentagemMetaReal, totalConcluidos);

    // Cria os gráficos usando os dados calculados.
    criarGraficos(
        contagemGeneros,
        totalConcluidos,
        totalLendo,
        totalQueroLer
    );
}


// Conta quantas leituras existem em cada status.
function contarStatusLeituras(leituras) {
    // Objeto usado para guardar as contagens.
    let contagemStatus = {
        concluidos: 0,
        lendo: 0,
        queroLer: 0
    };

    // Percorre todas as leituras.
    for (let i = 0; i < leituras.length; i++) {

        // Soma no campo correspondente ao status da leitura.
        if (leituras[i].statusLeitura == "Concluído") {
            contagemStatus.concluidos++;
        } else if (leituras[i].statusLeitura == "Lendo") {
            contagemStatus.lendo++;
        } else if (leituras[i].statusLeitura == "Quero ler") {
            contagemStatus.queroLer++;
        }
    }

    // Retorna o objeto com as três contagens.
    return contagemStatus;
}


// Conta os gêneros apenas dos livros concluídos.
// Esse resultado alimenta o gráfico "Livros finalizados por gênero".
function contarGenerosConcluidos(leituras) {
    // Objeto com todos os gêneros começando em zero.
    let contagemGeneros = {
        fantasia: 0,
        romance: 0,
        misterio: 0,
        ficcao: 0,
        poesia: 0,
        terror: 0,
        outros: 0
    };

    // Percorre todas as leituras.
    for (let i = 0; i < leituras.length; i++) {
        let leitura = leituras[i];

        // Só considera gênero se a leitura estiver concluída.
        if (leitura.statusLeitura == "Concluído") {

            // Soma no gênero correspondente.
            if (leitura.genero == "Fantasia") {
                contagemGeneros.fantasia++;
            } else if (leitura.genero == "Romance") {
                contagemGeneros.romance++;
            } else if (leitura.genero == "Mistério") {
                contagemGeneros.misterio++;
            } else if (leitura.genero == "Ficção científica") {
                contagemGeneros.ficcao++;
            } else if (leitura.genero == "Poesia") {
                contagemGeneros.poesia++;
            } else if (leitura.genero == "Terror") {
                contagemGeneros.terror++;
            } else {
                contagemGeneros.outros++;
            }
        }
    }

    // Retorna o objeto com a quantidade de concluídos por gênero.
    return contagemGeneros;
}


// Calcula a porcentagem da meta mensal.
function calcularPorcentagemMeta(totalConcluidos) {
    // Começa em 0 para o caso de não existir meta.
    let porcentagemMeta = 0;

    // Só calcula se a meta for maior que zero.
    // Isso evita divisão por zero.
    if (metaMensal > 0) {
        porcentagemMeta = (totalConcluidos * 100) / metaMensal;
    }

    return porcentagemMeta;
}


// Limita a porcentagem exibida no card de resumo para no máximo 100%.
function limitarPorcentagemParaCard(porcentagemMeta) {
    // Se o usuário ultrapassar a meta, o card continua mostrando 100%.
    if (porcentagemMeta > 100) {
        return 100;
    } else {
        return porcentagemMeta;
    }
}


// Descobre qual status aparece mais entre as leituras do usuário.
function calcularStatusMaisComum(concluidos, lendo, queroLer) {
    // Se não houver nenhuma leitura, retorna "-".
    if (concluidos == 0 && lendo == 0 && queroLer == 0) {
        return "-";
    }

    // Usa comparações para encontrar o maior valor.
    // Em caso de empate, a ordem dá prioridade para Concluído, depois Lendo.
    if (concluidos >= lendo && concluidos >= queroLer) {
        return "Concluído";
    } else if (lendo >= concluidos && lendo >= queroLer) {
        return "Lendo";
    } else {
        return "Quero ler";
    }
}


// Atualiza os textos e indicadores principais no HTML.
function atualizarIndicadoresHTML(
    totalConcluidos,
    totalEstante,
    porcentagemMetaReal,
    porcentagemMetaExibida,
    statusMaisComum
) {
    // Atualiza os cards superiores.
    total_lidos_mes.innerHTML = totalConcluidos;
    total_estante.innerHTML = totalEstante;
    progresso_card.innerHTML = porcentagemMetaExibida.toFixed(0) + "%";

    // Atualiza o texto dentro do gráfico/meta.
    texto_lidos.innerHTML = totalConcluidos;
    porcentagem_meta.innerHTML = porcentagemMetaReal.toFixed(0) + "% da meta concluída";

    // Atualiza o resumo lateral dos dados analisados.
    status_mais_comum.innerHTML = statusMaisComum;
}


// Atualiza o card de medalha do mês.
function atualizarMedalha(porcentagemMeta) {
    // Sem meta cadastrada.
    if (metaMensal == 0) {
        medalha_mes.innerHTML = "🔒 Sem meta";
        descricao_medalha.innerHTML = "Cadastre uma meta mensal no seu perfil.";

    // Ouro: 150% ou mais.
    } else if (porcentagemMeta >= 150) {
        medalha_mes.innerHTML = "🥇 Guardiã das Histórias";
        descricao_medalha.innerHTML = "Você ultrapassou sua meta mensal de leitura.";

    // Prata: 100% ou mais.
    } else if (porcentagemMeta >= 100) {
        medalha_mes.innerHTML = "🥈 Meta Concluída";
        descricao_medalha.innerHTML = "Você concluiu sua meta mensal de leitura.";

    // Bronze: 50% ou mais.
    } else if (porcentagemMeta >= 50) {
        medalha_mes.innerHTML = "🥉 Leitora em Jornada";
        descricao_medalha.innerHTML = "Você já passou da metade da sua meta.";

    // Abaixo de 50%.
    } else {
        medalha_mes.innerHTML = "🔒 Medalha bloqueada";
        descricao_medalha.innerHTML = "Continue registrando leituras concluídas para desbloquear.";
    }
}


// Atualiza o texto indicando quanto falta para a próxima medalha.
function atualizarProximaMedalha(porcentagemMeta) {
    // Se não houver meta, orienta o usuário a cadastrar uma.
    if (metaMensal == 0) {
        texto_proxima_medalha.innerHTML = "Cadastre uma meta mensal no perfil para acompanhar suas conquistas.";

    // Se já passou de 150%, atingiu a maior medalha.
    } else if (porcentagemMeta >= 150) {
        texto_proxima_medalha.innerHTML = "Você desbloqueou a maior conquista do mês: 🥇 Guardiã das Histórias.";

    // Se está entre 100% e 149%, falta para ouro.
    } else if (porcentagemMeta >= 100) {
        let falta = 150 - porcentagemMeta;
        texto_proxima_medalha.innerHTML = "Faltam " + falta.toFixed(0) + "% para desbloquear 🥇 Guardiã das Histórias.";

    // Se está entre 50% e 99%, falta para prata.
    } else if (porcentagemMeta >= 50) {
        let falta = 100 - porcentagemMeta;
        texto_proxima_medalha.innerHTML = "Faltam " + falta.toFixed(0) + "% para desbloquear 🥈 Meta Concluída.";

    // Abaixo de 50%, falta para bronze.
    } else {
        let falta = 50 - porcentagemMeta;
        texto_proxima_medalha.innerHTML = "Faltam " + falta.toFixed(0) + "% para desbloquear 🥉 Leitora em Jornada.";
    }
}


// Destrói gráficos antigos antes de criar novos.
// Isso evita sobreposição de gráficos caso a dashboard seja recarregada.
function destruirGraficosAntigos() {
    if (graficoGeneros != undefined) {
        graficoGeneros.destroy();
    }

    if (graficoMeta != undefined) {
        graficoMeta.destroy();
    }

    if (graficoStatus != undefined) {
        graficoStatus.destroy();
    }
}


// Cria todos os gráficos da dashboard.
function criarGraficos(contagemGeneros, concluidos, lendo, queroLer) {
    // Primeiro remove gráficos antigos, se existirem.
    destruirGraficosAntigos();

    // Cria o gráfico de livros concluídos por gênero.
    criarGraficoGeneros(contagemGeneros);

    // Cria o gráfico de meta mensal.
    criarGraficoMeta(concluidos);

    // Cria o gráfico de quantidade por status.
    criarGraficoStatus(concluidos, lendo, queroLer);
}


// Prepara os dados do gráfico de gêneros.
function prepararDadosGraficoGeneros(contagemGeneros) {
    // Vetor base com nome, valor e cor de cada gênero.
    // O valor vem do objeto contagemGeneros calculado anteriormente.
    let generosBase = [
        { nome: "Fantasia", valor: contagemGeneros.fantasia, cor: "#B08A57" },
        { nome: "Romance", valor: contagemGeneros.romance, cor: "#6B2D3A" },
        { nome: "Mistério", valor: contagemGeneros.misterio, cor: "#2F4A3C" },
        { nome: "Ficção científica", valor: contagemGeneros.ficcao, cor: "#8C6A3E" },
        { nome: "Poesia", valor: contagemGeneros.poesia, cor: "#A89A8A" },
        { nome: "Terror", valor: contagemGeneros.terror, cor: "#4A1F2A" },
        { nome: "Outros", valor: contagemGeneros.outros, cor: "#5A4034" }
    ];

    // Vetores que serão usados pelo Chart.js.
    let labels = [];
    let dados = [];
    let cores = [];

    // Percorre os gêneros base.
    for (let i = 0; i < generosBase.length; i++) {

        // Só adiciona no gráfico os gêneros que têm pelo menos um livro concluído.
        if (generosBase[i].valor > 0) {
            labels.push(generosBase[i].nome);
            dados.push(generosBase[i].valor);
            cores.push(generosBase[i].cor);
        }
    }

    // Se não houver nenhum livro concluído, cria um estado padrão para o gráfico.
    if (labels.length == 0) {
        labels = ["Nenhum livro concluído"];
        dados = [0];
        cores = ["#5A4034"];
    }

    // Retorna os dados organizados para a função criarGraficoGeneros().
    return {
        labels: labels,
        dados: dados,
        cores: cores
    };
}


// Cria o gráfico de barras horizontais com livros concluídos por gênero.
function criarGraficoGeneros(contagemGeneros) {
    // Busca o canvas do HTML onde o gráfico será desenhado.
    let ctxGeneros = document.getElementById("grafico_generos");

    // Prepara labels, dados e cores antes de criar o gráfico.
    let dadosGeneros = prepararDadosGraficoGeneros(contagemGeneros);

    // Cria o gráfico usando Chart.js.
    graficoGeneros = new Chart(ctxGeneros, {
        type: "bar",
        data: {
            labels: dadosGeneros.labels,
            datasets: [
                {
                    label: "Livros concluídos",
                    data: dadosGeneros.dados,
                    backgroundColor: dadosGeneros.cores,
                    borderWidth: 1
                }
            ]
        },
        options: {
            // Deixa o gráfico de barras na horizontal.
            indexAxis: "y",

            // Faz o gráfico se adaptar ao tamanho do container.
            responsive: true,

            // Permite controlar a altura pelo CSS da div.
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    // Esconde legenda porque o título do gráfico já explica o conteúdo.
                    display: false
                }
            },

            scales: {
                x: {
                    // Garante que o eixo X comece em zero.
                    beginAtZero: true,
                    ticks: {
                        color: "#F3EBDD",

                        // Evita valores quebrados no eixo, como 1.5 livros.
                        precision: 0
                    },
                    grid: {
                        color: "rgba(243, 235, 221, 0.08)"
                    }
                },
                y: {
                    ticks: {
                        color: "#F3EBDD"
                    },
                    grid: {
                        color: "rgba(243, 235, 221, 0.08)"
                    }
                }
            }
        }
    });
}


// Cria o gráfico comparando livros concluídos com a meta mensal.
function criarGraficoMeta(concluidos) {
    // Busca o canvas do gráfico de meta.
    let ctxMeta = document.getElementById("grafico_meta");

    // Cria o gráfico de barras com dois valores: lidos e meta.
    graficoMeta = new Chart(ctxMeta, {
        type: "bar",
        data: {
            labels: ["Lidos", "Meta"],
            datasets: [
                {
                    label: "Meta mensal",

                    // Primeiro valor: livros concluídos.
                    // Segundo valor: meta cadastrada no perfil.
                    data: [concluidos, metaMensal],

                    backgroundColor: ["#2F4A3C", "#B08A57"],
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    labels: {
                        color: "#F3EBDD"
                    }
                }
            },

            scales: {
                x: {
                    ticks: {
                        color: "#F3EBDD"
                    },
                    grid: {
                        color: "rgba(243, 235, 221, 0.08)"
                    }
                },
                y: {
                    // Eixo Y começa em zero.
                    beginAtZero: true,
                    ticks: {
                        color: "#F3EBDD",

                        // Evita números quebrados para quantidade de livros.
                        precision: 0
                    },
                    grid: {
                        color: "rgba(243, 235, 221, 0.08)"
                    }
                }
            }
        }
    });
}


// Cria o gráfico de rosca com a quantidade de livros por status.
function criarGraficoStatus(concluidos, lendo, queroLer) {
    // Busca o canvas do gráfico de status.
    let ctxStatus = document.getElementById("grafico_status");

    // Cria um gráfico do tipo doughnut, que funciona bem para proporções.
    graficoStatus = new Chart(ctxStatus, {
        type: "doughnut",
        data: {
            labels: ["Concluídos", "Lendo", "Quero ler"],
            datasets: [
                {
                    label: "Status dos livros",

                    // Usa os totais calculados em contarStatusLeituras().
                    data: [concluidos, lendo, queroLer],

                    backgroundColor: ["#B08A57", "#6B2D3A", "#2F4A3C"],
                    borderColor: "#1E1A17",
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    labels: {
                        color: "#F3EBDD"
                    }
                }
            }
        }
    });
}


// Quando o JavaScript carrega, a dashboard já busca perfil, leituras e monta os gráficos.
carregarDashboard();