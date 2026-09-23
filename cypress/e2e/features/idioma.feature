# language: pt
@idioma
Funcionalidade: Site em português e inglês
  Como recrutador de uma empresa internacional
  Quero ler o portfólio em inglês
  Para avaliar o perfil sem barreira de idioma

  Cenário: O visitante troca o site para inglês
    Dado que o visitante abre o portfólio
    Quando ele escolhe o idioma "EN"
    Então o título principal diz "Software Engineer"
    E a página é marcada como idioma "en"
    E o título da aba é "Gustavo Bueno | Software Engineer — Quality & Automation"

  Cenário: A escolha de idioma é lembrada na próxima visita
    Dado que o visitante já escolheu o idioma "EN" antes
    Quando ele abre o portfólio
    Então o título principal diz "Software Engineer"
    E a página é marcada como idioma "en"

  Cenário: O site guarda só a preferência de idioma no navegador
    Dado que o visitante abre o portfólio
    Quando ele escolhe o idioma "EN"
    Então o armazenamento local tem apenas a chave "gb-lang" com o valor "en"
