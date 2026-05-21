let perfilExiste = false;

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

                let perfil = dados[0];

                bio_exibida.innerHTML = perfil.bio;
                genero_exibido.innerHTML = perfil.generoFavorito;
                livro_exibido.innerHTML = perfil.livroFavorito;
                meta_exibida.innerHTML = perfil.metaMensal + " livros";

                select_genero.value = perfil.generoFavorito;
                input_livro.value = perfil.livroFavorito;
                input_meta.value = perfil.metaMensal;
                input_bio.value = perfil.bio;
            } else {
                perfilExiste = false;

                bio_exibida.innerHTML = "Você ainda não cadastrou uma bio literária.";
                genero_exibido.innerHTML = "-";
                livro_exibido.innerHTML = "-";
                meta_exibida.innerHTML = "-";

                select_genero.value = "";
                input_livro.value = "";
                input_meta.value = "";
                input_bio.value = "";
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

    if (genero == "") {
        alert("Selecione seu gênero favorito.");
        return;
    }

    if (livro == "") {
        alert("Digite seu livro favorito.");
        return;
    }

    if (meta == "") {
        alert("Digite sua meta do mês.");
        return;
    }

    if (meta <= 0) {
        alert("A meta do mês precisa ser maior que zero.");
        return;
    }

    if (bio == "") {
        alert("Escreva uma bio literária.");
        return;
    }

    if (perfilExiste) {
        atualizarPerfil(idUsuario, bio, genero, livro, meta);
    } else {
        cadastrarPerfil(idUsuario, bio, genero, livro, meta);
    }
}

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

function carregarConquistaPerfil() {
    let idUsuario = sessionStorage.ID_USUARIO;
    let meta = Number(input_meta.value);

    if (idUsuario == undefined) {
        return;
    }

    if (meta == 0 || input_meta.value == "") {
        atualizarConquistaPerfil(0, 0);
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
            let totalConcluidos = 0;

            for (let i = 0; i < leituras.length; i++) {
                if (leituras[i].statusLeitura == "Concluído") {
                    totalConcluidos++;
                }
            }

            let porcentagemMeta = 0;

            if (meta > 0) {
                porcentagemMeta = (totalConcluidos * 100) / meta;
            }

            atualizarConquistaPerfil(porcentagemMeta, meta);
            salvarConquistaDoMesPerfil(porcentagemMeta, totalConcluidos, meta);
        })
        .catch(function (erro) {
            console.log("Erro ao carregar conquista do perfil:", erro);
        });
}

function atualizarConquistaPerfil(porcentagemMeta, meta) {
    if (meta == 0) {
        medalha_perfil.innerHTML = "🔒";
        titulo_medalha_perfil.innerHTML = "Sem meta cadastrada";
        descricao_medalha_perfil.innerHTML = "Cadastre uma meta mensal para acompanhar suas conquistas.";
        progresso_medalha_perfil.innerHTML = "0%";
    } else if (porcentagemMeta >= 150) {
        medalha_perfil.innerHTML = "🥇";
        titulo_medalha_perfil.innerHTML = "Guardiã das Histórias";
        descricao_medalha_perfil.innerHTML = "Você ultrapassou sua meta mensal de leitura.";
        progresso_medalha_perfil.innerHTML = porcentagemMeta.toFixed(0) + "%";
    } else if (porcentagemMeta >= 100) {
        medalha_perfil.innerHTML = "🥈";
        titulo_medalha_perfil.innerHTML = "Meta Concluída";
        descricao_medalha_perfil.innerHTML = "Você concluiu sua meta mensal de leitura.";
        progresso_medalha_perfil.innerHTML = porcentagemMeta.toFixed(0) + "%";
    } else if (porcentagemMeta >= 50) {
        medalha_perfil.innerHTML = "🥉";
        titulo_medalha_perfil.innerHTML = "Leitora em Jornada";
        descricao_medalha_perfil.innerHTML = "Você já passou da metade da sua meta mensal.";
        progresso_medalha_perfil.innerHTML = porcentagemMeta.toFixed(0) + "%";
    } else {
        medalha_perfil.innerHTML = "🔒";
        titulo_medalha_perfil.innerHTML = "Medalha bloqueada";
        descricao_medalha_perfil.innerHTML = "Continue registrando leituras concluídas para desbloquear sua conquista.";
        progresso_medalha_perfil.innerHTML = porcentagemMeta.toFixed(0) + "%";
    }
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

function salvarConquistaDoMesPerfil(porcentagemMeta, livrosConcluidos, meta) {
    let idUsuario = sessionStorage.ID_USUARIO;

    if (idUsuario == undefined) {
        return;
    }

    if (meta == 0) {
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
            metaMensalServer: meta
        })
    })
        .then(function (resposta) {
            if (resposta.ok) {
                carregarResumoConquistas();
                carregarHistoricoConquistas();
            }
        });
}

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
            let ouro = 0;
            let prata = 0;
            let bronze = 0;

            for (let i = 0; i < resumo.length; i++) {
                if (resumo[i].tipoMedalha == "ouro") {
                    ouro = Number(resumo[i].quantidade);
                } else if (resumo[i].tipoMedalha == "prata") {
                    prata = Number(resumo[i].quantidade);
                } else if (resumo[i].tipoMedalha == "bronze") {
                    bronze = Number(resumo[i].quantidade);
                }
            }

            let pontuacao = (ouro * 3) + (prata * 2) + bronze;

            total_ouro.innerHTML = ouro;
            total_prata.innerHTML = prata;
            total_bronze.innerHTML = bronze;
            pontuacao_pessoal.innerHTML = pontuacao;
        })
        .catch(function (erro) {
            console.log("Erro ao carregar resumo de conquistas:", erro);
        });
}

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
            lista_historico_conquistas.innerHTML = "";

            if (historico.length == 0) {
                lista_historico_conquistas.innerHTML = `
                    <p>Você ainda não possui conquistas salvas no histórico.</p>
                `;
                return;
            }

            for (let i = 0; i < historico.length; i++) {
                let conquista = historico[i];

                let medalhaEmoji = "";
                let nomeMedalha = "";

                if (conquista.tipoMedalha == "ouro") {
                    medalhaEmoji = "🥇";
                    nomeMedalha = "Guardiã das Histórias";
                } else if (conquista.tipoMedalha == "prata") {
                    medalhaEmoji = "🥈";
                    nomeMedalha = "Meta Concluída";
                } else if (conquista.tipoMedalha == "bronze") {
                    medalhaEmoji = "🥉";
                    nomeMedalha = "Leitora em Jornada";
                }

                let nomeMes = obterNomeMes(conquista.mesReferencia);

                lista_historico_conquistas.innerHTML += `
                    <div class="item-historico-conquista">
                        <div>
                            <strong>${medalhaEmoji} ${nomeMedalha}</strong>
                            <p>${nomeMes}/${conquista.anoReferencia}</p>
                        </div>

                        <span>${Number(conquista.percentualMeta).toFixed(0)}%</span>
                    </div>
                `;
            }
        })
        .catch(function (erro) {
            console.log("Erro ao carregar histórico de conquistas:", erro);
        });
}

function obterNomeMes(numeroMes) {
    if (numeroMes == 1) {
        return "Janeiro";
    } else if (numeroMes == 2) {
        return "Fevereiro";
    } else if (numeroMes == 3) {
        return "Março";
    } else if (numeroMes == 4) {
        return "Abril";
    } else if (numeroMes == 5) {
        return "Maio";
    } else if (numeroMes == 6) {
        return "Junho";
    } else if (numeroMes == 7) {
        return "Julho";
    } else if (numeroMes == 8) {
        return "Agosto";
    } else if (numeroMes == 9) {
        return "Setembro";
    } else if (numeroMes == 10) {
        return "Outubro";
    } else if (numeroMes == 11) {
        return "Novembro";
    } else if (numeroMes == 12) {
        return "Dezembro";
    } else {
        return "Mês";
    }
}

carregarPerfil();