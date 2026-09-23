# language: pt
@recrutador
Funcionalidade: O que um recrutador procura no portfólio
  Como recrutador avaliando o Gustavo
  Quero encontrar CV, recomendações, contatos e provas do trabalho
  Para decidir se chamo para uma entrevista

  Contexto:
    Dado que o visitante abre o portfólio

  Cenário: O recrutador baixa o CV
    Quando ele procura o link "Baixar CV"
    Então o link entrega um PDF que existe

  Cenário: O recrutador lê recomendações reais
    Então ele encontra 5 recomendações, cada uma com autor e cargo
    E um link para conferir as recomendações no LinkedIn

  Cenário: O recrutador chama o Gustavo no WhatsApp
    Quando ele procura o link "WhatsApp" no contato
    Então o link abre a conversa com o número "5555991398135" em uma nova aba

  Cenário: O recrutador confere como o site é testado pelo selo do rodapé
    Quando ele clica no selo "Este site é testado"
    Então ele chega à página "Este site é testado"
    E vê quantos testes automatizados o site tem
