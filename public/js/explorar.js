// Vetor que guarda todos os livros retornados pelo banco.
// é usado tanto para filtrar por gênero quanto para fazer a busca.
let livrosCadastrados = [];

// Verifica se existe um usuário logado na sessão.
function verificarUsuarioLogado() {
    let idUsuario = sessionStorage.ID_USUARIO;

    if (idUsuario == undefined) {
        alert("Usuário não identificado. Faça login novamente.");
        window.location = "login.html";
        return false;
    }

    return true;
}

// Busca todos os livros cadastrados no banco pela rota /livros
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
            mostrarMensagemInicial();
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

// Mostra a mensagem inicial da página (aparece antes do usuário escolher um gênero ou fazer uma busca)
function mostrarMensagemInicial() {
    area_resultado.innerHTML = `
        <h3>Selecione um gênero</h3>
        <p>
            Encontramos ${livrosCadastrados.length} livro(s) cadastrado(s) no Hiraeth.
            Escolha um dos cards acima para ver os livros desse gênero ou use a busca para encontrar
            títulos, autores e gêneros.
        </p>
    `;
}

// Retorna a descrição de cada gênero
function obterDescricaoGenero(genero) {
    let nomesGeneros = [
        "Fantasia",
        "Romance",
        "Mistério",
        "Ficção científica",
        "Poesia",
        "Terror"
    ];

    let descricoesGeneros = [
        "Histórias de fantasia exploram mundos mágicos, reinos distantes, criaturas lendárias e jornadas épicas.",
        "O romance explora relações, sentimentos, encontros, escolhas e transformações emocionais.",
        "Histórias de mistério envolvem segredos, investigações, pistas e perguntas que prendem o leitor até o fim.",
        "A ficção científica explora tecnologia, futuro, sociedades alternativas e perguntas sobre a humanidade.",
        "A poesia trabalha sentimentos, imagens, memórias e ideias por meio de linguagem expressiva.",
        "O terror cria atmosferas de medo, tensão, mistério e estranhamento."
    ];

    for (let i = 0; i < nomesGeneros.length; i++) {
        if (genero == nomesGeneros[i]) {
            return descricoesGeneros[i];
        }
    }

    return "Gênero literário cadastrado na plataforma.";
}

// Filtra o vetor de livros cadastrados e retorna apenas os livros do gênero escolhido.
function filtrarLivrosPorGenero(genero) {
    let livrosFiltrados = [];

    for (let i = 0; i < livrosCadastrados.length; i++) {
        if (livrosCadastrados[i].genero == genero) {
            livrosFiltrados.push(livrosCadastrados[i]);
        }
    }

    return livrosFiltrados;
}

// Mostra na tela os livros de um gênero específico
function mostrarGenero(genero) {
    let livrosFiltrados = filtrarLivrosPorGenero(genero);
    let descricaoGenero = obterDescricaoGenero(genero);

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
        let cardsLivros = montarCardsLivros(livrosFiltrados);

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

// Monta os cards HTML dos livros recebidos como parâmetro.
function montarCardsLivros(listaLivros) {
    let cardsLivros = "";

    for (let i = 0; i < listaLivros.length; i++) {
        let livro = listaLivros[i];

        let notaMedia = livro.notaMedia;

        if (notaMedia == null) {
            notaMedia = "Sem nota";
        }

        let totalLeitores = livro.totalLeitores || 0;
        let totalConcluidos = livro.totalConcluidos || 0;

        cardsLivros += `
            <div class="cartao-livro">
                <h4>${livro.titulo}</h4>
                <p><strong>Autor:</strong> ${livro.autor}</p>

                <div class="info-livro-explorar">
                    <span class="etiqueta-genero">${livro.genero}</span>
                    <span>⭐ Nota média: ${notaMedia}</span>
                    <span>👥 ${totalLeitores} leitor(es)</span>
                    <span>📚 ${totalConcluidos} concluído(s)</span>
                </div>
            </div>
        `;
    }

    return cardsLivros;
}

// Chamada quando o arquivo JS é carregado, ele já busca os livros no banco.
carregarLivros();