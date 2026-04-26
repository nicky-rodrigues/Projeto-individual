CREATE DATABASE Hiraeth;

USE Hiraeth;

CREATE TABLE Usuario (
	id INT PRIMARY KEY AUTO_INCREMENT,
	nome VARCHAR(50),
	email VARCHAR(50),
	senha VARCHAR(50)
);

INSERT INTO Usuario (nome, email, senha) VALUES
('Nicole Rodrigues', 'nicole.nascimento@gmail.com', '12324');