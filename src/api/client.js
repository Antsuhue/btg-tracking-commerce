/**
 * Cliente de API para o BTG Tracking SDK
 */
import { ENDPOINTS, GRAPHQL_QUERIES, CONFIG, PATHS } from '../config/constants.js';
import { buildEndpoint, extractProductIdFromImageUrl, cleanPhone } from '../utils/helpers.js';
import { getCustomerAccessToken, getBvPageData, getTcsToken, cookieParser } from '../utils/cookies.js';

/**
 * Classe para gerenciar chamadas de API
 */
export class ApiClient {
  constructor(hostname) {
    this.hostname = hostname;
    this.graphqlEndpoint = `https://${hostname}/graphql`;
    this.productGraphqlEndpoint = CONFIG.PRODUCT_ENDPOINT(hostname);
  }

  /**
   * Executa uma requisição fetch
   * @param {string} url - URL da requisição
   * @param {Object} options - Opções da requisição
   * @returns {Promise} Promise da requisição
   */
  async request(url, options = {}) {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Executa uma query GraphQL
   * @param {string} query - Query GraphQL
   * @param {Object} variables - Variáveis da query
   * @param {string} endpoint - Endpoint GraphQL
   * @param {string} tcsToken - Token TCS
   * @returns {Promise} Promise da query
   */
  async graphqlQuery(query, variables = {}, endpoint = this.graphqlEndpoint, tcsToken = null) {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    if (tcsToken) {
      headers['TCS-Access-Token'] = tcsToken;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL Error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Obtém dados do cliente
   * @returns {Promise<Object>} Dados do cliente
   */
  async getClient() {
    const url = buildEndpoint(this.hostname, ENDPOINTS.CHECKOUT_API);
    
    try {
      const data = await this.request(url);
      
      if (data == null) {
        return await this.getClientFromGraphQL();
      }
      
      return {
        email: data.Email || data.email || '',
        phone: data.Phone || data.phone || '',
      };
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      throw error;
    }
  }

  /**
   * Obtém dados do cliente via GraphQL
   * @returns {Promise<Object>} Dados do cliente
   */
  async getClientFromGraphQL() {
    const cookie = getCustomerAccessToken();
    
    if (!cookie) {
      throw new Error('Token de acesso do cliente não encontrado');
    }

    const variables = {
      customerAccessToken: cookie,
    };

    const tcsToken = getTcsToken();
    const data = await this.graphqlQuery(GRAPHQL_QUERIES.CUSTOMER, variables, this.graphqlEndpoint, tcsToken);

    if (data?.data?.data) {
      console.log('cliente encontrado:', data.data.data);
      return {
        email: data.data.data.email,
        phone: cleanPhone(data.data.data.phoneNumber),
      };
    }

    throw new Error('Cliente não encontrado');
  }

  /**
   * Obtém dados do produto
   * @param {string} productId - ID do produto
   * @param {string} tcsToken - Token TCS
   * @param {string} typeId - Tipo de ID (productId ou productVariantId)
   * @returns {Promise<Object>} Dados do produto
   */
  async getProduct(productId, tcsToken, typeId = 'productId') {
    const query = GRAPHQL_QUERIES.PRODUCT(typeId, productId);
    
    const variables = {
      customerAccessToken: getCustomerAccessToken(),
    };

    const data = await this.graphqlQuery(query, variables, this.productGraphqlEndpoint, tcsToken);

    if (data?.data?.products?.edges?.length > 0) {
      return data.data.products.edges[0].node;
    }

    throw new Error('Produto não encontrado na resposta');
  }

  /**
   * Obtém produtos do carrinho (Fbits)
   * @returns {Promise<Object>} Dados do carrinho
   */
  async getCartProductsFbits() {
    const endpointCart = `https://${this.hostname}/api/carrinho`;
    
    try {
      const response = await fetch(endpointCart, {
        method: 'GET',
        headers: {
          accept: 'application/json',
        },
        credentials: 'include',
      });

      if (response.status === 200) {
        return await response.json();
      } else {
        console.error('Erro ao buscar produtos do carrinho:', response.status);
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar produtos do carrinho:', error);
      return null;
    }
  }

  /**
   * Obtém produtos do carrinho (Storefront)
   * @returns {Promise<Array>} Lista de produtos do carrinho
   */
  async getCartProductsSF() {
    const bvPage = getBvPageData();
    
    if (!bvPage) {
      throw new Error('ID do checkout não encontrado');
    }

    const variables = {
      checkoutId: bvPage,
    };

    const tcsToken = getTcsToken();
    const data = await this.graphqlQuery(GRAPHQL_QUERIES.CHECKOUT, variables, this.graphqlEndpoint, tcsToken);

    if (data?.data?.data?.products) {
      return data.data.data.products;
    }

    throw new Error('Produtos do carrinho não encontrados');
  }

  /**
   * Obtém produtos da transação
   * @returns {Promise<Object>} Dados da transação
   */
  async getTransactionProducts() {
    const url = window.location.search;
    const params = new URLSearchParams(url);
    const checkoutId = params.get('checkoutId');
    
    if (!checkoutId) {
      throw new Error('ID do checkout não encontrado na URL');
    }

    console.log('checkoutId:', checkoutId);
    
    const variables = {
      checkoutId: checkoutId,
    };

    const tcsToken = getTcsToken();
    const data = await this.graphqlQuery(GRAPHQL_QUERIES.TRANSACTION, variables, this.productGraphqlEndpoint, tcsToken);

    if (data?.data?.data) {
      return data.data.data;
    }

    throw new Error('Dados da transação não encontrados');
  }
}

/**
 * Serviço para produtos
 */
export class ProductService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Obtém produto por ID
   * @param {string} productId - ID do produto
   * @param {string} tcsToken - Token TCS
   * @param {string} typeId - Tipo de ID
   * @returns {Promise<Object>} Dados do produto
   */
  async getById(productId, tcsToken, typeId = 'productId') {
    return await this.apiClient.getProduct(productId, tcsToken, typeId);
  }
}

/**
 * Serviço para carrinho
 */
export class CartService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Obtém produtos do carrinho (Fbits)
   * @returns {Promise<Object>} Dados do carrinho
   */
  async getProductsFbits() {
    return await this.apiClient.getCartProductsFbits();
  }

  /**
   * Obtém produtos do carrinho (Storefront)
   * @returns {Promise<Array>} Lista de produtos do carrinho
   */
  async getProductsSF() {
    return await this.apiClient.getCartProductsSF();
  }
}

/**
 * Serviço para clientes
 */
export class ClientService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Obtém dados do cliente
   * @returns {Promise<Object>} Dados do cliente
   */
  async get() {
    return await this.apiClient.getClient();
  }
}

/**
 * Serviço para transações
 */
export class TransactionService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Obtém produtos da transação
   * @returns {Promise<Object>} Dados da transação
   */
  async getProducts() {
    return await this.apiClient.getTransactionProducts();
  }
}

/**
 * Factory para criar serviços
 */
export class ServiceFactory {
  /**
   * Cria todos os serviços
   * @param {string} hostname - Hostname
   * @returns {Object} Objeto com todos os serviços
   */
  static createServices(hostname) {
    const apiClient = new ApiClient(hostname);
    
    return {
      apiClient,
      productService: new ProductService(apiClient),
      cartService: new CartService(apiClient),
      clientService: new ClientService(apiClient),
      transactionService: new TransactionService(apiClient),
    };
  }
} 