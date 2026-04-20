let titulos = [
    "Trono de Vidro",
    "Quarta Asa",
    "Percy Jackson"
];

let imagens = [
    "./assets/imgs/trono de vidro 3.png",
    "./assets/imgs/quarta asa 3.png",
    "./assets/imgs/percy jackson 3.png"
];

let descricoes = [
    "Não se trata apenas de sobreviver, mas de sacudir as estrelas e forjar o próprio destino através do amor, da magia e da vingança.",
    "Um dragão sem seu cavaleiro é uma tragédia. Um cavaleiro sem seu dragão está morto",
    "Entre monstros, profecias e segredos do mundo antigo, Percy Jackson embarca em uma aventura onde coragem e lealdade fazem toda a diferença."
];

let posicao_atual = 0;

function mostrar_livro(){
    book_image.src = imagens[posicao_atual];
    book_title.innerHTML = titulos[posicao_atual];
    book_description.innerHTML = descricoes[posicao_atual]
}

function avancar(){
    posicao_atual++;

    if(posicao_atual>2){
        posicao_atual = 0;
    }
    mostrar_livro()
}

function voltar(){
    posicao_atual--;

    if(posicao_atual<0){
        posicao_atual = 2
    }
    mostrar_livro()
}
mostrar_livro();