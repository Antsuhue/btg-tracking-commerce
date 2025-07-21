/**
 * Funções utilitárias para o BTG Tracking SDK
 */
import { REGEX_PATTERNS, BLACKLIST_VALUES, QUERY_PARAMS } from '../config/constants.js';

/**
 * Gera um UUID v4
 * @returns {string} UUID gerado
 */
export function generateUUID() {
  const d = new Date().getTime();
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (d + Math.random() * 16) % 16 | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
  return uuid;
}

/**
 * Gera um número aleatório
 * @param {boolean} strBoolean - Se deve retornar como string sem o "0."
 * @returns {number|string} Número aleatório
 */
export function getRand(strBoolean) {
  const response = Math.random();
  return typeof strBoolean !== 'undefined' && strBoolean
    ? response.toString().substr(2)
    : response;
}

/**
 * Converte preço para formato numérico
 * @param {string|number} value - Valor a ser convertido
 * @returns {string} Preço formatado
 */
export function toPrice(value) {
  const strValue = new String(value);
  return strValue.replace(REGEX_PATTERNS.PRICE_CLEAN, '').replace(REGEX_PATTERNS.PRICE_COMMA, '.');
}

/**
 * Valida se o account está no formato correto
 * @param {string} account - Account para validar
 * @returns {string|boolean} Account validado ou false
 */
export function validateAccount(account) {
  if (typeof account === 'string' && REGEX_PATTERNS.ACCOUNT.test(account)) {
    return account;
  }
  return false;
}

/**
 * Valida se o TCS token está no formato correto
 * @param {string} tcsToken - Token para validar
 * @returns {string|boolean} Token validado ou false
 */
export function validateTcsToken(tcsToken) {
  if (typeof tcsToken === 'string' && REGEX_PATTERNS.TCS_TOKEN.test(tcsToken)) {
    return tcsToken;
  }
  return false;
}

/**
 * Valida e sanitiza um item
 * @param {any} item - Item para validar
 * @returns {string} Item validado e codificado
 */
export function validateItem(item) {
  if (typeof item === 'undefined' || BLACKLIST_VALUES.includes(String(item).toLowerCase())) {
    return '';
  }
  return encodeURIComponent(item);
}

/**
 * Valida se é um array válido
 * @param {any} items - Items para validar
 * @returns {Array} Array validado
 */
export function validateArrayItems(items) {
  return typeof items !== 'undefined' && items instanceof Array ? items : [];
}

/**
 * Verifica se um valor está em um array
 * @param {any} value - Valor a procurar
 * @param {Array} data - Array para procurar
 * @returns {boolean} Se o valor foi encontrado
 */
export function inArray(value, data) {
  return data.includes(value);
}

/**
 * Converte uma string para lowerCamelCase
 * @param {string} string - String para converter
 * @param {string} separator - Separador
 * @returns {string} String convertida
 */
export function lowerCamelCase(string, separator) {
  const toArray = string.split(separator);
  let text = toArray[0];
  const total = toArray.length;
  
  for (let i = 1; i < total; i++) {
    text += toArray[i].charAt(0).toUpperCase() + toArray[i].slice(1);
  }
  
  return text;
}

/**
 * Cria uma imagem de tracking 1x1 pixel
 * @param {string} url - URL da imagem
 * @param {string} parameters - Parâmetros da query string
 */
export function createImage(url, parameters) {
  const image = new Image(1, 1);
  image.src = url + '?' + parameters;
}

/**
 * Obtém parâmetros da query string como array
 * @returns {Object} Objeto com parâmetros da query string
 */
export function getQueryStringArray() {
  const data = {};
  const queryString = document.location.search.slice(1).split('&');
  const total = queryString.length;
  
  for (let i = 0; i < total; i++) {
    const qs = queryString[i].split('=');
    data[decodeURIComponent(qs[0])] = qs[1] || '';
  }
  
  return data;
}

/**
 * Gera URL para imagem de tracking
 * @param {string} subdomain - Subdomínio
 * @param {string} filename - Nome do arquivo
 * @param {string} baseUrl - URL base
 * @param {string|boolean} devUrl - URL de desenvolvimento
 * @returns {string} URL completa
 */
export function generateUrl(subdomain, filename, baseUrl, devUrl) {
  let url = document.location.protocol + '//' + subdomain + '.' + baseUrl + '/' + filename;
  
  if (devUrl) {
    url = devUrl + filename;
  }
  
  return url;
}

/**
 * Constrói endpoint baseado no hostname
 * @param {string} hostname - Hostname
 * @param {string} endpoint - Endpoint
 * @returns {string} URL completa
 */
export function buildEndpoint(hostname, endpoint) {
  const formatUrl = hostname.replace(/^www\./, '');
  
  if (!hostname.includes('checkout')) {
    return 'https://checkout.' + formatUrl + endpoint;
  } else {
    return 'https://' + hostname + endpoint;
  }
}

/**
 * Extrai ID do produto da URL da imagem
 * @param {string} imageUrl - URL da imagem
 * @returns {string} ID do produto
 */
export function extractProductIdFromImageUrl(imageUrl) {
  return imageUrl.split('/')[5];
}

/**
 * Limpa número de telefone
 * @param {string} phone - Número de telefone
 * @returns {string} Telefone limpo
 */
export function cleanPhone(phone) {
  return phone ? phone.replace(/\D/g, '') : '';
}

/**
 * Obtém domínio para cookies
 * @param {string} baseUrl - URL base
 * @param {string|boolean} customDomain - Domínio customizado
 * @param {boolean} cookieUnderBtg - Se deve usar domínio BTG
 * @returns {string} Domínio para cookies
 */
export function getDomain(baseUrl, customDomain, cookieUnderBtg) {
  if (cookieUnderBtg) {
    return baseUrl;
  }
  return customDomain || document.domain;
}

/**
 * Processa UTMs e retorna string de parâmetros
 * @param {Object} queryData - Dados da query string
 * @returns {string} Parâmetros UTM formatados
 */
export function processUtms(queryData) {
  let strUtms = '';
  
  for (const key in queryData) {
    if (inArray(key, QUERY_PARAMS.UTM_PARAMS)) {
      strUtms += '&' + lowerCamelCase(key, '_') + '=' + validateItem(queryData[key]);
    }
  }
  
  return strUtms;
} 