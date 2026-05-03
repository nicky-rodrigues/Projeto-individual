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
        } else if (leitura.statusLeitura == "Lendo") {
            totalLendo++;
        } else if (leitura.statusLeitura == "Quero ler") {
            totalQueroLer++;
        }

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
    }

    let porcentagemMeta = 0;

    if (metaMensal > 0) {
        porcentagemMeta = (totalConcluidos * 100) / metaMensal;
    }

    if (porcentagemMeta > 100) {
        porcentagemMeta = 100;
    }

    let statusMaisComum = calcularStatusMaisComum(totalConcluidos, totalLendo, totalQueroLer);

    total_lidos_mes.innerHTML = totalConcluidos;
    total_estante.innerHTML = totalEstante;
    progresso_card.innerHTML = porcentagemMeta.toFixed(0) + "%";

    texto_lidos.innerHTML = totalConcluidos;
    porcentagem_meta.innerHTML = porcentagemMeta.toFixed(0) + "% da meta concluída";

    status_mais_comum.innerHTML = statusMaisComum;

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

    graficoGeneros = new Chart(ctxGeneros, {
        type: "bar",
        data: {
            labels: ["Fantasia", "Romance", "Mistério", "Ficção científica", "Poesia", "Terror", "Outros"],
            datasets: [
                {
                    label: "Quantidade de livros",
                    data: [fantasia, romance, misterio, ficcao, poesia, terror, outros],
                    backgroundColor: [
                        "#B08A57",
                        "#6B2D3A",
                        "#2F4A3C",
                        "#8C6A3E",
                        "#A89A8A",
                        "#4A1F2A",
                        "#5A4034"
                    ],
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