# language: pt
@contato
Funcionalidade: Formulário de contato
  Como recrutador interessado no perfil
  Quero mandar uma mensagem sem sair do site
  Para começar uma conversa com o Gustavo

  Contexto:
    Dado que o visitante está no formulário de contato

  Cenário: Enviar sem preencher nada aponta os três campos obrigatórios
    Quando ele envia o formulário
    Então ele vê o erro "Informe seu nome (de 2 a 80 caracteres)."
    E ele vê o erro "Informe um e-mail válido."
    E ele vê o erro "Escreva pelo menos 10 caracteres (máximo de 2.000)."
    E o foco vai para o campo "Nome"

  Esquema do Cenário: Um campo inválido é apontado com uma mensagem clara (<caso>)
    Quando ele preenche o formulário com a massa "<massa>"
    E envia o formulário
    Então ele vê o erro "<erro>"

    Exemplos:
      | caso              | massa         | erro                                                |
      | nome curto        | nomeCurto     | Informe seu nome (de 2 a 80 caracteres).            |
      | e-mail sem arroba | emailInvalido | Informe um e-mail válido.                           |
      | mensagem curta    | mensagemCurta | Escreva pelo menos 10 caracteres (máximo de 2.000). |

  Cenário: Uma mensagem válida é enviada e o formulário é limpo
    Quando ele preenche o formulário com a massa "recrutadora"
    E passa alguns segundos lendo a página
    E envia o formulário
    Então ele vê a confirmação "Mensagem enviada! Vou responder no e-mail que você informou."
    E os campos do formulário ficam vazios

  Cenário: Mensagens demais em pouco tempo são bloqueadas com um aviso
    Dado que este visitante já enviou 5 mensagens nos últimos minutos
    Quando ele preenche o formulário com a massa "recrutadora"
    E passa alguns segundos lendo a página
    E envia o formulário
    Então ele vê o aviso "Muitas mensagens em pouco tempo. Tente de novo em alguns minutos."
