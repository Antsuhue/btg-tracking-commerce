# BTG Tracking SDK

SDK para integração de tracking BTG em aplicações web.

## Requisitos

- ECMAScript 5 ou superior
- Dependência: BTG360 SDK

## Instalação

1. Inclua o script do BTG360 SDK
2. Inclua o script do BTG Tracking SDK

```html
<script src="path/to/btg360.js"></script>
<script src="path/to/tracking.js"></script>
```

## Uso

```javascript
// Inicialize o tracking com seu BTG ID e TCS Token
BtgTracking.start('seu-btg-id', 'seu-tcs-token');
```

## Funcionalidades

O SDK automaticamente:
- Rastreia informações do cliente quando disponível
- Rastreia visualizações de produto
- Envia dados para o BTG360

## Compatibilidade

O SDK é compatível com ECMAScript 5 e funciona nos seguintes navegadores:
- Internet Explorer 9+
- Chrome 
- Firefox
- Safari
- Edge

## Tratamento de Erros

O SDK inclui tratamento robusto de erros e vai:
- Verificar dependências necessárias
- Validar parâmetros obrigatórios
- Tratar timeouts e erros de rede
- Logar erros no console quando necessário

## Configuração

As configurações padrão incluem:
- Timeout de requisições: 30 segundos
- Endpoint de produtos: https://storefront-api.fbits.net/graphql

## Suporte

Para suporte ou dúvidas, entre em contato com a equipe de desenvolvimento. 