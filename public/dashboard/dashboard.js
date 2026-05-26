// Variáveis globais dos gráficos.
let graficoGeneros;
let graficoMeta;
let graficoStatus;

// Dados do perfil do usuário usados nos cálculos da dashboard.
let metaMensal = 0;
let generoFavoritoUsuario = "-";


// Verifica se existe um usuário logado.
function verificarUsuarioLogado() {
    let idUsuario = sessionStorage.ID_USUARIO;

    if (idUsuario == undefined) {
        alert("Usuário não identificado. Faça login novamente.");
        window.location = "../login.html";
        return false;
    }

    return true;
}


// Retorna o tipo de medalha de acordo com a porcentagem da meta.
function obterTipoMedalha(porcentagemMeta) {
    if (porcentagemMeta >= 150) {
        return "ouro";
    } else if (porcentagemMeta >= 100) {
        return "prata";
    } else if (porcentagemMeta >= 50) {
        return "bronze";
    } else {
        return "";
    }
}


// Salva ou atualiza a conquista mensal no banco.
function salvarConquistaDoMes(porcentagemMeta, livrosConcluidos) {
    let idUsuario = sessionStorage.ID_USUARIO;

    if (idUsuario == undefined) {
        return;
    }

    if (metaMensal == 0) {
        return;
    }

    let tipoMedalha = obterTipoMedalha(porcentagemMeta);

    if (tipoMedalha == "") {
        return;
    }

    let dataAtual = new Date();
    let mesReferencia = dataAtual.getMonth() + 1;
    let anoReferencia = dataAtual.getFullYear();

    fetch("/conquistas/salvar-ou-atualizar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            fkUsuarioServer: idUsuario,
            mesReferenciaServer: mesReferencia,
            anoReferenciaServer: anoReferencia,
            tipoMedalhaServer: tipoMedalha,
            percentualMetaServer: Number(porcentagemMeta.toFixed(2)),
            livrosConcluidosServer: livrosConcluidos,
            metaMensalServer: metaMensal
        })
    })
        .catch(function (erro) {
            console.log("Erro ao salvar conquista do mês:", erro);
        });
}


// Primeiro valida o usuário, depois carrega perfil e leituras(Função principal da dashboard)
function carregarDashboard() {
    if (!verificarUsuarioLogado()) {
        return;
    }

    let nomeUsuario = sessionStorage.NOME_USUARIO;
    nome_usuario.innerHTML = nomeUsuario;

    carregarPerfilDashboard();
}


// Busca o perfil do usuário para recuperar a meta mensal e o gênero favorito.
function carregarPerfilDashboard() {
    let idUsuario = sessionStorage.ID_USUARIO;

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
                preencherDadosPerfilDashboard(perfil[0]);
            } else {
                preencherPerfilDashboardVazio();
            }

            carregarLeituras();
        })
        .catch(function (erro) {
            console.log("Erro ao carregar perfil:", erro);

            preencherPerfilDashboardVazio();
            carregarLeituras();
        });
}


// Preenche no HTML os dados de perfil encontrados no banco.
function preencherDadosPerfilDashboard(perfil) {
    metaMensal = Number(perfil.metaMensal);
    generoFavoritoUsuario = perfil.generoFavorito;

    genero_favorito.innerHTML = generoFavoritoUsuario;
    meta_resumo.innerHTML = metaMensal + " livros";
    meta_mes_card.innerHTML = metaMensal;
    texto_meta.innerHTML = metaMensal;
}


// Define valores padrão quando o usuário ainda não cadastrou perfil.
function preencherPerfilDashboardVazio() {
    metaMensal = 0;
    generoFavoritoUsuario = "-";

    genero_favorito.innerHTML = "-";
    meta_resumo.innerHTML = "0 livros";
    meta_mes_card.innerHTML = "0";
    texto_meta.innerHTML = "0";
}


// Busca as leituras do usuário no banco.
function carregarLeituras() {
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
            calcularIndicadores(leituras);
        })
        .catch(function (erro) {
            console.log("Erro ao carregar leituras:", erro);
            alert("Erro ao carregar dados da dashboard.");
        });
}


// Função central que transforma as leituras do banco em indicadores, porcentagens e dados para os gráficos
function calcularIndicadores(leituras) {
    let totalEstante = leituras.length;

    let contagemStatus = contarStatusLeituras(leituras);
    let contagemGeneros = contarGenerosConcluidos(leituras);

    let totalConcluidos = contagemStatus.concluidos;
    let totalLendo = contagemStatus.lendo;
    let totalQueroLer = contagemStatus.queroLer;

    let porcentagemMetaReal = calcularPorcentagemMeta(totalConcluidos);
    let porcentagemMetaExibida = limitarPorcentagemParaCard(porcentagemMetaReal);

    let statusMaisComum = calcularStatusMaisComum(totalConcluidos, totalLendo, totalQueroLer);

    atualizarIndicadoresHTML(
        totalConcluidos,
        totalEstante,
        porcentagemMetaReal,
        porcentagemMetaExibida,
        statusMaisComum
    );

    atualizarMedalha(porcentagemMetaReal);
    atualizarProximaMedalha(porcentagemMetaReal);

    salvarConquistaDoMes(porcentagemMetaReal, totalConcluidos);

    criarGraficos(
        contagemGeneros,
        totalConcluidos,
        totalLendo,
        totalQueroLer
    );
}


// Conta quantas leituras existem em cada status.
function contarStatusLeituras(leituras) {
    let contagemStatus = {
        concluidos: 0,
        lendo: 0,
        queroLer: 0
    };

    for (let i = 0; i < leituras.length; i++) {
        if (leituras[i].statusLeitura == "Concluído") {
            contagemStatus.concluidos++;
        } else if (leituras[i].statusLeitura == "Lendo") {
            contagemStatus.lendo++;
        } else if (leituras[i].statusLeitura == "Quero ler") {
            contagemStatus.queroLer++;
        }
    }

    return contagemStatus;
}


// Conta os gêneros apenas dos livros concluídos.
function contarGenerosConcluidos(leituras) {
    let contagemGeneros = {
        fantasia: 0,
        romance: 0,
        misterio: 0,
        ficcao: 0,
        poesia: 0,
        terror: 0,
        outros: 0
    };

    for (let i = 0; i < leituras.length; i++) {
        let leitura = leituras[i];

        if (leitura.statusLeitura == "Concluído") {
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

    return contagemGeneros;
}


// Calcula a porcentagem da meta mensal.
function calcularPorcentagemMeta(totalConcluidos) {
    let porcentagemMeta = 0;

    if (metaMensal > 0) {
        porcentagemMeta = (totalConcluidos * 100) / metaMensal;
    }

    return porcentagemMeta;
}


// Limita a porcentagem exibida no card de resumo para no máximo 100%.
function limitarPorcentagemParaCard(porcentagemMeta) {
    if (porcentagemMeta > 100) {
        return 100;
    } else {
        return porcentagemMeta;
    }
}


// Descobre qual status aparece mais entre as leituras do usuário.
function calcularStatusMaisComum(concluidos, lendo, queroLer) {
    if (concluidos == 0 && lendo == 0 && queroLer == 0) {
        return "-";
    }

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
    total_lidos_mes.innerHTML = totalConcluidos;
    total_estante.innerHTML = totalEstante;
    progresso_card.innerHTML = porcentagemMetaExibida.toFixed(0) + "%";

    texto_lidos.innerHTML = totalConcluidos;
    porcentagem_meta.innerHTML = porcentagemMetaReal.toFixed(0) + "% da meta concluída";

    status_mais_comum.innerHTML = statusMaisComum;
}


// Atualiza o card de medalha do mês.
function atualizarMedalha(porcentagemMeta) {
    if (metaMensal == 0) {
        medalha_mes.innerHTML = "🔒 Sem meta";
        descricao_medalha.innerHTML = "Cadastre uma meta mensal no seu perfil.";
    } else if (porcentagemMeta >= 150) {
        medalha_mes.innerHTML = "🥇 Guardiã das Histórias";
        descricao_medalha.innerHTML = "Você ultrapassou sua meta mensal de leitura.";
    } else if (porcentagemMeta >= 100) {
        medalha_mes.innerHTML = "🥈 Meta Concluída";
        descricao_medalha.innerHTML = "Você concluiu sua meta mensal de leitura.";
    } else if (porcentagemMeta >= 50) {
        medalha_mes.innerHTML = "🥉 Leitora em Jornada";
        descricao_medalha.innerHTML = "Você já passou da metade da sua meta.";
    } else {
        medalha_mes.innerHTML = "🔒 Medalha bloqueada";
        descricao_medalha.innerHTML = "Continue registrando leituras concluídas para desbloquear.";
    }
}


// Atualiza o texto indicando quanto falta para a próxima medalha.
function atualizarProximaMedalha(porcentagemMeta) {
    if (metaMensal == 0) {
        texto_proxima_medalha.innerHTML = "Cadastre uma meta mensal no perfil para acompanhar suas conquistas.";
    } else if (porcentagemMeta >= 150) {
        texto_proxima_medalha.innerHTML = "Você desbloqueou a maior conquista do mês: 🥇 Guardiã das Histórias.";
    } else if (porcentagemMeta >= 100) {
        let falta = 150 - porcentagemMeta;
        texto_proxima_medalha.innerHTML = "Faltam " + falta.toFixed(0) + "% para desbloquear 🥇 Guardiã das Histórias.";
    } else if (porcentagemMeta >= 50) {
        let falta = 100 - porcentagemMeta;
        texto_proxima_medalha.innerHTML = "Faltam " + falta.toFixed(0) + "% para desbloquear 🥈 Meta Concluída.";
    } else {
        let falta = 50 - porcentagemMeta;
        texto_proxima_medalha.innerHTML = "Faltam " + falta.toFixed(0) + "% para desbloquear 🥉 Leitora em Jornada.";
    }
}


// Destrói gráficos antigos antes de criar novos.
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
    destruirGraficosAntigos();

    criarGraficoGeneros(contagemGeneros);
    criarGraficoMeta(concluidos);
    criarGraficoStatus(concluidos, lendo, queroLer);
}


// Prepara os dados do gráfico de gêneros
function prepararDadosGraficoGeneros(contagemGeneros) {
    let generosBase = [
        { nome: "Fantasia", valor: contagemGeneros.fantasia, cor: "#B08A57" },
        { nome: "Romance", valor: contagemGeneros.romance, cor: "#6B2D3A" },
        { nome: "Mistério", valor: contagemGeneros.misterio, cor: "#2F4A3C" },
        { nome: "Ficção científica", valor: contagemGeneros.ficcao, cor: "#8C6A3E" },
        { nome: "Poesia", valor: contagemGeneros.poesia, cor: "#A89A8A" },
        { nome: "Terror", valor: contagemGeneros.terror, cor: "#4A1F2A" },
        { nome: "Outros", valor: contagemGeneros.outros, cor: "#5A4034" }
    ];

    let labels = [];
    let dados = [];
    let cores = [];

    for (let i = 0; i < generosBase.length; i++) {
        if (generosBase[i].valor > 0) {
            labels.push(generosBase[i].nome);
            dados.push(generosBase[i].valor);
            cores.push(generosBase[i].cor);
        }
    }

    if (labels.length == 0) {
        labels = ["Nenhum livro concluído"];
        dados = [0];
        cores = ["#5A4034"];
    }

    return {
        labels: labels,
        dados: dados,
        cores: cores
    };
}


// Cria o gráfico de barras horizontais com livros concluídos por gênero.
function criarGraficoGeneros(contagemGeneros) {
    let ctxGeneros = document.getElementById("grafico_generos");
    let dadosGeneros = prepararDadosGraficoGeneros(contagemGeneros);

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
            indexAxis: "y",
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        color: "#F3EBDD",
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
    let ctxMeta = document.getElementById("grafico_meta");

    graficoMeta = new Chart(ctxMeta, {
        type: "bar",
        data: {
            labels: ["Lidos", "Meta"],
            datasets: [
                {
                    label: "Meta mensal",
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
                    beginAtZero: true,
                    ticks: {
                        color: "#F3EBDD",
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
    let ctxStatus = document.getElementById("grafico_status");

    graficoStatus = new Chart(ctxStatus, {
        type: "doughnut",
        data: {
            labels: ["Concluídos", "Lendo", "Quero ler"],
            datasets: [
                {
                    label: "Status dos livros",
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