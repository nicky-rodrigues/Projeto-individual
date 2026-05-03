CREATE DATABASE Hiraeth;

USE Hiraeth;

CREATE TABLE Usuario (
	id INT PRIMARY KEY AUTO_INCREMENT,
	nome VARCHAR(50),
	email VARCHAR(50),
	senha VARCHAR(50)
);

CREATE TABLE Perfil (
    idPerfil INT PRIMARY KEY AUTO_INCREMENT,
    fkUsuario INT NOT NULL,
    bio VARCHAR(255),
    generoFavorito VARCHAR(45),
    livroFavorito VARCHAR(100),
    metaMensal INT,

    CONSTRAINT fk_perfil_usuario
        FOREIGN KEY (fkUsuario) REFERENCES Usuario(id)
);

CREATE TABLE Livro (
    idLivro INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(120) NOT NULL,
    autor VARCHAR(100) NOT NULL,
    genero VARCHAR(45) NOT NULL
);

CREATE TABLE Leitura (
    idLeitura INT PRIMARY KEY AUTO_INCREMENT,
    fkUsuario INT NOT NULL,
    fkLivro INT NOT NULL,
    statusLeitura VARCHAR(45) NOT NULL,
    nota INT,
    comentario VARCHAR(255),
    dataRegistro DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_leitura_usuario
        FOREIGN KEY (fkUsuario) REFERENCES Usuario(id),

    CONSTRAINT fk_leitura_livro
        FOREIGN KEY (fkLivro) REFERENCES Livro(idLivro),

    CONSTRAINT chk_status_leitura
        CHECK (statusLeitura IN ('Lendo', 'Concluído', 'Quero ler')),

    CONSTRAINT chk_nota
        CHECK (nota BETWEEN 1 AND 5)
);

CREATE TABLE Publicacao (
    idPublicacao INT PRIMARY KEY AUTO_INCREMENT,
    fkUsuario INT NOT NULL,
    fkLivro INT,
    tipoPublicacao VARCHAR(45) NOT NULL,
    texto VARCHAR(500) NOT NULL,
    dataPublicacao DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_publicacao_usuario
        FOREIGN KEY (fkUsuario) REFERENCES Usuario(id),

    CONSTRAINT fk_publicacao_livro
        FOREIGN KEY (fkLivro) REFERENCES Livro(idLivro),

    CONSTRAINT chk_tipo_publicacao
        CHECK (tipoPublicacao IN ('resenha', 'avaliacao', 'citacao', 'meta', 'atualizacao'))
);

CREATE TABLE Curtida (
    idCurtida INT PRIMARY KEY AUTO_INCREMENT,
    fkUsuario INT NOT NULL,
    fkPublicacao INT NOT NULL,
    dataCurtida DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_curtida_usuario
        FOREIGN KEY (fkUsuario) REFERENCES Usuario(id),

    CONSTRAINT fk_curtida_publicacao
        FOREIGN KEY (fkPublicacao) REFERENCES Publicacao(idPublicacao)
);

CREATE TABLE Comentario (
    idComentario INT PRIMARY KEY AUTO_INCREMENT,
    fkUsuario INT NOT NULL,
    fkPublicacao INT NOT NULL,
    texto VARCHAR(255) NOT NULL,
    dataComentario DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_comentario_usuario
        FOREIGN KEY (fkUsuario) REFERENCES Usuario(id),

    CONSTRAINT fk_comentario_publicacao
        FOREIGN KEY (fkPublicacao) REFERENCES Publicacao(idPublicacao)
);