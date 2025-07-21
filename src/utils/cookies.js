/**
 * Gerenciador de cookies para o BTG Tracking SDK
 */
import { CONFIG, COOKIE_NAMES, QUERY_PARAMS } from '../config/constants.js';
import { generateUUID, getQueryStringArray, processUtms, validateItem, getDomain } from './helpers.js';

/**
 * Singleton para parser de cookies
 */
export const cookieParser = (() => {
  let instance;

  function createInstance() {
    const result = {};
    const cookieStr = document.cookie;
    
    cookieStr.split('; ').forEach((cookie) => {
      const [key, ...rest] = cookie.split('=');
      try {
        result[decodeURIComponent(key)] = decodeURIComponent(rest.join('='));
      } catch {
        result[key] = rest.join('=');
      }
    });

    return {
      getAll() {
        return result;
      },
      get(key) {
        return result[key] || null;
      },
    };
  }

  return {
    getInstance() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    },
    refresh() {
      instance = null;
      return this.getInstance();
    },
  };
})();

/**
 * Define um cookie
 * @param {string} name - Nome do cookie
 * @param {string} value - Valor do cookie
 * @param {number} days - Dias para expiração
 * @param {string} baseUrl - URL base
 * @param {string|boolean} customDomain - Domínio customizado
 * @param {boolean} cookieUnderBtg - Se deve usar domínio BTG
 */
export function setCookie(name, value, days, baseUrl, customDomain, cookieUnderBtg) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  
  let cookie = `${name}=${value}; `;
  cookie += `expires=${date.toUTCString()}; `;
  cookie += `path=/; domain=.${getDomain(baseUrl, customDomain, cookieUnderBtg)}`;
  
  document.cookie = cookie;
}

/**
 * Obtém o valor de um cookie
 * @param {string} name - Nome do cookie
 * @returns {string|boolean} Valor do cookie ou false se não encontrado
 */
export function getCookie(name) {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  
  return false;
}

/**
 * Remove um cookie
 * @param {string} name - Nome do cookie
 * @param {string} baseUrl - URL base
 * @param {string|boolean} customDomain - Domínio customizado
 * @param {boolean} cookieUnderBtg - Se deve usar domínio BTG
 */
export function removeCookie(name, baseUrl, customDomain, cookieUnderBtg) {
  if (getCookie(name)) {
    setCookie(name, null, -1, baseUrl, customDomain, cookieUnderBtg);
  }
}

/**
 * Obtém ou gera o BID cookie
 * @param {string} baseUrl - URL base
 * @param {string|boolean} customDomain - Domínio customizado
 * @param {boolean} cookieUnderBtg - Se deve usar domínio BTG
 * @returns {string} Valor do BID
 */
export function getBidCookie(baseUrl, customDomain, cookieUnderBtg) {
  let value = getCookie(COOKIE_NAMES.BID);
  if (!value) {
    value = generateUUID();
    setCookie(COOKIE_NAMES.BID, value, CONFIG.COOKIE_EXPIRY_DAYS, baseUrl, customDomain, cookieUnderBtg);
  }
  return value;
}

/**
 * Gera e salva cookie de UTMs
 * @param {string} baseUrl - URL base
 * @param {string|boolean} customDomain - Domínio customizado
 * @param {boolean} cookieUnderBtg - Se deve usar domínio BTG
 */
export function generateUtmsCookie(baseUrl, customDomain, cookieUnderBtg) {
  removeCookie(COOKIE_NAMES.UTMS, baseUrl, customDomain, cookieUnderBtg);
  
  const data = getQueryStringArray();
  const strUtms = processUtms(data);
  
  if (strUtms) {
    setCookie(COOKIE_NAMES.UTMS, strUtms, CONFIG.UTM_COOKIE_EXPIRY_DAYS, baseUrl, customDomain, cookieUnderBtg);
  }
}

/**
 * Obtém cookie de UTMs
 * @returns {string} Valor do cookie de UTMs
 */
export function getUtmsCookie() {
  const utmsCookie = getCookie(COOKIE_NAMES.UTMS);
  return utmsCookie || '';
}

/**
 * Gera e salva cookie de módulo
 * @param {string} baseUrl - URL base
 * @param {string|boolean} customDomain - Domínio customizado
 * @param {boolean} cookieUnderBtg - Se deve usar domínio BTG
 */
export function generateModuleCookie(baseUrl, customDomain, cookieUnderBtg) {
  const data = getQueryStringArray();
  const moduleId = validateItem(data[QUERY_PARAMS.BTG_MODULE]);
  
  if (moduleId) {
    setCookie(COOKIE_NAMES.MODULE, moduleId, CONFIG.MODULE_COOKIE_EXPIRY_DAYS, baseUrl, customDomain, cookieUnderBtg);
  }
}

/**
 * Obtém token TCS do cookie
 * @returns {string|null} Token TCS
 */
export function getTcsToken() {
  return cookieParser.getInstance().get(COOKIE_NAMES.TCS_TOKEN);
}

/**
 * Obtém token de acesso do customer
 * @returns {string|null} Token de acesso do customer
 */
export function getCustomerAccessToken() {
  return cookieParser.getInstance().get(COOKIE_NAMES.CUSTOMER_TOKEN);
}

/**
 * Obtém dados do BV page
 * @returns {string|null} Dados do BV page
 */
export function getBvPageData() {
  return cookieParser.getInstance().get(COOKIE_NAMES.CHECKOUT_ID);
}

/**
 * Classe para gerenciar cookies
 */
export class CookieManager {
  constructor(baseUrl = CONFIG.BASE_URL, customDomain = false, cookieUnderBtg = false) {
    this.baseUrl = baseUrl;
    this.customDomain = customDomain;
    this.cookieUnderBtg = cookieUnderBtg;
  }

  /**
   * Define um cookie
   * @param {string} name - Nome do cookie
   * @param {string} value - Valor do cookie
   * @param {number} days - Dias para expiração
   */
  setCookie(name, value, days) {
    setCookie(name, value, days, this.baseUrl, this.customDomain, this.cookieUnderBtg);
  }

  /**
   * Obtém um cookie
   * @param {string} name - Nome do cookie
   * @returns {string|boolean} Valor do cookie
   */
  getCookie(name) {
    return getCookie(name);
  }

  /**
   * Remove um cookie
   * @param {string} name - Nome do cookie
   */
  removeCookie(name) {
    removeCookie(name, this.baseUrl, this.customDomain, this.cookieUnderBtg);
  }

  /**
   * Obtém ou gera o BID
   * @returns {string} Valor do BID
   */
  getBid() {
    return getBidCookie(this.baseUrl, this.customDomain, this.cookieUnderBtg);
  }

  /**
   * Gera cookie de UTMs
   */
  generateUtms() {
    generateUtmsCookie(this.baseUrl, this.customDomain, this.cookieUnderBtg);
  }

  /**
   * Obtém UTMs
   * @returns {string} Parâmetros UTM
   */
  getUtms() {
    return getUtmsCookie();
  }

  /**
   * Gera cookie de módulo
   */
  generateModule() {
    generateModuleCookie(this.baseUrl, this.customDomain, this.cookieUnderBtg);
  }

  /**
   * Obtém cookie de módulo
   * @returns {string|boolean} Valor do cookie de módulo
   */
  getModule() {
    return this.getCookie(COOKIE_NAMES.MODULE);
  }

  /**
   * Obtém token TCS
   * @returns {string|null} Token TCS
   */
  getTcsToken() {
    return getTcsToken();
  }

  /**
   * Obtém token de acesso do customer
   * @returns {string|null} Token de acesso do customer
   */
  getCustomerAccessToken() {
    return getCustomerAccessToken();
  }

  /**
   * Obtém dados do BV page
   * @returns {string|null} Dados do BV page
   */
  getBvPageData() {
    return getBvPageData();
  }
} 