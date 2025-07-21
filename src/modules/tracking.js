/**
 * Módulo de tracking para geração de imagens e eventos
 */
import { CONFIG, COOKIE_NAMES, QUERY_PARAMS, ENDPOINTS, SUBDOMAINS } from '../config/constants.js';
import { 
  validateItem, 
  toPrice, 
  generateUrl, 
  createImage, 
  getRand, 
  getQueryStringArray, 
  inArray, 
  lowerCamelCase 
} from '../utils/helpers.js';
import { CookieManager } from '../utils/cookies.js';

/**
 * Classe para gerenciar parâmetros de tracking
 */
export class TrackingParameters {
  constructor(cookieManager) {
    this.cookieManager = cookieManager;
  }

  /**
   * Gera parâmetros padrão para tracking
   * @param {string} account - ID da conta
   * @returns {string} Parâmetros formatados
   */
  getBaseParameters(account) {
    let parameters = `btgId=${account}`;
    parameters += `&cookieBid=${this.cookieManager.getBid()}`;
    parameters += `&url=${validateItem(window.location.href)}`;
    parameters += `&rand=${getRand(true)}`;
    parameters += this.cookieManager.getUtms();
    
    return parameters;
  }

  /**
   * Gera parâmetros para cliente
   * @param {Object} clientData - Dados do cliente
   * @returns {string} Parâmetros formatados
   */
  getClientParameters(clientData) {
    const usid = validateItem(clientData.usid);
    let parameters = '';
    
    if (usid) {
      parameters += `&usid=${usid}`;
    }
    
    const isOptin = typeof clientData.isOptin !== 'undefined' ? clientData.isOptin : true;
    
    parameters += `&email=${validateItem(usid ? '' : clientData.email)}`;
    parameters += `&facebookId=${validateItem(clientData.facebookId)}`;
    parameters += `&webPushId=${validateItem(clientData.webPushId)}`;
    parameters += `&phone=${validateItem(clientData.phone)}`;
    parameters += `&token=${validateItem(clientData.token)}`;
    parameters += `&encrypt=${validateItem(clientData.encrypt)}`;
    parameters += `&isOptin=${isOptin}`;
    
    return parameters;
  }

  /**
   * Gera parâmetros para produto
   * @param {Object} productData - Dados do produto
   * @param {Array} categories - Categorias do produto
   * @returns {string} Parâmetros formatados
   */
  getProductParameters(productData, categories) {
    let parameters = `&email=${validateItem(productData.email)}`;
    parameters += `&id=${validateItem(productData.productId)}`;
    parameters += `&name=${validateItem(productData.productName)}`;
    parameters += `&price=${toPrice(productData.prices.priceTables[0].price)}`;
    parameters += `&department=${validateItem(categories[0]?.name || '')}`;
    parameters += `&category=${validateItem(categories[1]?.name || '')}`;
    parameters += `&subcategory=${validateItem(categories[2]?.name || '')}`;
    parameters += `&brand=${validateItem(productData.productBrand.name)}`;
    
    return parameters;
  }

  /**
   * Gera parâmetros para transação
   * @param {Object} productData - Dados do produto
   * @param {Array} categories - Categorias do produto
   * @param {string} transactionId - ID da transação
   * @returns {string} Parâmetros formatados
   */
  getTransactionParameters(productData, categories, transactionId) {
    const price = toPrice(productData.prices.priceTables[0].price);
    
    let parameters = `&email=${validateItem(productData.email)}`;
    parameters += `&transactionId=${validateItem(transactionId)}`;
    parameters += `&id=${validateItem(productData.productId)}`;
    parameters += `&name=${validateItem(productData.productName)}`;
    parameters += `&price=${price}`;
    parameters += `&department=${validateItem(categories[0]?.name || '')}`;
    parameters += `&category=${validateItem(categories[1]?.name || '')}`;
    parameters += `&subcategory=${validateItem(categories[2]?.name || '')}`;
    parameters += `&brand=${validateItem(productData.productBrand.name)}`;
    
    return parameters;
  }

  /**
   * Gera parâmetros para busca
   * @param {string} keyword - Palavra-chave da busca
   * @returns {string} Parâmetros formatados
   */
  getSearchParameters(keyword) {
    return `&keyword=${validateItem(keyword)}`;
  }

  /**
   * Gera parâmetros para wishlist
   * @param {string} productId - ID do produto
   * @param {boolean} active - Se está ativo
   * @returns {string} Parâmetros formatados
   */
  getWishlistParameters(productId, active) {
    const activeValue = active ? 1 : 0;
    return `&productId=${validateItem(productId)}&active=${activeValue}`;
  }

  /**
   * Gera parâmetros para warn me
   * @param {string} productId - ID do produto
   * @param {boolean} active - Se está ativo
   * @returns {string} Parâmetros formatados
   */
  getWarnmeParameters(productId, active) {
    const activeValue = active ? 1 : 0;
    return `&productId=${validateItem(productId)}&active=${activeValue}`;
  }

  /**
   * Gera parâmetros para módulo
   * @param {string} moduleId - ID do módulo
   * @param {string} transactionId - ID da transação
   * @param {string} productId - ID do produto
   * @returns {string} Parâmetros formatados
   */
  getModuleParameters(moduleId, transactionId, productId) {
    let parameters = `&moduleId=${moduleId}`;
    parameters += `&transactionId=${validateItem(transactionId)}`;
    parameters += `&productId=${validateItem(productId)}`;
    
    return parameters;
  }
}

/**
 * Classe para gerar imagens de tracking
 */
export class ImageGenerators {
  constructor(baseUrl = CONFIG.BASE_URL, devUrl = false, cookieManager = null) {
    this.baseUrl = baseUrl;
    this.devUrl = devUrl;
    this.cookieManager = cookieManager || new CookieManager();
    this.trackingParams = new TrackingParameters(this.cookieManager);
  }

  /**
   * Gera imagem para cliente
   * @param {Array} items - Dados do cliente
   * @param {string} btgId - ID BTG
   */
  generateClientImage(items, btgId) {
    if (typeof items[0] === 'undefined') {
      return false;
    }

    if (typeof items[0].email === 'string' || typeof items[0].token === 'string') {
      const stdParameters = this.trackingParams.getBaseParameters(btgId);
      const clientParameters = this.trackingParams.getClientParameters(items[0]);
      
      createImage(
        generateUrl(SUBDOMAINS.CLIENT, ENDPOINTS.CLIENT_GIF, this.baseUrl, this.devUrl),
        stdParameters + clientParameters
      );
    }
  }

  /**
   * Gera imagem para produto e carrinho
   * @param {Object} items - Dados do produto
   * @param {Array} categories - Categorias do produto
   * @param {string} btgId - ID BTG
   * @param {string} event - Tipo do evento
   */
  generateCartAndProductImage(items, categories, btgId, event) {
    if (typeof items === 'object') {
      const stdParameters = this.trackingParams.getBaseParameters(btgId);
      const productParameters = this.trackingParams.getProductParameters(items, categories);
      
      createImage(
        generateUrl(SUBDOMAINS.CLIENT, `__${event}.gif`, this.baseUrl, this.devUrl),
        stdParameters + productParameters
      );

      if (event === 'product') {
        this.cookieManager.removeCookie(COOKIE_NAMES.LAST_PRODUCT);
      }
    } else {
      throw new Error(`BTG360 Info - ${event} image was not generated.`);
    }
  }

  /**
   * Alias para generateCartAndProductImage para produto
   * @param {Object} items - Dados do produto
   * @param {Array} categories - Categorias do produto
   * @param {string} btgId - ID BTG
   * @param {string} event - Tipo do evento
   */
  generateProductImage(items, categories, btgId, event) {
    this.generateCartAndProductImage(items, categories, btgId, event);
  }

  /**
   * Gera imagem para transação
   * @param {Object} items - Dados do produto
   * @param {string} btgId - ID BTG
   * @param {Array} categories - Categorias do produto
   * @param {string} transactionId - ID da transação
   */
  generateTransactionImage(items, btgId, categories, transactionId) {
    const stdParameters = this.trackingParams.getBaseParameters(btgId);
    const transactionParameters = this.trackingParams.getTransactionParameters(items, categories, transactionId);
    const moduleId = this.cookieManager.getModule();

    createImage(
      generateUrl(SUBDOMAINS.CLIENT, ENDPOINTS.ORDER_GIF, this.baseUrl, this.devUrl),
      stdParameters + transactionParameters
    );

    this.generateModuleImage(moduleId, items);
  }

  /**
   * Gera imagem para busca
   * @param {Array} items - Dados da busca
   * @param {string} btgId - ID BTG
   */
  generateSearchImage(items, btgId) {
    if (typeof items[0] === 'object') {
      const parameters = this.trackingParams.getBaseParameters(btgId);
      const keyword = validateItem(items[0].keyword);
      const minSizeChar = items[0].minSizeChar !== undefined ? parseInt(items[0].minSizeChar) : 2;

      if (keyword.length >= minSizeChar) {
        const searchParameters = this.trackingParams.getSearchParameters(keyword);
        createImage(
          generateUrl(SUBDOMAINS.CLIENT, ENDPOINTS.SEARCH_GIF, this.baseUrl, this.devUrl),
          parameters + searchParameters
        );
      }
    } else {
      throw new Error('BTG360 Info - Search image was not generated.');
    }
  }

  /**
   * Gera imagem para wishlist
   * @param {Array} items - Dados da wishlist
   * @param {string} btgId - ID BTG
   */
  generateWishlistImage(items, btgId) {
    if (typeof items[0] === 'object') {
      const parameters = this.trackingParams.getBaseParameters(btgId);
      const active = typeof items[0].active !== 'undefined' && 
                     (items[0].active || parseInt(items[0].active)) ? 1 : 0;
      const wishlistParameters = this.trackingParams.getWishlistParameters(items[0].productId, active);

      createImage(
        generateUrl(SUBDOMAINS.CLIENT, ENDPOINTS.WISHLIST_GIF, this.baseUrl, this.devUrl),
        parameters + wishlistParameters
      );
    } else {
      throw new Error('BTG360 Info - Wishlist image was not generated.');
    }
  }

  /**
   * Gera imagem para warn me
   * @param {Array} items - Dados do warn me
   * @param {string} btgId - ID BTG
   */
  generateWarnmeImage(items, btgId) {
    if (typeof items[0] === 'object') {
      const parameters = this.trackingParams.getBaseParameters(btgId);
      const active = typeof items[0].active !== 'undefined' && 
                     (items[0].active || parseInt(items[0].active)) ? 1 : 0;
      const warnmeParameters = this.trackingParams.getWarnmeParameters(items[0].productId, active);

      createImage(
        generateUrl(SUBDOMAINS.CLIENT, ENDPOINTS.WARNME_GIF, this.baseUrl, this.devUrl),
        parameters + warnmeParameters
      );
    } else {
      throw new Error('BTG360 Info - Warnme image was not generated.');
    }
  }

  /**
   * Gera imagem para módulo
   * @param {string} moduleId - ID do módulo
   * @param {Object} items - Dados do item
   */
  generateModuleImage(moduleId, items) {
    if (moduleId) {
      const parameters = this.trackingParams.getBaseParameters();
      const moduleParameters = this.trackingParams.getModuleParameters(
        moduleId,
        items.transactionId,
        items.id
      );

      createImage(
        generateUrl(SUBDOMAINS.CLIENT, ENDPOINTS.MODULE_GIF, this.baseUrl, this.devUrl),
        parameters + moduleParameters
      );
    }
  }
}

/**
 * Classe para processos internos
 */
export class InternalProcesses {
  constructor(cookieManager) {
    this.cookieManager = cookieManager;
  }

  /**
   * Gera USID a partir da query string
   * @param {ImageGenerators} imageGenerators - Gerador de imagens
   * @param {string} btgId - ID BTG
   */
  generateUsid(imageGenerators, btgId) {
    const data = getQueryStringArray();
    if (validateItem(data[QUERY_PARAMS.BTG_SOURCE])) {
      imageGenerators.generateClientImage([
        { email: data[QUERY_PARAMS.BTG_SOURCE], usid: data[QUERY_PARAMS.BTG_SOURCE] }
      ], btgId);
    }
  }

  /**
   * Executa todos os processos internos
   * @param {ImageGenerators} imageGenerators - Gerador de imagens
   * @param {string} btgId - ID BTG
   */
  executeAll(imageGenerators, btgId) {
    this.generateUsid(imageGenerators, btgId);
    this.cookieManager.generateUtms();
    this.cookieManager.generateModule();
  }
} 