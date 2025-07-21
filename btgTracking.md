# BTG Tracking SDK - Documentação

## Visão Geral

O BTG Tracking é um SDK JavaScript para rastreamento de eventos de e-commerce, desenvolvido para integração com a plataforma BTG360. Este SDK permite o monitoramento de ações do usuário como visualização de produtos, carrinho, transações, buscas e interações com lista de desejos.

## Principais Funcionalidades

- **Rastreamento de Produtos**: Monitora visualizações de páginas de produto
- **Rastreamento de Carrinho**: Acompanha adições e modificações no carrinho
- **Rastreamento de Transações**: Registra compras finalizadas
- **Rastreamento de Clientes**: Identifica e registra dados do usuário
- **Rastreamento de Buscas**: Monitora termos de pesquisa
- **Lista de Desejos**: Rastreia produtos adicionados à wishlist
- **Avise-me**: Monitora solicitações de notificação de estoque

## Configuração

### Variáveis de Configuração

```javascript
var _endpointProduct = "https://storefront-api.fbits.net/graphql";
var _url = "btg360.com.br";
var _urlImageDev = false; // URL para ambiente de desenvolvimento
```

### Inicialização

```javascript
// Inicializar o tracking
BtgTracking.start(btgId, tcsToken);
```

**Parâmetros:**
- `btgId`: ID da conta BTG no formato "número:número" (ex: "123:456")
- `tcsToken`: Token de acesso TCS no formato "tcs_[string]_[hash32]"

## Estrutura do Código

### Funções Utilitárias

#### Geração de UUID e Números Aleatórios
- `generateUUID()`: Gera um UUID único
- `getRand(strBoolean)`: Gera número aleatório

#### Gerenciamento de Cookies
- `setCookie(name, value, days)`: Define um cookie
- `getCookie(name)`: Recupera valor de um cookie
- `removeCookie(value)`: Remove um cookie
- `getCookieBid()`: Obtém ou cria o cookie de identificação do browser

#### Validação de Dados
- `validateAccount(account)`: Valida formato do ID da conta
- `validateTcsToken(tcsToken)`: Valida formato do token TCS
- `validateItem(item)`: Valida e codifica itens para URL
- `validateArrayItems(items)`: Valida arrays de itens

### Eventos de Rastreamento

#### 1. Rastreamento de Cliente
```javascript
generateClientImage(items, btgId)
```
**Parâmetros do item:**
- `email`: Email do cliente
- `usid`: ID único do usuário
- `facebookId`: ID do Facebook
- `webPushId`: ID para web push
- `phone`: Telefone
- `token`: Token de autenticação
- `encrypt`: Dados criptografados
- `isOptin`: Consentimento para comunicação (padrão: true)

#### 2. Rastreamento de Produto/Carrinho
```javascript
generateCartAndProductImage(items, categories, btgId, event)
```
**Parâmetros do item:**
- `productId`: ID do produto
- `productName`: Nome do produto
- `prices.priceTables[0].price`: Preço do produto
- `productBrand.name`: Nome da marca
- `email`: Email do cliente (opcional)

**Categorias:**
- `categories[0].name`: Departamento
- `categories[1].name`: Categoria
- `categories[2].name`: Subcategoria

#### 3. Rastreamento de Transação
```javascript
generateTransactionImage(items, btgId, categories, pedido)
```
**Parâmetros adicionais:**
- `pedido`: ID do pedido/transação

#### 4. Rastreamento de Busca
```javascript
generateSearchImage(items, btgId)
```
**Parâmetros do item:**
- `keyword`: Termo de busca
- `minSizeChar`: Tamanho mínimo da palavra (padrão: 2)

#### 5. Rastreamento de Lista de Desejos
```javascript
generateWishlistImage(items, btgId)
```
**Parâmetros do item:**
- `productId`: ID do produto
- `active`: Status ativo (1 ou 0)

#### 6. Rastreamento de Avise-me
```javascript
generateWarnMeImage(items, btgId)
```
**Parâmetros do item:**
- `productId`: ID do produto
- `active`: Status ativo (1 ou 0)

### Integração com APIs

#### Obtenção de Dados do Cliente
```javascript
getClient()
```
Busca informações do cliente logado através de:
- API de Login: `/api/Login/Get`
- GraphQL Customer Query (fallback)

#### Obtenção de Dados do Produto
```javascript
getProduct(productId, tcsToken, typeId)
```
Consulta produtos via GraphQL com os seguintes dados:
- ID e nome do produto
- Marca
- Categorias
- Preços

#### Obtenção de Produtos do Carrinho
- `getCartProductsFbits()`: Para checkout Fbits
- `getCartProductsSF()`: Para checkout StoreFront

### Funcionalidades Automáticas

#### Processamento de UTMs
- Captura parâmetros UTM da URL
- Armazena em cookie `__btgUtms` por 2 dias
- Parâmetros suportados: utm_source, utm_medium, utm_term, utm_content, utm_campaign, utm_adContent, utm_uid, utm_email, utm_keyword

#### Processamento de Módulos
- Captura parâmetro `btg_module` da URL
- Armazena em cookie `__btgModule` por 1 dia

#### Processamento de USID
- Captura parâmetro `btg_source` da URL
- Gera evento de cliente automaticamente

## Detecção Automática de Páginas

### Página de Produto
- **Padrão**: `/produto/`
- **Ação**: Extrai ID do produto da URL e envia evento de visualização

### Página de Checkout
- **Fbits**: `checkout.domain.com/`
- **StoreFront**: `domain.com/checkout`
- **Ação**: Envia eventos de carrinho para cada produto

### Página de Confirmação
- **Padrão**: `/Confirmacao`
- **Ação**: Envia eventos de transação e limpa cookies

### Página de Busca
- **Padrão**: `/busca`
- **Ação**: Extrai termo de busca e envia evento

## Interceptação de Funções

### Lista de Desejos
```javascript
// Intercepta função original
window.wishlistAddClick = function(...args) {
    const result = originalWishlistAddClick.apply(this, args);
    generateWishlistImage([{productId: produto.productId, active: true}], btgId);
    return result;
};
```

### Avise-me
```javascript
// Intercepta função original
window.backInStockOnClick = function(...args) {
    const result = originalBackInStockOnClick.apply(this, args);
    generateWarnMeImage([{productId: produto.productId, active: true}], btgId);
    return result;
};
```

## Parser de Cookies

O SDK inclui um parser de cookies singleton:

```javascript
const cookieParser = (() => {
    // Implementação singleton
    return {
        getInstance() {
            return {
                getAll(), // Retorna todos os cookies
                get(chave) // Retorna cookie específico
            };
        }
    };
})();
```

## Tratamento de Erros

O SDK inclui tratamento de erros para:
- Conta inválida ou não informada
- Token TCS inválido
- Eventos não definidos
- Falhas na geração de imagens de rastreamento
- Erros de API

## Cookies Utilizados

- `__bid`: ID único do browser (21900 dias)
- `__btgUtms`: Parâmetros UTM (2 dias)
- `__btgModule`: ID do módulo (1 dia)
- `sf_storefront_access_token`: Token de acesso StoreFront
- `sf_customer_access_token`: Token de acesso do cliente
- `bv_page`: Dados da página BeeViral

## Exemplo de Uso

```javascript
// Inicialização
BtgTracking.start("123:456", "tcs_example_1234567890abcdef1234567890abcdef");

// Envio manual de evento (se necessário)
BtgSend("123:456", "client", [{
    email: "cliente@exemplo.com",
    phone: "11999999999"
}], null, null);
```

## Considerações Técnicas

- O SDK utiliza imagens 1x1 pixel para envio de dados
- Suporta ambientes de desenvolvimento através de `_urlImageDev`
- Compatível com checkout Fbits e StoreFront
- Processa automaticamente dados de sessão e identificação do usuário
- Implementa fallbacks para diferentes tipos de autenticação

## Domínios e Endpoints

- **Tracking**: `btg360.com.br`
- **GraphQL**: `https://storefront-api.fbits.net/graphql`
- **Imagens de tracking**: `https://c.btg360.com.br/`

## Notas Importantes

- O SDK deve ser inicializado após o carregamento da página
- Requer tokens TCS válidos para funcionar corretamente
- Automaticamente detecta o tipo de checkout (Fbits/StoreFront)
- Limpa cookies UTM e módulo após transações
- Suporta múltiplos ambientes através de configuração de domínio 