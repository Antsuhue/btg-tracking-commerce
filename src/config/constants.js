/**
 * Configurações e constantes do BTG Tracking SDK
 */
export const CONFIG = {
  BASE_URL: 'btg360.com.br',
  COOKIE_EXPIRY_DAYS: 21900,
  UTM_COOKIE_EXPIRY_DAYS: 2,
  MODULE_COOKIE_EXPIRY_DAYS: 1,
  MIN_SEARCH_CHARS: 2,
  IMAGE_SIZE: { width: 1, height: 1 },
  PRODUCT_ENDPOINT: (hostname) => `https://${hostname.replace('checkout', 'www')}/graphql`,
};

export const COOKIE_NAMES = {
  BID: '__bid',
  UTMS: '__btgUtms',
  MODULE: '__btgModule',
  TCS_TOKEN: 'sf_storefront_access_token',
  CUSTOMER_TOKEN: 'sf_customer_access_token',
  LAST_PRODUCT: 'btg_lastprod',
  CHECKOUT_ID: 'carrinho-id',
};

export const QUERY_PARAMS = {
  BTG_SOURCE: 'btg_source',
  BTG_MODULE: 'btg_module',
  CHECKOUT_ID: 'checkoutId',
  BUSCA: 'busca',
  UTM_PARAMS: [
    'utm_source',
    'utm_medium',
    'utm_term',
    'utm_content',
    'utm_campaign',
    'utm_adContent',
    'utm_uid',
    'utm_email',
    'utm_keyword',
  ],
};

export const EVENTS = {
  PRODUCT: 'product',
  CART: 'cart',
  CLIENT: 'client',
  TRANSACTION: 'transaction',
  SEARCH: 'search',
  WISHLIST: 'wishlist',
  WARNME: 'warnme',
  EMAIL: 'email',
  ORDER: 'order',
};

export const ENDPOINTS = {
  CHECKOUT_API: '/api/Login/Get',
  CART_API: '/api/carrinho',
  GRAPHQL: '/graphql',
  CLIENT_GIF: '__client.gif',
  PRODUCT_GIF: '__product.gif',
  CART_GIF: '__cart.gif',
  ORDER_GIF: '__order.gif',
  SEARCH_GIF: '__search.gif',
  WISHLIST_GIF: '__wishlist.gif',
  WARNME_GIF: '__warnme.gif',
  MODULE_GIF: '__module.gif',
};

export const REGEX_PATTERNS = {
  ACCOUNT: /[0-9]:[0-9]/g,
  TCS_TOKEN: /^tcs_[a-z0-9]+_[a-f0-9]{32}$/g,
  PRICE_CLEAN: /[a-zA-Z\$\s]/g,
  PRICE_COMMA: /,/g,
};

export const BLACKLIST_VALUES = ['undefined', 'null'];

export const GRAPHQL_QUERIES = {
  CUSTOMER: `query Customer($customerAccessToken: String!) {
    data: customer(customerAccessToken: $customerAccessToken) {
      id
      email
      customerName
      companyName
      customerType
      cnpj
      cpf
      phoneNumber
    }
  }`,
  
  PRODUCT: (typeId, productId) => `query Query { 
    products(first: 50, filters: { 
      ${typeId}: ${parseInt(productId, 10)} 
    }) { 
      edges { node { 
        productId productName productBrand { name } 
        productCategories { name } 
        prices { priceTables { price } } 
      } } 
    } 
  }`,
  
  CHECKOUT: `query Checkout($checkoutId: String!) {
    data: checkout(checkoutId:$checkoutId) {
      checkoutId
      url
      products {
        name
        productAttributes {
          name
          value
          type
        }
        listPrice
        price
        ajustedPrice
        productId
        productVariantId
        imageUrl
        quantity
        customization{
          id
          values{
            cost
            name
            value
          }
        }
      }
      shippingFee
      subtotal
      total
    }
  }`,
  
  TRANSACTION: `query Checkout($checkoutId: String!) {
    data: checkout(checkoutId: $checkoutId) {
      checkoutId
      completed
      cep
      orders {
        date
        orderStatus
        orderId
        totalValue
        discountValue
        shippingValue
        products {
          productVariantId
          imageUrl
          name
          quantity
          value
          attributes {
            name
            value
          }
        }
      }
      subtotal
      discount
      shippingFee
      paymentFees
      total
    }
  }`,
};

export const PATHS = {
  CHECKOUT_ROOT: '/',
  CONFIRMATION: '/Confirmacao',
  PRODUCT: '/produto/',
  SEARCH: '/busca',
  CHECKOUT: 'checkout',
  CONFIRMATION_SF: 'confirmation',
};

export const SUBDOMAINS = {
  CLIENT: 'c',
  PRODUCT: 'p',
  SEARCH: 's',
  TRANSACTION: 't',
  CART: 'cart',
  WISHLIST: 'w',
  WARNME: 'warn',
  MODULE: 'm',
}; 