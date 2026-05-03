let livrosCadastrados = [];

function verificarUsuarioLogado() {
    let idUsuario = sessionStorage.ID_USUARIO;

    if (idUsuario == undefined) {
        alert("Usuário não identificado. Faça login novamente.");
        window.location = "login.html";
        return false;
    }

    return true;
}

function carregarLivros() {
    if (!verificarUsuarioLogado()) {
        return;
    }

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
            livrosCadastrados = livros;

            area_resultado.innerHTML = `
                <h3>Selecione um gênero</h3>
                <p>
                    Encontramos ${livrosCadastrados.length} livro(s) cadastrado(s) no Hiraeth.
                    Escolha um dos cards acima para ver os livros desse gênero.
                </p>
            `;
        })
        .catch(function (erro) {
            console.log(erro);

            area_resultado.innerHTML = `
                <h3>Erro ao carregar livros</h3>
                <p>
                    Não foi possível buscar os livros cadastrados no banco de dados.
                    Verifique se a rota <strong>/livros</strong> está funcionando.
                </p>
            `;
        });
}

function mostrarGenero(genero) {
    let livrosFiltrados = [];

    for (let i = 0; i < livrosCadastrados.length; i++) {
        if (livrosCadastrados[i].genero == genero) {
            livrosFiltrados.push(livrosCadastrados[i]);
        }
    }

    let descricaoGenero = "";

    if (genero == "Fantasia") {
        descricaoGenero = "Histórias de fantasia exploram mundos mágicos, reinos distantes, criaturas lendárias e jornadas épicas.";
    } else if (genero == "Romance") {
        descricaoGenero = "O romance explora relações, sentimentos, encontros, escolhas e transformações emocionais.";
    } else if (genero == "Mistério") {
        descricaoGenero = "Histórias de mistério envolvem segredos, investigações, pistas e perguntas que prendem o leitor até o fim.";
    } else if (genero == "Ficção científica") {
        descricaoGenero = "A ficção científica explora tecnologia, futuro, sociedades alternativas e perguntas sobre a humanidade.";
    } else if (genero == "Poesia") {
        descricaoGenero = "A poesia trabalha sentimentos, imagens, memórias e ideias por meio de linguagem expressiva.";
    } else if (genero == "Terror") {
        descricaoGenero = "O terror cria atmosferas de medo, tensão, mistério e estranhamento.";
    }

    if (livrosFiltrados.length == 0) {
        area_resultado.innerHTML = `
            <div class="genero-detalhe">
                <h3>${genero}</h3>
                <p>${descricaoGenero}</p>

                <p class="mensagem-sem-livros">
                    Ainda não há livros cadastrados neste gênero.
                    Quando algum usuário registrar uma leitura desse gênero, ela aparecerá aqui.
                </p>
            </div>
        `;
    } else {
        let cardsLivros = "";

        for (let i = 0; i < livrosFiltrados.length; i++) {
            let livro = livrosFiltrados[i];

            cardsLivros += `
                <div class="cartao-livro">
                    <h4>${livro.titulo}</h4>
                    <p><strong>Autor:</strong> ${livro.autor}</p>
                    <span class="etiqueta-genero">${livro.genero}</span>
                </div>
            `;
        }

        area_resultado.innerHTML = `
            <div class="genero-detalhe">
                <h3>${genero}</h3>
                <p>${descricaoGenero}</p>

                <div class="lista-livros">
                    ${cardsLivros}
                </div>
            </div>
        `;
    }
}

function buscarLivro() {
    let busca = input_busca.value.toLowerCase();

    if (busca == "") {
        area_resultado.innerHTML = `
            <h3>Selecione um gênero</h3>
            <p>
                Escolha um dos cards acima ou busque por título, autor ou gênero.
            </p>
        `;
        return;
    }

    let livrosEncontrados = [];

    for (let i = 0; i < livrosCadastrados.length; i++) {
        let titulo = livrosCadastrados[i].titulo.toLowerCase();
        let autor = livrosCadastrados[i].autor.toLowerCase();
        let genero = livrosCadastrados[i].genero.toLowerCase();

        if (titulo.indexOf(busca) >= 0 || autor.indexOf(busca) >= 0 || genero.indexOf(busca) >= 0) {
            livrosEncontrados.push(livrosCadastrados[i]);
        }
    }

    if (livrosEncontrados.length == 0) {
        area_resultado.innerHTML = `
            <div class="genero-detalhe">
                <h3>Resultado da busca</h3>
                <p class="mensagem-sem-livros">
                    Nenhum livro encontrado para "${input_busca.value}".
                </p>
            </div>
        `;
    } else {
        let cardsLivros = "";

        for (let i = 0; i < livrosEncontrados.length; i++) {
            let livro = livrosEncontrados[i];

            cardsLivros += `
                <div class="cartao-livro">
                    <h4>${livro.titulo}</h4>
                    <p><strong>Autor:</strong> ${livro.autor}</p>
                    <span class="etiqueta-genero">${livro.genero}</span>
                </div>
            `;
        }

        area_resultado.innerHTML = `
            <div class="genero-detalhe">
                <h3>Resultado da busca</h3>
                <p>Livros encontrados para "${input_busca.value}".</p>

                <div class="lista-livros">
                    ${cardsLivros}
                </div>
            </div>
        `;
    }
}

carregarLivros();