let titulos = [
    "Trono de Vidro",
    "Quarta Asa",
    "Percy Jackson",
    "Acotar",
    "Harry Potter"
];

let imagens = [
    "./assets/imgs/trono de vidro 3.png",
    "./assets/imgs/quarta asa 3.png",
    "./assets/imgs/percy jackson 3.png",
    "./assets/imgs/acotar.png",
    "./assets/imgs/harry potter.png"
];

let descricoes = [
    "Não se trata apenas de sobreviver, mas de sacudir as estrelas e forjar o próprio destino através do amor, da magia e da vingança.",
    "Um dragão sem seu cavaleiro é uma tragédia. Um cavaleiro sem seu dragão está morto",
    "Entre monstros, profecias e segredos do mundo antigo, Percy Jackson embarca em uma aventura onde coragem e lealdade fazem toda a diferença.",
    "No reino das fadas, nada é só beleza: por trás do encanto existem maldições, jogos de poder e um destino capaz de mudar tudo.",
    "Em um mundo de magia, segredos e batalhas contra a escuridão, Harry Potter descobre que o verdadeiro poder não está apenas nos feitiços, mas nas escolhas que faz ao longo do caminho."
];

// Controla qual livro está sendo exibido no momento
let posicao_atual = 0;


// Atualiza o conteúdo do card de recomendação na tela
// A posição atual define qual título, imagem e descrição serão mostrados
function mostrar_livro() {
    book_image.src = imagens[posicao_atual];
    book_title.innerHTML = titulos[posicao_atual];
    book_description.innerHTML = descricoes[posicao_atual];
}


// Avança para o próximo livro do carrossel
function avancar() {
    posicao_atual++;

    // Se passar do último livro, volta para o primeiro
    // Isso faz o carrossel ficar em ciclo
    if (posicao_atual > titulos.length - 1) {
        posicao_atual = 0;
    }

    // Depois de mudar a posição, atualiza o livro exibido na tela
    mostrar_livro();
}


// Volta para o livro anterior do carrossel
function voltar() {
    posicao_atual--;

    // Se estiver no primeiro livro e voltar, vai para o último
    // Isso mantém o carrossel funcionando em ciclo.
    if (posicao_atual < 0) {
        posicao_atual = titulos.length - 1;
    }

    // Depois de mudar a posição, atualiza o livro exibido na tela
    mostrar_livro();
}


// Chamada inicial
// Quando a página carrega, já mostra o primeiro livro do carrossel
mostrar_livro();