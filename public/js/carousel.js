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

let posicao_atual = 0;

function mostrar_livro() {
    book_image.src = imagens[posicao_atual];
    book_title.innerHTML = titulos[posicao_atual];
    book_description.innerHTML = descricoes[posicao_atual]
}

function avancar() {
    posicao_atual++;

    if (posicao_atual > 4) {
        posicao_atual = 0;
    }
    mostrar_livro()
}

function voltar() {
    posicao_atual--;

    if (posicao_atual < 0) {
        posicao_atual = 4
    }
    mostrar_livro()
}
mostrar_livro();