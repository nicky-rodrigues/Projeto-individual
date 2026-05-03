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

carregarPerfil();