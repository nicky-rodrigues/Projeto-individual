// Vetor global que guarda todos os livros retornados pelo banco
// Ele começa vazio porque os livros só são carregados depois que a função carregarLivros() faz o fetch
// Esse vetor é importante porque evita precisar buscar no banco toda vez que o usuário clica em um gênero
let livrosCadastrados = [];


// Função responsável por verificar se existe um usuário logado
// A verificação é feita olhando o sessionStorage, onde o id do usuário foi salvo após o login
function verificarUsuarioLogado() {
    // Recupera o id do usuário salvo na sessão do navegador
    let idUsuario = sessionStorage.ID_USUARIO;

    // Se não existir idUsuario, significa que a pessoa não está logada
    if (idUsuario == undefined) {
        alert("Usuário não identificado. Faça login novamente.");

        // Redireciona o usuário para a tela de login para evitar acesso sem autenticação
        window.location = "login.html";

        // Retorna false para avisar às outras funções que o usuário não pode continuar
        return false;
    }

    // Se chegou até aqui, significa que existe um usuário logado
    return true;
}


// Função responsável por buscar todos os livros cadastrados no banco
// Ela é chamada assim que a página Explorar carrega
function carregarLivros() {
    // Antes de buscar os livros, verifica se o usuário está logado
    // Se verificarUsuarioLogado() retornar false, o return interrompe a função
    if (!verificarUsuarioLogado()) {
        return;
    }

    // Faz uma requisição GET para a rota /livros
    // Essa rota chama o back-end, que busca os livros no banco de dados
    fetch("/livros", {
        method: "GET"
    })

        // Primeiro then: recebe a resposta da requisição
        .then(function (resposta) {

            // resposta.ok verifica se a requisição deu certo
            // Exemplo: status 200 significa sucesso
            if (resposta.ok) {

                // Converte a resposta para JSON
                // O JSON será um vetor de livros retornado pelo back-end
                return resposta.json();

            } else {

                // Se a resposta não estiver ok, força cair no catch
                throw "Erro ao buscar livros.";
            }
        })

        // Segundo then: recebe o JSON já convertido
        // Aqui a variável livros representa todos os livros vindos do banco
        .then(function (livros) {

            // Guarda os livros no vetor global
            // Assim, outras funções podem usar esses dados sem fazer outro fetch
            livrosCadastrados = livros;

            // Depois de carregar os livros, mostra a mensagem inicial da página
            // Essa chamada ajuda a mostrar quantos livros existem cadastrados
            mostrarMensagemInicial();
        })

        // catch: executa se der erro no fetch ou em algum then
        .catch(function (erro) {
            console.log(erro);

            // Se der erro, substitui o conteúdo da área_resultado por uma mensagem amigável
            // Isso evita deixar a página vazia
            area_resultado.innerHTML = `
                <h3>Erro ao carregar livros</h3>
                <p>
                    Não foi possível buscar os livros cadastrados no banco de dados.
                    Verifique se a rota <strong>/livros</strong> está funcionando.
                </p>
            `;
        });
}


// Função que mostra a mensagem inicial da página
// Ela aparece antes do usuário escolher algum gênero
function mostrarMensagemInicial() {
    // area_resultado é uma div do HTML
    // O innerHTML permite trocar o conteúdo dessa div usando JavaScript
    area_resultado.innerHTML = `
        <h3>Selecione um gênero</h3>
        <p>
            Encontramos ${livrosCadastrados.length} livro(s) cadastrado(s) no Hiraeth.
            Escolha um dos cards acima para ver os livros desse gênero.
        </p>
    `;
}


// Função que retorna uma descrição textual para cada gênero
// Ela recebe o nome do gênero como parâmetro e devolve a descrição correspondente
function obterDescricaoGenero(genero) {

    // Vetor com os nomes dos gêneros disponíveis na plataforma
    let nomesGeneros = [
        "Fantasia",
        "Romance",
        "Mistério",
        "Ficção científica",
        "Poesia",
        "Terror"
    ];

    // Vetor com as descrições dos gêneros
    // A posição de cada descrição corresponde à posição do gênero no vetor nomesGeneros
    let descricoesGeneros = [
        "Histórias de fantasia exploram mundos mágicos, reinos distantes, criaturas lendárias e jornadas épicas.",
        "O romance explora relações, sentimentos, encontros, escolhas e transformações emocionais.",
        "Histórias de mistério envolvem segredos, investigações, pistas e perguntas que prendem o leitor até o fim.",
        "A ficção científica explora tecnologia, futuro, sociedades alternativas e perguntas sobre a humanidade.",
        "A poesia trabalha sentimentos, imagens, memórias e ideias por meio de linguagem expressiva.",
        "O terror cria atmosferas de medo, tensão, mistério e estranhamento."
    ];

    // Percorre o vetor de nomes dos gêneros
    // O objetivo é encontrar a posição em que o gênero recebido aparece
    for (let i = 0; i < nomesGeneros.length; i++) {

        // Compara o gênero recebido com o gênero da posição atual
        if (genero == nomesGeneros[i]) {

            // Quando encontra o gênero, retorna a descrição que está na mesma posição
            return descricoesGeneros[i];
        }
    }

    // Se o gênero não estiver nos vetores acima, retorna uma descrição padrão
    return "Gênero literário cadastrado na plataforma.";
}


// Função que filtra os livros cadastrados pelo gênero escolhido
// Ela recebe um gênero como parâmetro e retorna um novo vetor com apenas os livros daquele gênero
function filtrarLivrosPorGenero(genero) {
    // Cria um vetor vazio para guardar somente os livros que combinarem com o gênero
    let livrosFiltrados = [];

    // Percorre todos os livros carregados do banco
    for (let i = 0; i < livrosCadastrados.length; i++) {

        // Verifica se o gênero do livro atual é igual ao gênero escolhido pelo usuário
        if (livrosCadastrados[i].genero == genero) {

            // Se for igual, adiciona esse livro ao vetor de livros filtrados
            livrosFiltrados.push(livrosCadastrados[i]);
        }
    }

    // Retorna o vetor com os livros encontrados
    // Se nenhum livro for encontrado, retorna um vetor vazio
    return livrosFiltrados;
}


// Função chamada quando o usuário clica em um card de gênero no HTML
// Ex: onclick="mostrarGenero('Fantasia')"
function mostrarGenero(genero) {

    // Chama a função filtrarLivrosPorGenero() para buscar apenas os livros do gênero clicado
    // O resultado é guardado em livrosFiltrados
    let livrosFiltrados = filtrarLivrosPorGenero(genero);

    // Chama a função obterDescricaoGenero() para buscar a descrição do gênero clicado
    let descricaoGenero = obterDescricaoGenero(genero);

    // Verifica se nenhum livro foi encontrado para aquele gênero
    if (livrosFiltrados.length == 0) {

        // Se o vetor está vazio, mostra o nome do gênero, a descrição e uma mensagem avisando que ainda não há livros cadastrados
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

        // Se existem livros encontrados, chama montarCardsLivros().
        // Essa função transforma o vetor de livros em vários cards HTML
        let cardsLivros = montarCardsLivros(livrosFiltrados);

        // Depois de montar os cards, coloca tudo dentro da área_resultado
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


// Função que monta os cards HTML dos livros
// Ela recebe uma lista de livros como parâmetro e retorna uma string com vários cards
function montarCardsLivros(listaLivros) {

    // Variável que vai acumular o HTML de todos os cards
    // Começa vazia e vai recebendo conteúdo dentro do for
    let cardsLivros = "";

    // Percorre a lista de livros recebida como parâmetro
    for (let i = 0; i < listaLivros.length; i++) {

        // Guarda o livro atual em uma variável para facilitar a leitura do código
        let livro = listaLivros[i];

        // Pega a nota média do livro
        // Esse valor vem do back-end, calculado a partir da tabela Leitura
        let notaMedia = livro.notaMedia;

        // Se a nota média vier como null, significa que o livro ainda não tem avaliação
        if (notaMedia == null) {

            // Nesse caso, em vez de mostrar null, mostramos "Sem nota"
            notaMedia = "Sem nota";
        }

        // totalLeitores vem do banco
        // Se vier vazio, undefined ou null, o || 0 garante que será exibido 0
        let totalLeitores = livro.totalLeitores || 0;

        // totalConcluidos representa quantas leituras desse livro estão com status "Concluído"
        // O || 0 evita mostrar valor vazio na tela
        let totalConcluidos = livro.totalConcluidos || 0;

        // Adiciona o HTML de um card na variável cardsLivros
        // O += é usado porque queremos manter os cards anteriores e acrescentar o próximo
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

    // Depois que o for termina, retorna todos os cards montados
    // Essa string será usada dentro da função mostrarGenero()
    return cardsLivros;
}


// Chamada inicial do arquivo
// Assim que o JavaScript é carregado, ele executa carregarLivros()
// Isso faz a página buscar os livros no banco automaticamente
carregarLivros();