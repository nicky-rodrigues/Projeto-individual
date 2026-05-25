CREATE DATABASE Hiraeth;

USE Hiraeth;

-- armazena os dados básicos de cadastro e login dos usuários da plataforma
CREATE TABLE Usuario (
	id INT PRIMARY KEY AUTO_INCREMENT,
	nome VARCHAR(50),
	email VARCHAR(50),
	senha VARCHAR(50)
);


-- armazena informações complementares do usuário (página de perfil)
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


-- armazena os livros que podem ser registrados, avaliados ou mencionados pelos usuários dentro da plataforma
CREATE TABLE Livro (
    idLivro INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(120) NOT NULL,
    autor VARCHAR(100) NOT NULL,
    genero VARCHAR(45) NOT NULL
);


-- responsável por registrar a jornada de leitura do usuário (página de registro)
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


-- representa os conteúdos que os usuários criam dentro da rede social (feed)
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


-- registra as curtidas feitas pelos usuários nas publicações (feed)
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


-- armazena os comentários feitos pelos usuários nas publicações (feed)
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

-- armazena as conquistas mensais dos usuários (parte da gameficação)
CREATE TABLE Conquista (
    idConquista INT PRIMARY KEY AUTO_INCREMENT,
    fkUsuario INT NOT NULL,
    mesReferencia INT NOT NULL,
    anoReferencia INT NOT NULL,
    tipoMedalha VARCHAR(45) NOT NULL,
    percentualMeta DECIMAL(5,2),
    livrosConcluidos INT,
    metaMensal INT,
    dataConquista DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conquista_usuario
        FOREIGN KEY (fkUsuario) REFERENCES Usuario(id),
    CONSTRAINT chk_tipo_medalha
        CHECK (tipoMedalha IN ('bronze', 'prata', 'ouro')),
    CONSTRAINT unq_conquista_usuario_mes
        UNIQUE (fkUsuario, mesReferencia, anoReferencia)
);

UPDATE Leitura
SET 
    statusLeitura = 'Concluído',
    nota = 5,
    comentario = 'Finalizei e gostei muito.'
WHERE idLeitura = 1
AND fkUsuario = 1;
use Hiraeth;