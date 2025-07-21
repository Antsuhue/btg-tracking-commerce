/**
 * BTG Tracking SDK - Ponto de entrada principal
 * Mantém compatibilidade com a API original
 */
import { BtgTrackingSDK, createOrGetSDK, getSDKInstance } from './core/BtgTrackingSDK.js';
import { CONFIG } from './config/constants.js';

/**
 * Classe para compatibilidade com API original
 * Emula a implementação original em formato IIFE
 */
function BtgTrackingLegacy() {
  const sdk = createOrGetSDK({
    baseUrl: CONFIG.BASE_URL,
    devUrl: false,
    customDomain: false,
    cookieUnderBtg: false,
    onCacheLastProduct: true,
    hasVitrine: false,
  });

  /**
   * Função start - mantém compatibilidade com API original
   * @param {string} btgId - ID da conta BTG
   * @param {string} tcsToken - Token TCS
   * @returns {Promise<void>}
   */
  this.start = function(btgId, tcsToken) {
    return sdk.start(btgId, tcsToken);
  };

  /**
   * Função execute - mantém compatibilidade com API original
   * @param {Object} options - Opções do evento
   * @returns {*}
   */
  this.execute = function(options) {
    return sdk.execute(options);
  };

  /**
   * Função send - mantém compatibilidade com API original
   * @param {string} btgId - ID BTG
   * @param {string} event - Tipo do evento
   * @param {*} data - Dados do evento
   * @param {*} categories - Categorias (para produtos)
   * @param {string} transactionId - ID da transação
   * @returns {*}
   */
  this.send = function(btgId, event, data, categories, transactionId) {
    return sdk.send(btgId, event, data, categories, transactionId);
  };

  /**
   * Obtém instância do SDK para acesso avançado
   * @returns {BtgTrackingSDK}
   */
  this.getSDK = function() {
    return sdk;
  };

  /**
   * Configura o SDK
   * @param {Object} options - Opções de configuração
   */
  this.configure = function(options) {
    return sdk.configure(options);
  };

  /**
   * Obtém estado do SDK
   * @returns {Object}
   */
  this.getState = function() {
    return sdk.getState();
  };

  /**
   * Reseta o SDK
   */
  this.reset = function() {
    return sdk.reset();
  };

  // Expõe o SDK na propriedade BtgTracking para compatibilidade
  window.BtgTracking = this;
}

/**
 * Função BtgSend - mantém compatibilidade com API original
 * @param {string} btgId - ID BTG
 * @param {string} event - Tipo do evento
 * @param {*} data - Dados do evento
 * @param {*} categories - Categorias (para produtos)
 * @param {string} pedido - ID da transação
 * @returns {*}
 */
function BtgSend(btgId, event, data, categories, pedido) {
  const sdk = getSDKInstance();
  if (sdk) {
    return sdk.send(btgId, event, data, categories, pedido);
  } else {
    // Cria instância temporária se não existir
    const tempSDK = createOrGetSDK();
    return tempSDK.send(btgId, event, data, categories, pedido);
  }
}

/**
 * Inicialização automática em formato IIFE (compatibilidade)
 */
(function() {
  // Cria instância legacy para compatibilidade
  const btgTrackingLegacy = new BtgTrackingLegacy();
  
  // Expõe funções globais para compatibilidade
  window.BtgSend = BtgSend;
  window.BtgTracking = btgTrackingLegacy;
})();

// Exportações para uso como módulo ES6
export { BtgTrackingSDK, createOrGetSDK, getSDKInstance };
export default BtgTrackingSDK;

// Exporta configurações e utilitários
export * from './config/constants.js';
export * from './utils/helpers.js';
export * from './utils/cookies.js';
export * from './api/client.js';
export * from './modules/tracking.js';
export * from './modules/pageHandlers.js'; 