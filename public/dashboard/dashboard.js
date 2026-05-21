let graficoGeneros;
let graficoMeta;
let graficoStatus;

let metaMensal = 0;
let generoFavoritoUsuario = "-";

function verificarUsuarioLogado() {
    let idUsuario = sessionStorage.ID_USUARIO;

    if (idUsuario == undefined) {
        alert("Usuário não identificado. Faça login novamente.");
        window.location = "../login.html";
        return false;
    }

    return true;
}

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
    });
}

function carregarDashboard() {
    if (!verificarUsuarioLogado()) {
        return;
    }

    let idUsuario = sessionStorage.ID_USUARIO;
    let nomeUsuario = sessionStorage.NOME_USUARIO;

    nome_usuario.innerHTML = nomeUsuario;

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
                metaMensal = Number(perfil[0].metaMensal);
                generoFavoritoUsuario = perfil[0].generoFavorito;

                genero_favorito.innerHTML = generoFavoritoUsuario;
                meta_resumo.innerHTML = metaMensal + " livros";
                meta_mes_card.innerHTML = metaMensal;
                texto_meta.innerHTML = metaMensal;
            } else {
                metaMensal = 0;
                generoFavoritoUsuario = "-";

                genero_favorito.innerHTML = "-";
                meta_resumo.innerHTML = "0 livros";
                meta_mes_card.innerHTML = "0";
                texto_meta.innerHTML = "0";
            }

            carregarLeituras();
        })
        .catch(function (erro) {
            console.log("Erro ao carregar perfil:", erro);
            carregarLeituras();
        });
}

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

function calcularIndicadores(leituras) {
    let totalEstante = leituras.length;

    let totalConcluidos = 0;
    let totalLendo = 0;
    let totalQueroLer = 0;

    let fantasia = 0;
    let romance = 0;
    let misterio = 0;
    let ficcao = 0;
    let poesia = 0;
    let terror = 0;
    let outros = 0;

    for (let i = 0; i < leituras.length; i++) {
        let leitura = leituras[i];

        if (leitura.statusLeitura == "Concluído") {
            totalConcluidos++;

            if (leitura.genero == "Fantasia") {
                fantasia++;
            } else if (leitura.genero == "Romance") {
                romance++;
            } else if (leitura.genero == "Mistério") {
                misterio++;
            } else if (leitura.genero == "Ficção científica") {
                ficcao++;
            } else if (leitura.genero == "Poesia") {
                poesia++;
            } else if (leitura.genero == "Terror") {
                terror++;
            } else {
                outros++;
            }

        } else if (leitura.statusLeitura == "Lendo") {
            totalLendo++;

        } else if (leitura.statusLeitura == "Quero ler") {
            totalQueroLer++;
        }
    }

    let porcentagemMetaReal = 0;

    if (metaMensal > 0) {
        porcentagemMetaReal = (totalConcluidos * 100) / metaMensal;
    }

    let porcentagemMetaExibida = porcentagemMetaReal;

    if (porcentagemMetaExibida > 100) {
        porcentagemMetaExibida = 100;
    }

    let statusMaisComum = calcularStatusMaisComum(totalConcluidos, totalLendo, totalQueroLer);

    total_lidos_mes.innerHTML = totalConcluidos;
    total_estante.innerHTML = totalEstante;
    progresso_card.innerHTML = porcentagemMetaExibida.toFixed(0) + "%";

    texto_lidos.innerHTML = totalConcluidos;
    porcentagem_meta.innerHTML = porcentagemMetaReal.toFixed(0) + "% da meta concluída";

    status_mais_comum.innerHTML = statusMaisComum;

    atualizarMedalha(porcentagemMetaReal);
    atualizarProximaMedalha(porcentagemMetaReal);
    salvarConquistaDoMes(porcentagemMetaReal, totalConcluidos);

    criarGraficos(
        fantasia,
        romance,
        misterio,
        ficcao,
        poesia,
        terror,
        outros,
        totalConcluidos,
        totalLendo,
        totalQueroLer
    );
}

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

function atualizarProximaMedalha(porcentagemMeta) {
    if (metaMensal == 0) {
        texto_proxima_medalha.innerHTML = "Cadastre uma meta mensal no perfil para acompanhar suas conquistas.";
    } else if (porcentagemMeta >= 150) {
        texto_proxima_medalha.innerHTML = "Você desbloqueou a maior conquista do mês: 🥇 Guardiã das Histórias.";
    } else if (porcentagemMeta >= 100) {
        let falta = 150 - porcentagemMeta;
        texto_proxima_medalha.innerHTML = `Faltam ${falta.toFixed(0)}% para desbloquear 🥇 Guardiã das Histórias.`;
    } else if (porcentagemMeta >= 50) {
        let falta = 100 - porcentagemMeta;
        texto_proxima_medalha.innerHTML = `Faltam ${falta.toFixed(0)}% para desbloquear 🥈 Meta Concluída.`;
    } else {
        let falta = 50 - porcentagemMeta;
        texto_proxima_medalha.innerHTML = `Faltam ${falta.toFixed(0)}% para desbloquear 🥉 Leitora em Jornada.`;
    }
}

function criarGraficos(
    fantasia,
    romance,
    misterio,
    ficcao,
    poesia,
    terror,
    outros,
    concluidos,
    lendo,
    queroLer
) {
    let ctxGeneros = document.getElementById("grafico_generos");
    let ctxMeta = document.getElementById("grafico_meta");
    let ctxStatus = document.getElementById("grafico_status");

    if (graficoGeneros != undefined) {
        graficoGeneros.destroy();
    }

    if (graficoMeta != undefined) {
        graficoMeta.destroy();
    }

    if (graficoStatus != undefined) {
        graficoStatus.destroy();
    }

    let generosLabels = [];
    let generosDados = [];
    let generosCores = [];

    let generosBase = [
        { nome: "Fantasia", valor: fantasia, cor: "#B08A57" },
        { nome: "Romance", valor: romance, cor: "#6B2D3A" },
        { nome: "Mistério", valor: misterio, cor: "#2F4A3C" },
        { nome: "Ficção científica", valor: ficcao, cor: "#8C6A3E" },
        { nome: "Poesia", valor: poesia, cor: "#A89A8A" },
        { nome: "Terror", valor: terror, cor: "#4A1F2A" },
        { nome: "Outros", valor: outros, cor: "#5A4034" }
    ];

    for (let i = 0; i < generosBase.length; i++) {
        if (generosBase[i].valor > 0) {
            generosLabels.push(generosBase[i].nome);
            generosDados.push(generosBase[i].valor);
            generosCores.push(generosBase[i].cor);
        }
    }

    if (generosLabels.length == 0) {
        generosLabels = ["Nenhum livro concluído"];
        generosDados = [0];
        generosCores = ["#5A4034"];
    }

    graficoGeneros = new Chart(ctxGeneros, {
        type: "bar",
        data: {
            labels: generosLabels,
            datasets: [
                {
                    label: "Livros concluídos",
                    data: generosDados,
                    backgroundColor: generosCores,
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

carregarDashboard();