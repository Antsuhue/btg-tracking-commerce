/**
 * BTG Tracking SDK - Classe principal reestruturada
 */
import { CONFIG, EVENTS } from '../config/constants.js';
import { validateAccount, validateTcsToken, validateItem, getQueryStringArray } from '../utils/helpers.js';
import { CookieManager } from '../utils/cookies.js';
import { ImageGenerators, InternalProcesses } from '../modules/tracking.js';
import { PageRouter } from '../modules/pageHandlers.js';

/**
 * Classe principal do BTG Tracking SDK
 */
export class BtgTrackingSDK {
  constructor(options = {}) {
    // Configurações
    this.baseUrl = options.baseUrl || CONFIG.BASE_URL;
    this.devUrl = options.devUrl || false;
    this.customDomain = options.customDomain || false;
    this.cookieUnderBtg = options.cookieUnderBtg || false;
    this.onCacheLastProduct = options.onCacheLastProduct !== false;
    this.hasVitrine = options.hasVitrine || false;
    
    // Instâncias dos módulos
    this.cookieManager = new CookieManager(this.baseUrl, this.customDomain, this.cookieUnderBtg);
    this.imageGenerators = new ImageGenerators(this.baseUrl, this.devUrl, this.cookieManager);
    this.internalProcesses = new InternalProcesses(this.cookieManager);
    this.pageRouter = new PageRouter(window.location.hostname, this.imageGenerators, this.cookieManager);
    
    // Estado
    this.account = null;
    this.isInitialized = false;
    
    // Mapeamento de eventos para compatibilidade
    this.eventMap = {
      [EVENTS.PRODUCT]: this.handleProductEvent.bind(this),
      [EVENTS.CART]: this.handleCartEvent.bind(this),
      [EVENTS.CLIENT]: this.handleClientEvent.bind(this),
      [EVENTS.EMAIL]: this.handleClientEvent.bind(this),
      [EVENTS.TRANSACTION]: this.handleTransactionEvent.bind(this),
      [EVENTS.SEARCH]: this.handleSearchEvent.bind(this),
      [EVENTS.WISHLIST]: this.handleWishlistEvent.bind(this),
      [EVENTS.WARNME]: this.handleWarnmeEvent.bind(this),
    };
  }

  /**
   * Inicializa o SDK
   * @param {string} btgId - ID da conta BTG
   * @param {string} tcsToken - Token TCS
   * @returns {Promise<void>}
   */
  async start(btgId, tcsToken) {
    // Validações
    this.account = validateAccount(btgId);
    if (!this.account) {
      throw new Error('BTG360 Info - Account unknown.');
    }

    const validTcsToken = validateTcsToken(tcsToken);
    if (!validTcsToken) {
      throw new Error('BTG360 Info - TCS token invalid.');
    }

    // Inicializa processos internos
    this.internalProcesses.executeAll(this.imageGenerators, btgId);
    
    // Executa roteamento automático baseado na página
    await this.pageRouter.route(btgId, validTcsToken);
    
    this.isInitialized = true;
  }

  /**
   * Executa evento específico (compatibilidade com API original)
   * @param {Object} options - Opções do evento
   * @param {string} options.account - ID da conta
   * @param {string} options.event - Tipo do evento
   * @param {Array} options.items - Dados do evento
   */
  execute(options) {
    if (!options.account) {
      throw new Error('BTG360 Info - Account unknown.');
    }

    this.account = options.account;
    
    if (typeof this.eventMap[options.event] === 'function') {
      this.eventMap[options.event](options.items);
    } else {
      throw new Error('BTG360 Info - Event not defined or invalid.');
    }
  }

  /**
   * Envia evento de tracking (compatibilidade com API original)
   * @param {string} btgId - ID BTG
   * @param {string} event - Tipo do evento
   * @param {Array} data - Dados do evento
   * @param {Array} categories - Categorias (para produtos)
   * @param {string} transactionId - ID da transação (para transactions)
   */
  send(btgId, event, data, categories, transactionId) {
    if (event === 'email' || event === 'client') {
      this.imageGenerators.generateClientImage(data, btgId);
    } else if (event === 'cart' || event === 'product') {
      if (!Array.isArray(data)) {
        if (data.length <= 0) {
          throw new Error(`BTG360 Info - ${event} image was not generated.`);
        }
        this.imageGenerators.generateCartAndProductImage(data, categories, btgId, event);
      } else {
        throw new Error(`BTG360 Info - ${event} image was not generated.`);
      }
    } else if (event === 'transaction') {
      this.imageGenerators.generateTransactionImage(data, btgId, categories, transactionId);
    } else if (event === 'search') {
      this.imageGenerators.generateSearchImage(data, btgId);
    } else if (event === 'wishlist') {
      this.imageGenerators.generateWishlistImage(data, btgId);
    } else if (event === 'warnme') {
      this.imageGenerators.generateWarnmeImage(data, btgId);
    }
  }

  /**
   * Configura o SDK
   * @param {Object} options - Opções de configuração
   */
  configure(options) {
    if (options.baseUrl) this.baseUrl = options.baseUrl;
    if (options.devUrl !== undefined) this.devUrl = options.devUrl;
    if (options.customDomain !== undefined) this.customDomain = options.customDomain;
    if (options.cookieUnderBtg !== undefined) this.cookieUnderBtg = options.cookieUnderBtg;
    if (options.onCacheLastProduct !== undefined) this.onCacheLastProduct = options.onCacheLastProduct;
    if (options.hasVitrine !== undefined) this.hasVitrine = options.hasVitrine;
    
    // Recria instâncias com novas configurações
    this.cookieManager = new CookieManager(this.baseUrl, this.customDomain, this.cookieUnderBtg);
    this.imageGenerators = new ImageGenerators(this.baseUrl, this.devUrl, this.cookieManager);
    this.internalProcesses = new InternalProcesses(this.cookieManager);
    this.pageRouter = new PageRouter(window.location.hostname, this.imageGenerators, this.cookieManager);
  }

  /**
   * Obtém estado atual do SDK
   * @returns {Object} Estado do SDK
   */
  getState() {
    return {
      account: this.account,
      isInitialized: this.isInitialized,
      baseUrl: this.baseUrl,
      devUrl: this.devUrl,
      customDomain: this.customDomain,
      cookieUnderBtg: this.cookieUnderBtg,
      onCacheLastProduct: this.onCacheLastProduct,
      hasVitrine: this.hasVitrine,
    };
  }

  /**
   * Reseta o SDK
   */
  reset() {
    this.account = null;
    this.isInitialized = false;
    
    // Limpa cookies de tracking
    this.cookieManager.removeCookie('__btgModule');
    this.cookieManager.removeCookie('__btgUtms');
    this.cookieManager.removeCookie('btg_lastprod');
  }

  // Handlers para eventos específicos
  handleProductEvent(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('BTG360 Info - Product items are required.');
    }
    // Implementação específica para produtos se necessário
  }

  handleCartEvent(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('BTG360 Info - Cart items are required.');
    }
    // Implementação específica para carrinho se necessário
  }

  handleClientEvent(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('BTG360 Info - Client data is required.');
    }
    // Implementação específica para cliente se necessário
  }

  handleTransactionEvent(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('BTG360 Info - Transaction items are required.');
    }
    // Implementação específica para transações se necessário
  }

  handleSearchEvent(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('BTG360 Info - Search data is required.');
    }
    // Implementação específica para busca se necessário
  }

  handleWishlistEvent(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('BTG360 Info - Wishlist data is required.');
    }
    // Implementação específica para wishlist se necessário
  }

  handleWarnmeEvent(items) {
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('BTG360 Info - Warnme data is required.');
    }
    // Implementação específica para warn me se necessário
  }
}

// Singleton pattern para garantir uma única instância
let sdkInstance = null;

/**
 * Cria ou obtém instância do SDK
 * @param {Object} options - Opções de configuração
 * @returns {BtgTrackingSDK} Instância do SDK
 */
export function createOrGetSDK(options = {}) {
  if (!sdkInstance) {
    sdkInstance = new BtgTrackingSDK(options);
  }
  return sdkInstance;
}

/**
 * Obtém instância atual do SDK
 * @returns {BtgTrackingSDK|null} Instância do SDK ou null se não inicializada
 */
export function getSDKInstance() {
  return sdkInstance;
}

/**
 * Reseta instância do SDK
 */
export function resetSDKInstance() {
  if (sdkInstance) {
    sdkInstance.reset();
    sdkInstance = null;
  }
} 