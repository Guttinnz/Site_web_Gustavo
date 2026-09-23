# language: pt
@qa-bot
Funcionalidade: QA-Bot, as perguntas frequentes
  Como visitante com uma dúvida rápida
  Quero respostas diretas sem precisar mandar mensagem
  Para decidir se vale a pena entrar em contato

  Contexto:
    Dado que o visitante abre o portfólio
    E abre o QA-Bot

  Cenário: O QA-Bot responde a pergunta escolhida
    Quando ele pergunta "Que tipo de trabalho ele aceita?"
    Então o QA-Bot responde com um texto que contém "desde que o trabalho seja remoto"
    E o foco vai para a próxima pergunta disponível

  Cenário: O QA-Bot explica como este site é testado
    Quando ele pergunta "Como este site é testado?"
    Então o QA-Bot responde com um texto que contém "testes automatizados em Cypress"

  Cenário: Esc fecha o QA-Bot e devolve o foco
    Quando ele pressiona Esc
    Então o QA-Bot fecha
    E o foco volta para o botão "Abrir perguntas frequentes"
