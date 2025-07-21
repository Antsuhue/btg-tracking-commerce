/**
 * Handlers para diferentes páginas e rotas
 */
import { EVENTS, PATHS, QUERY_PARAMS, COOKIE_NAMES } from '../config/constants.js';
import { ServiceFactory } from '../api/client.js';
import { ImageGenerators } from './tracking.js';
import { extractProductIdFromImageUrl } from '../utils/helpers.js';

/**
 * Classe base para handlers de página
 */
export class BasePageHandler {
  constructor(hostname, imageGenerators, cookieManager) {
    this.hostname = hostname;
    this.imageGenerators = imageGenerators;
    this.cookieManager = cookieManager;
    this.services = ServiceFactory.createServices(hostname);
  }

  /**
   * Executa o handler
   * @param {string} btgId - ID BTG
   * @param {string} tcsToken - Token TCS
   * @param {string} path - Caminho da página
   * @returns {Promise<void>}
   */
  async handle(btgId, tcsToken, path) {
    throw new Error('Handler deve ser implementado na classe filha');
  }

  /**
   * Intercepta função de wishlist
   * @param {string} productId - ID do produto
   * @param {string} btgId - ID BTG
   */
  interceptWishlistFunction(productId, btgId) {
    if (typeof window.wishlistAddClick === 'function') {
      const originalWishlistAddClick = window.wishlistAddClick;
      window.wishlistAddClick = function (...args) {
        const result = originalWishlistAddClick.apply(this, args);
        this.imageGenerators.generateWishlistImage([{ productId, active: true }], btgId);
        return result;
      }.bind(this);
    }
  }

  /**
   * Intercepta função de warn me
   * @param {string} productId - ID do produto
   * @param {string} btgId - ID BTG
   */
  interceptWarnmeFunction(productId, btgId) {
    if (typeof window.backInStockOnClick === 'function') {
      const originalBackInStockOnClick = window.backInStockOnClick;
      window.backInStockOnClick = function (...args) {
        const result = originalBackInStockOnClick.apply(this, args);
        this.imageGenerators.generateWarnmeImage([{ productId, active: true }], btgId);
        return result;
      }.bind(this);
    }
  }

  /**
   * Envia evento de tracking usando BtgSend
   * @param {string} btgId - ID BTG
   * @param {string} event - Evento
   * @param {*} data - Dados
   * @param {*} categories - Categorias
   * @param {*} transactionId - ID da transação
   */
  sendTrackingEvent(btgId, event, data, categories, transactionId) {
    if (event === 'email' || event === 'client') {
      this.imageGenerators.generateClientImage(data, btgId);
    } else if (event === 'cart' || event === 'product') {
      this.imageGenerators.generateCartAndProductImage(data, categories, btgId, event);
    } else if (event === 'transaction') {
      this.imageGenerators.generateTransactionImage(data, btgId, categories, transactionId);
    } else if (event === 'search') {
      this.imageGenerators.generateSearchImage(data, btgId);
    }
  }
}

/**
 * Handler para página de produto
 */
export class ProductPageHandler extends BasePageHandler {
  async handle(btgId, tcsToken, path) {
    const pathSplit = path.split('-');
    const productId = pathSplit[pathSplit.length - 1];

    try {
      const product = await this.services.productService.getById(productId, tcsToken);
      
      this.sendTrackingEvent(
        btgId,
        EVENTS.PRODUCT,
        product,
        product.productCategories,
        null
      );

      // Intercepta funções de wishlist e warn me
      this.interceptWishlistFunction(product.productId, btgId);
      this.interceptWarnmeFunction(product.productId, btgId);

    } catch (error) {
      console.error('Erro ao obter produto:', error);
    }
  }
}

/**
 * Handler para página de busca
 */
export class SearchPageHandler extends BasePageHandler {
  async handle(btgId, tcsToken, path) {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const searchTerm = params.get(QUERY_PARAMS.BUSCA);

    if (searchTerm) {
      this.sendTrackingEvent(btgId, EVENTS.SEARCH, [{ keyword: searchTerm }], null, null);
    }
  }
}

/**
 * Handler para página de carrinho (Checkout Fbits)
 */
export class CartPageHandler extends BasePageHandler {
  async handle(btgId, tcsToken, path) {
    try {
      const cartData = await this.services.cartService.getProductsFbits();
      
      if (cartData && cartData.Produtos) {
        for (const item of cartData.Produtos) {
          try {
            const product = await this.services.productService.getById(item.ProdutoId, tcsToken, 'productId');
            const categories = product.productCategories;
            this.sendTrackingEvent(btgId, EVENTS.CART, product, categories, null);
          } catch (error) {
            console.error('Erro ao buscar produto no carrinho:', error);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar produtos do carrinho:', error);
    }
  }
}

/**
 * Handler para página de carrinho (Storefront)
 */
export class CartPageHandlerSF extends BasePageHandler {
  async handle(btgId, tcsToken, path) {
    try {
      const cartData = await this.services.cartService.getProductsSF();
      
      if (cartData) {
        for (const item of cartData) {
          const productId = extractProductIdFromImageUrl(item.imageUrl);
          try {
            const product = await this.services.productService.getById(productId, tcsToken, 'productVariantId');
            const categories = product.productCategories;
            this.sendTrackingEvent(btgId, EVENTS.CART, product, categories, null);
          } catch (error) {
            console.error('Erro ao buscar produto no carrinho:', error);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar produtos do carrinho:', error);
    }
  }
}

/**
 * Handler para página de confirmação (Checkout Fbits)
 */
export class ConfirmationPageHandler extends BasePageHandler {
  async handle(btgId, tcsToken, path) {
    try {
      const cartDetails = window.Fbits ? window.Fbits.Carrinho : null;
      
      if (cartDetails) {
        const pedidoId = cartDetails.PedidoId;
        const produtos = cartDetails.Produtos;

        for (const item of produtos) {
          try {
            const product = await this.services.productService.getById(item.ProdutoId, tcsToken, 'productVariantId');
            const categories = product.productCategories;
            this.sendTrackingEvent(btgId, EVENTS.TRANSACTION, product, categories, pedidoId);
          } catch (error) {
            console.error('Erro ao buscar produto na transação:', error);
          }
        }

        // Limpa cookies após transação
        this.cookieManager.removeCookie(COOKIE_NAMES.MODULE);
        this.cookieManager.removeCookie(COOKIE_NAMES.UTMS);
      }
    } catch (error) {
      console.error('Erro ao processar confirmação:', error);
    }
  }
}

/**
 * Handler para página de confirmação (Storefront)
 */
export class ConfirmationPageHandlerSF extends BasePageHandler {
  async handle(btgId, tcsToken, path) {
    try {
      const transactionData = await this.services.transactionService.getProducts();
      
      if (transactionData && transactionData.orders && transactionData.orders.length > 0) {
        const products = transactionData.orders[0].products;
        const transactionId = transactionData.orders[0].orderId;

        for (const item of products) {
          const productId = extractProductIdFromImageUrl(item.imageUrl);
          try {
            const product = await this.services.productService.getById(productId, tcsToken, 'productVariantId');
            const categories = product.productCategories;
            this.sendTrackingEvent(btgId, EVENTS.TRANSACTION, product, categories, transactionId);
          } catch (error) {
            console.error('Erro ao buscar produto na transação:', error);
          }
        }

        // Limpa cookies após transação
        this.cookieManager.removeCookie(COOKIE_NAMES.MODULE);
        this.cookieManager.removeCookie(COOKIE_NAMES.UTMS);
      }
    } catch (error) {
      console.error('Erro ao processar confirmação:', error);
    }
  }
}

/**
 * Handler para cliente
 */
export class ClientHandler extends BasePageHandler {
  async handle(btgId, tcsToken, path) {
    try {
      const clientData = await this.services.clientService.get();
      
      const btgData = [{
        email: clientData?.Email || clientData?.email || '',
        phone: clientData?.Phone || clientData?.phone || '',
      }];

      this.sendTrackingEvent(btgId, EVENTS.CLIENT, btgData, null, null);
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
    }
  }
}

/**
 * Classe para roteamento de páginas
 */
export class PageRouter {
  constructor(hostname, imageGenerators, cookieManager) {
    this.hostname = hostname;
    this.imageGenerators = imageGenerators;
    this.cookieManager = cookieManager;
    this.isCheckoutHost = hostname.indexOf('checkout') !== -1;
  }

  /**
   * Executa roteamento baseado na URL atual
   * @param {string} btgId - ID BTG
   * @param {string} tcsToken - Token TCS
   * @returns {Promise<void>}
   */
  async route(btgId, tcsToken) {
    const path = window.location.pathname;
    const search = window.location.search;

    // Primeiro tenta obter dados do cliente
    const clientHandler = new ClientHandler(this.hostname, this.imageGenerators, this.cookieManager);
    await clientHandler.handle(btgId, tcsToken, path);

    // Roteamento baseado no hostname e path
    if (this.isCheckoutHost) {
      await this.routeCheckout(btgId, tcsToken, path);
    } else {
      await this.routeStorefront(btgId, tcsToken, path, search);
    }

    // Roteamento comum para ambos os ambientes
    await this.routeCommon(btgId, tcsToken, path);
  }

  /**
   * Roteamento para ambiente de checkout
   * @param {string} btgId - ID BTG
   * @param {string} tcsToken - Token TCS
   * @param {string} path - Caminho da página
   * @returns {Promise<void>}
   */
  async routeCheckout(btgId, tcsToken, path) {
    if (path === PATHS.CHECKOUT_ROOT) {
      const handler = new CartPageHandler(this.hostname, this.imageGenerators, this.cookieManager);
      await handler.handle(btgId, tcsToken, path);
    } else if (path === PATHS.CONFIRMATION) {
      const handler = new ConfirmationPageHandler(this.hostname, this.imageGenerators, this.cookieManager);
      await handler.handle(btgId, tcsToken, path);
    }
  }

  /**
   * Roteamento para ambiente storefront
   * @param {string} btgId - ID BTG
   * @param {string} tcsToken - Token TCS
   * @param {string} path - Caminho da página
   * @param {string} search - Query string
   * @returns {Promise<void>}
   */
  async routeStorefront(btgId, tcsToken, path, search) {
    if (path.indexOf(PATHS.CHECKOUT) !== -1 && search.indexOf(QUERY_PARAMS.CHECKOUT_ID) === -1) {
      const handler = new CartPageHandlerSF(this.hostname, this.imageGenerators, this.cookieManager);
      await handler.handle(btgId, tcsToken, path);
    } else if (path.indexOf(PATHS.CONFIRMATION_SF) !== -1 && search.indexOf(QUERY_PARAMS.CHECKOUT_ID) !== -1) {
      const handler = new ConfirmationPageHandlerSF(this.hostname, this.imageGenerators, this.cookieManager);
      await handler.handle(btgId, tcsToken, path);
    }
  }

  /**
   * Roteamento comum para ambos os ambientes
   * @param {string} btgId - ID BTG
   * @param {string} tcsToken - Token TCS
   * @param {string} path - Caminho da página
   * @returns {Promise<void>}
   */
  async routeCommon(btgId, tcsToken, path) {
    if (path.indexOf(PATHS.PRODUCT) !== -1) {
      const handler = new ProductPageHandler(this.hostname, this.imageGenerators, this.cookieManager);
      await handler.handle(btgId, tcsToken, path);
    } else if (path.indexOf(PATHS.SEARCH) !== -1) {
      const handler = new SearchPageHandler(this.hostname, this.imageGenerators, this.cookieManager);
      await handler.handle(btgId, tcsToken, path);
    }
  }
}

/**
 * Classe para gerenciar interceptadores de funções globais
 */
export class FunctionInterceptor {
  constructor(imageGenerators) {
    this.imageGenerators = imageGenerators;
    this.originalFunctions = {};
  }

  /**
   * Intercepta função global
   * @param {string} functionName - Nome da função
   * @param {Function} interceptor - Função interceptadora
   */
  interceptGlobalFunction(functionName, interceptor) {
    if (typeof window[functionName] === 'function') {
      this.originalFunctions[functionName] = window[functionName];
      window[functionName] = interceptor;
    }
  }

  /**
   * Restaura função original
   * @param {string} functionName - Nome da função
   */
  restoreFunction(functionName) {
    if (this.originalFunctions[functionName]) {
      window[functionName] = this.originalFunctions[functionName];
      delete this.originalFunctions[functionName];
    }
  }

  /**
   * Restaura todas as funções
   */
  restoreAllFunctions() {
    for (const functionName in this.originalFunctions) {
      this.restoreFunction(functionName);
    }
  }
} 