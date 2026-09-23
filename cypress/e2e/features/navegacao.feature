# language: pt
@navegacao
Funcionalidade: Navegação pelo portfólio
  Como recrutador visitando o site
  Quero chegar rápido a cada parte do portfólio
  Para avaliar o perfil do Gustavo sem perder tempo

  Contexto:
    Dado que o visitante abre o portfólio

  @web
  Esquema do Cenário: O menu principal leva à seção <nome>
    Quando ele clica em "<link>" no menu principal
    Então a seção "#<âncora>" aparece na tela
    E o endereço da página termina com "#<âncora>"

    Exemplos:
      | nome       | link       | âncora   |
      | Trabalhos  | Trabalhos  | work     |
      | Trajetória | Trajetória | career   |
      | Sobre      | Sobre      | about    |
      | Serviços   | Serviços   | services |
      | Contato    | Contato    | contact  |

  @web
  Cenário: O primeiro Tab oferece pular direto para o conteúdo
    Quando ele pressiona Tab
    Então o foco está no link "Pular para o conteúdo"

  @mobile
  Cenário: O menu mobile abre em tela cheia e prende o foco
    Quando ele abre o menu mobile
    Então o menu cobre a tela inteira
    E navegar com Tab mantém o foco dentro do menu
    Quando ele pressiona Esc
    Então o menu fecha
    E o foco volta para o botão "Abrir menu"

  @mobile
  Cenário: Um link do menu mobile leva à seção e libera a rolagem
    Quando ele abre o menu mobile
    E escolhe "Serviços" no menu mobile
    Então a seção "#services" aparece na tela
    E a página volta a rolar normalmente

  Cenário: Um endereço que não existe mostra a página 404 do site
    Quando ele acessa o endereço "/pagina-que-nao-existe"
    Então ele vê o título "Página não encontrada"
    E encontra o link "Voltar ao início"
