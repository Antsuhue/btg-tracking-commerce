# SDK Btg Commerce

## 1. Descrição

A **SDK Btg Commerce** tem como objetivo simplificar o processo de integração entre o Wake Experience e o Wake Commerce, facilitando a coleta e envio de dados relevantes de navegação, produto, carrinho e transação para a plataforma BTG360.

## 2. Requisitos

Para utilizar esta SDK, são necessários os seguintes dados:

* **BtgId** da conta de Wake Experience
* **Token** do Storefront de Wake Commerce

## 3. Como funciona

### Client

Durante a navegação do usuário, a SDK é executada continuamente para capturar o e-mail do cliente no momento do login.

* **Fonte de dados:** API de Login
* **Endpoint:** `https://checkout.{dominio-do-cliente}/api/Login/Get`

### Product

Ao acessar uma página de produto, o ID do produto é extraído da URL e, em seguida, são buscadas informações detalhadas via API GraphQL.

* **Fonte de dados:** API Storefront
* **Endpoint:** `https://storefront-api.fbits.net/graphql`
* **Ação:** Envio dos dados do produto ao banco do BTG360

### Cart

Na página de carrinho, a SDK coleta os IDs dos produtos presentes utilizando a API do carrinho.

* **Fonte de dados:** API do Carrinho
* **Endpoint:** `https://checkout.{dominio-do-cliente}/api/carrinho`

### Transaction

Durante a finalização da compra, o processo é semelhante ao do carrinho, com a adição da captura do ID da transação.

* **Fonte de dados:** API do Carrinho
* **Informação adicional:** ID da transação

## 4. Instalação

Adicione o seguinte trecho no `<head>` ou antes do fechamento do `<body>` do seu site:

```html
<script src="//i.btg360.com.br/btgTracking.js"></script>
<script>
  BtgTracking.start("{BTGID}":"{TokenStoreFront}");
</script>
```

**Observação:**
Para maior controle e flexibilidade, recomenda-se configurar esse script via Google Tag Manager (GTM) com um acionador definido para **todas as páginas**.

## 5. Tecnologias utilizadas

* **JavaScript** – Lógica da SDK e execução no navegador
* **GraphQL** – Integração com a API do Storefront Wake Commerce
* **Amazon S3** – Armazenamento e distribuição da SDK
