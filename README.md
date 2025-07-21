# BTG Tracking SDK 2.0

SDK de tracking BTG360 reestruturado com base no código original `btgTracking.js`, mantendo compatibilidade total com a API original.

## Principais Adaptações Realizadas

### 1. Arquitetura Modular
- **Antes**: Código em um único arquivo IIFE
- **Depois**: Estrutura modular com separação clara de responsabilidades

```
src/
├── config/
│   └── constants.js          # Configurações e constantes
├── utils/
│   ├── helpers.js            # Funções utilitárias
│   └── cookies.js            # Gerenciamento de cookies
├── api/
│   └── client.js             # Clientes de API
├── modules/
│   ├── tracking.js           # Geração de imagens de tracking
│   └── pageHandlers.js       # Handlers para diferentes páginas
├── core/
│   └── BtgTrackingSDK.js     # Classe principal do SDK
└── index.js                  # Ponto de entrada com compatibilidade
```

### 2. Compatibilidade com API Original

O SDK mantém 100% de compatibilidade com a API original:

```javascript
// API Original (ainda funciona)
window.BtgTracking.start(btgId, tcsToken);
window.BtgSend(btgId, 'client', data, categories, transactionId);

// Nova API (disponível)
import { BtgTrackingSDK } from './src/index.js';
const sdk = new BtgTrackingSDK();
await sdk.start(btgId, tcsToken);
```

### 3. Funcionalidades Implementadas

#### Geração de Imagens de Tracking
- ✅ Cliente (`__client.gif`)
- ✅ Produto (`__product.gif`)
- ✅ Carrinho (`__cart.gif`)
- ✅ Transação (`__order.gif`)
- ✅ Busca (`__search.gif`)
- ✅ Wishlist (`__wishlist.gif`)
- ✅ Warn Me (`__warnme.gif`)
- ✅ Módulo (`__module.gif`)

#### Gerenciamento de Cookies
- ✅ Cookie BID (`__bid`)
- ✅ Cookie UTMs (`__btgUtms`)
- ✅ Cookie Módulo (`__btgModule`)
- ✅ Singleton cookieParser

#### Roteamento de Páginas
- ✅ Página de produto (`/produto/`)
- ✅ Página de busca (`/busca`)
- ✅ Carrinho (Checkout Fbits e Storefront)
- ✅ Confirmação de pedido (ambos ambientes)
- ✅ Detecção automática de ambiente

#### APIs Integradas
- ✅ GraphQL para produtos
- ✅ API de carrinho (Fbits)
- ✅ API de cliente
- ✅ API de transações (Storefront)

### 4. Principais Melhorias

#### Estrutura de Código
- **Separação de responsabilidades**: Cada módulo tem uma responsabilidade específica
- **Reutilização**: Funções utilitárias compartilhadas entre módulos
- **Manutenibilidade**: Código mais fácil de manter e testar

#### Tratamento de Erros
- **Validações**: Validação de parâmetros em todas as funções
- **Try/catch**: Tratamento de erros em chamadas assíncronas
- **Mensagens descritivas**: Mensagens de erro mais claras

#### Performance
- **Singleton pattern**: Evita múltiplas instâncias do SDK
- **Lazy loading**: Carregamento sob demanda de recursos
- **Promises**: Uso de async/await para melhor controle de fluxo

### 5. Uso do SDK

#### Inicialização Básica
```javascript
// Usando a API global (compatibilidade)
await window.BtgTracking.start('123:456', 'tcs_token_here');

// Usando como módulo ES6
import { BtgTrackingSDK } from './src/index.js';
const sdk = new BtgTrackingSDK();
await sdk.start('123:456', 'tcs_token_here');
```

#### Enviando Eventos
```javascript
// Evento de cliente
window.BtgSend('123:456', 'client', [{
    email: 'cliente@exemplo.com',
    phone: '11999999999'
}]);

// Evento de produto
window.BtgSend('123:456', 'product', productData, categories);

// Evento de busca
window.BtgSend('123:456', 'search', [{ keyword: 'termo' }]);
```

#### Configuração Avançada
```javascript
const sdk = new BtgTrackingSDK({
    baseUrl: 'btg360.com.br',
    devUrl: false,
    customDomain: 'meudominio.com',
    cookieUnderBtg: false
});
```

### 6. Teste de Compatibilidade

Execute o arquivo `test_compatibility.html` em um servidor local para testar:

```bash
# Usando Python
python -m http.server 8000

# Usando Node.js
npx http-server

# Acesse: http://localhost:8000/test_compatibility.html
```

### 7. Validações Implementadas

#### Validação de Parâmetros
- ✅ Validação de formato de account (`/[0-9]:[0-9]/`)
- ✅ Validação de formato de TCS token (`/^tcs_[a-z0-9]+_[a-f0-9]{32}$/`)
- ✅ Sanitização de dados com `encodeURIComponent`
- ✅ Validação de arrays e objetos obrigatórios

#### Validação de Ambiente
- ✅ Detecção automática de ambiente (checkout vs storefront)
- ✅ Roteamento baseado em hostname e path
- ✅ Tratamento específico para cada tipo de página

### 8. Migração do Código Original

As principais mudanças do código original foram:

1. **Estrutura IIFE → Classes ES6**
2. **Variáveis globais → Propriedades de classe**
3. **Callbacks → Promises/async-await**
4. **Código inline → Módulos separados**
5. **Funções globais → Métodos de classe**

### 9. Compatibilidade com Browsers

O SDK suporta:
- ✅ Chrome/Edge (ES6 modules)
- ✅ Firefox (ES6 modules)
- ✅ Safari (ES6 modules)
- ⚠️ IE11 (requer transpilação)

### 10. Próximos Passos

- [ ] Adicionar testes unitários
- [ ] Implementar build process (webpack/rollup)
- [ ] Adicionar TypeScript definitions
- [ ] Implementar cache de produtos
- [ ] Adicionar métricas de performance

## Conclusão

A adaptação mantém 100% de compatibilidade com o código original `btgTracking.js` enquanto oferece uma estrutura mais robusta, modular e extensível para futuras implementações. 