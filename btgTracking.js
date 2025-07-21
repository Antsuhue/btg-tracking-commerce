(function BtgTracking() {
  var _endpointProduct = `https://${window.location.hostname.replace(
    "checkout",
    "www"
  )}/graphql`;
  var _url = "btg360.com.br";
  var _urlImageDev = false;
  var _options;
  var _account;
  var _cookieBid;
  var _domain = false;
  var _cookieUnderBtg = false;
  var _onCacheLastProduct = true;
  var _hasVitrine = false;
  var _events = {
    product: function (items) {
      generateCartAndProductImage(items);
    },
    cart: function (items) {
      generateCartAndProductImage(items);
    },
    client: function (items) {
      generateClientImage(items);
    },
    transaction: function (items) {
      generateTransactionImage(items);
    },
    search: function (items) {
      generateSearchImage(items);
    },
    wishlist: function (items) {
      generateWishlistImage(items);
    },
    warnme: function (items) {
      generateWarnMeImage(items);
    },
  };
  function generateUUID() {
    var d = new Date().getTime();
    var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      }
    );
    return uuid;
  }
  function getRand(strBoolean) {
    var response = Math.random();
    return typeof strBoolean !== "undefined" && strBoolean
      ? response.toString().substr(2)
      : response;
  }
  function getDomain() {
    if (_cookieUnderBtg) {
      return _url;
    }
    return _domain ? _domain : document.domain;
  }
  function setCookie(name, value, days) {
    var date = new Date(),
      cookie;
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    cookie = name + "=" + value + "; ";
    cookie += "expires=" + date.toUTCString() + "; ";
    document.cookie = cookie + "path=/; domain=." + getDomain();
  }
  function getCookie(name) {
    name += "=";
    var ca = document.cookie.split(";"),
      total = ca.length;
    for (var i = 0; i < total; i++) {
      var c = ca[i];
      while (c.charAt(0) === " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return false;
  }
  function removeCookie(value) {
    if (getCookie(value)) {
      setCookie(value, null, -1);
    }
  }
  function getCookieBid() {
    var value = getCookie("__bid");
    if (!value) {
      value = generateUUID();
      setCookie("__bid", value, 21900);
    }
    return value;
  }
  function generateUrl(subdomain, filename) {
    var url =
      document.location.protocol +
      "//" +
      subdomain +
      "." +
      _url +
      "/" +
      filename;
    if (_urlImageDev) {
      url = _urlImageDev + filename;
    }
    return url;
  }
  function toPrice(value) {
    var strValue = new String(value);
    return strValue.replace(/[a-zA-Z\$\s]/g, "").replace(/\,/g, ".");
  }
  function validateAccount(account) {
    var response = false,
      regEx = /[0-9]\:[0-9]/g;
    if (typeof account === "string" && regEx.test(account)) {
      response = account;
    }
    return response;
  }
  function validateTcsToken(tcsToken) {
    var response = false,
      regEx = /^tcs_[a-z0-9]+_[a-f0-9]{32}$/g;
    if (typeof tcsToken === "string" && regEx.test(tcsToken)) {
      response = tcsToken;
    }
    return response;
  }
  function validateItem(item) {
    var blackList = ["undefined", "null"];
    return typeof item === "undefined" ||
      blackList.indexOf(String(item).toLowerCase()) >= 0
      ? ""
      : encodeURIComponent(item);
  }
  function validateArrayItems(items) {
    return typeof items !== "undefined" && items instanceof Array ? items : [];
  }
  function inArray(value, data) {
    var total = data.length,
      result = false;
    for (var i = 0; i < total; i++) {
      if (data[i] === value) {
        result = true;
      }
    }
    return result;
  }
  function getQueryStringArray() {
    var data = [],
      queryString = document.location.search.slice(1).split("&"),
      total = queryString.length;
    for (var i = 0; i < total; i++) {
      var qs = queryString[i].split("=");
      data[decodeURIComponent(qs[0])] = qs[1] || "";
    }
    return data;
  }
  function lowerCamelCase(string, separator) {
    var toArray = string.split(separator),
      text = toArray[0],
      total = toArray.length;
    for (var i = 1; i < total; i++) {
      text += toArray[i].charAt(0).toUpperCase() + toArray[i].slice(1);
    }
    return text;
  }
  function createImage(url, parameters) {
    var image = new Image(1, 1);
    image.src = url + "?" + parameters;
  }

  function generateUsid() {
    var data = getQueryStringArray();
    if (validateItem(data["btg_source"])) {
      generateClientImage([
        { email: data["btg_source"], usid: data["btg_source"] },
      ]);
    }
  }
  function generateUtmsCookie() {
    removeCookie("BTG360_utms");
    var utms = [
      "utm_source",
      "utm_medium",
      "utm_term",
      "utm_content",
      "utm_campaign",
      "utm_adContent",
      "utm_uid",
      "utm_email",
      "utm_keyword",
    ];
    var data = getQueryStringArray(),
      strUtms = "";
    for (var i in data) {
      if (inArray(i, utms)) {
        strUtms += "&" + lowerCamelCase(i, "_") + "=" + validateItem(data[i]);
      }
    }
    if (strUtms) {
      setCookie("__btgUtms", strUtms, 2);
    }
  }
  function getUtmsCookie() {
    var utmsCookie = getCookie("__btgUtms");
    return utmsCookie ? utmsCookie : "";
  }
  function getParameters(account) {
    var parameters = "btgId=" + account;
    parameters += "&cookieBid=" + _cookieBid;
    parameters += "&url=" + validateItem(window.location.href);
    parameters += "&rand=" + getRand(true);
    parameters += getUtmsCookie();
    return parameters;
  }
  function generateClientImage(items, btgId) {
    if (typeof items[0] === "undefined") {
      return false;
    }
    if (
      typeof items[0].email === "string" ||
      typeof items[0].token === "string"
    ) {
      var stdParameters = getParameters(btgId),
        parameters,
        usid = validateItem(items[0].usid);
      if (usid) {
        parameters += "&usid=" + usid;
        items[0].email = "";
      }
      var isOptin =
        typeof items[0].isOptin !== "undefined" ? items[0].isOptin : true;
      parameters += "&email=" + validateItem(items[0].email);
      parameters += "&facebookId=" + validateItem(items[0].facebookId);
      parameters += "&webPushId=" + validateItem(items[0].webPushId);
      parameters += "&phone=" + validateItem(items[0].phone);
      parameters += "&token=" + validateItem(items[0].token);
      parameters += "&encrypt=" + validateItem(items[0].encrypt);
      parameters += "&isOptin=" + isOptin;
      createImage(generateUrl("c", "__client.gif"), stdParameters + parameters);
    }
  }

  function generateCartAndProductImage(items, categories, btgId, event) {
    if (typeof items === "object") {
      var stdParameters = getParameters(btgId);
      var parameters = "&email=" + validateItem(items.email);
      parameters += "&id=" + validateItem(items.productId);
      parameters += "&name=" + validateItem(items.productName);
      parameters += "&price=" + toPrice(items.prices.priceTables[0].price);
      parameters += "&department=" + validateItem(categories[0]?.name || "");
      parameters += "&category=" + validateItem(categories[1]?.name || "");
      parameters += "&subcategory=" + validateItem(categories[2]?.name || "");
      parameters += "&brand=" + validateItem(items.productBrand.name);
      createImage(
        generateUrl("c", "__" + event + ".gif"),
        stdParameters + parameters
      );
      if (event === "product") {
        removeCookie("btg_lastprod");
      }
    } else {
      throw { message: "BTG360 Info - " + event + " image was not generated." };
    }
  }

  function generateTransactionImage(items, btgId, categories, pedido) {
    var stdParameters = getParameters(btgId),
      parameters,
      total = items.length,
      moduleId = getCookie("__btgModule");
    if (total <= 0) {
      throw { message: "BTG360 Info - Transaction image was not generated." };
    }
    var price = toPrice(items.prices.priceTables[0].price);
    parameters = "&email=" + validateItem(items.email);
    parameters += "&transactionId=" + validateItem(pedido);
    parameters += "&id=" + validateItem(items.productId);
    parameters += "&name=" + validateItem(items.productName);
    parameters += "&price=" + price;
    parameters += "&department=" + validateItem(categories[0]?.name || "");
    parameters += "&category=" + validateItem(categories[1]?.name || "");
    parameters += "&subcategory=" + validateItem(categories[2]?.name || "");
    parameters += "&brand=" + validateItem(items.productBrand.name);
    createImage(generateUrl("c", "__order.gif"), stdParameters + parameters);
    generateModuleImage(moduleId, items);
  }

  function generateSearchImage(items, btgId) {
    if (typeof items[0] === "object") {
      var parameters = getParameters(btgId),
        keyword = validateItem(items[0].keyword);
      var minSizeChar =
        items[0].minSizeChar !== undefined ? parseInt(items[0].minSizeChar) : 2;
      if (keyword.length >= minSizeChar) {
        parameters += "&keyword=" + keyword;
        createImage(generateUrl("c", "__search.gif"), parameters);
      }
    } else {
      throw { message: "BTG360 Info - Search image was not generated." };
    }
  }

  function generateWishlistImage(items, btgId) {
    if (typeof items[0] === "object") {
      var parameters = getParameters(btgId);
      var active =
        typeof items[0].active !== "undefined" &&
        (items[0].active || parseInt(items[0].active))
          ? 1
          : 0;
      parameters += "&productId=" + validateItem(items[0].productId);
      parameters += "&active=" + active;
      createImage(generateUrl("c", "__wishlist.gif"), parameters);
    } else {
      throw { message: "BTG360 Info - Wishlist image was not generated." };
    }
  }

  function generateWarnMeImage(items, btgId) {
    if (typeof items[0] === "object") {
      var parameters = getParameters(btgId);
      var active =
        typeof items[0].active !== "undefined" &&
        (items[0].active || parseInt(items[0].active))
          ? 1
          : 0;
      parameters += "&productId=" + validateItem(items[0].productId);
      parameters += "&active=" + active;
      createImage(generateUrl("c", "__warnme.gif"), parameters);
    } else {
      throw { message: "BTG360 Info - Warnme image was not generated." };
    }
  }

  function generateModuleCookie() {
    var data = getQueryStringArray(),
      moduleId = validateItem(data["btg_module"]);
    if (moduleId) {
      setCookie("__btgModule", moduleId, 1);
    }
  }
  function generateModuleImage(moduleId, items) {
    if (moduleId) {
      var parameters = getParameters();
      parameters += "&moduleId=" + moduleId;
      parameters += "&transactionId=" + validateItem(items.transactionId);
      parameters += "&productId=" + validateItem(items.id);
      createImage(generateUrl("c", "__module.gif"), parameters);
    }
  }
  function internalProcess() {
    generateUsid();
    generateUtmsCookie();
    generateModuleCookie();
  }
  function execute(options) {
    if (options.account) {
      _account = options.account;
      _cookieBid = getCookieBid();
      internalProcess();
      if (typeof _events[options.event] === "function") {
        _events[options.event](options.items);
      } else {
        throw { message: "BTG360 Info - Event not defined or invalid." };
      }
    } else {
      throw { message: "BTG360 Info - Account unknown." };
    }
  }

  function BtgSend(btgId, event, data, categories, pedido) {
    if (event === "email" || event === "client") {
      generateClientImage(data, btgId);
    } else if (event === "cart" || event === "product") {
      var stdParameters = getParameters(btgId),
        parameters,
        total = data.length;
      if (total <= 0) {
        throw {
          message: "BTG360 Info - " + event + " image was not generated.",
        };
      }
      generateCartAndProductImage(data, categories, btgId, event);
    } else if (event === "transaction") {
      generateTransactionImage(data, btgId, categories, pedido);
    } else if (event === "search") {
      generateSearchImage(data, btgId);
    }
  }

  /*
    Função para puxar dados dos cookies do navegador 
    Esta função possui métodos para puxar todos os cookies ou um cookie específico
    */

  const cookieParser = (() => {
    let instance;

    function createInstance() {
      const result = {};
      const cookieStr = document.cookie;
      cookieStr.split("; ").forEach((cookie) => {
        const [key, ...rest] = cookie.split("=");
        try {
          result[decodeURIComponent(key)] = decodeURIComponent(rest.join("="));
        } catch {
          result[key] = rest.join("=");
        }
      });

      return {
        getAll() {
          return result;
        },
        get(chave) {
          return result[chave] || null;
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
    };
  })();

  const _cookieTcsToken = cookieParser
    .getInstance()
    .get("sf_storefront_access_token");

  function getClient() {
    return new Promise(function (resolve, reject) {
      var url;
      var formatUrl = window.location.hostname.replace(/^www\./, "");
      if (!window.location.hostname.includes("checkout")) {
        url = "https://checkout." + formatUrl + "/api/Login/Get";
      } else {
        url = "https://" + window.location.hostname + "/api/Login/Get";
      }
      fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
        },
        credentials: "include",
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (data) {
          if (data == null) {
            const cookie = cookieParser
              .getInstance()
              .get("sf_customer_access_token");

            url = "https://" + window.location.hostname + "/graphql";
            if (cookie) {
              const queryCustomer = `query Customer($customerAccessToken: String!) {
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
                        }`;

              const variables = {
                customerAccessToken: cookie,
              };
              fetch(url, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                  "TCS-Access-Token": _cookieTcsToken,
                },
                body: JSON.stringify({
                  query: queryCustomer,
                  variables: variables,
                }),
              })
                .then(function (response) {
                  return response.json();
                })
                .then(function (data) {
                  console.log("cliente encontrado:", data.data.data);

                  const customer = {
                    email: data.data.data.email,
                    phone: data.data.data.phoneNumber.replace(/\D/g, ""),
                  };
                  resolve(customer);
                })
                .catch(function (error) {
                  reject(error);
                });
            }
          } else {
            resolve(data);
          }
        })
        .catch(function (error) {
          reject(error);
        });
    });
  }

  function getProduct(productId, tcsToken, typeId) {
    var graphQuery =
      "query Query { " +
      "products(first: 50, filters: { " +
      typeId +
      ": " +
      parseInt(productId, 10) +
      " }) { " +
      "  edges { node { " +
      "    productId productName productBrand { name } " +
      "    productCategories { name } " +
      "    prices { priceTables { price } } " +
      "  } } } }";

    const variables = {
      customerAccessToken: cookieParser
        .getInstance()
        .get("sf_customer_access_token"),
    };
    return new Promise(function (resolve, reject) {
      fetch(_endpointProduct, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "TCS-Access-Token": tcsToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: graphQuery, variables: variables }),
      })
        .then(function (response) {
          if (!response.ok) {
            return reject(new Error("Http Error: " + response.status));
          }
          return response.json();
        })
        .then(function (data) {
          if (data?.data?.products?.edges?.length > 0) {
            resolve(data.data.products.edges[0].node);
          } else {
            reject(new Error("Produto não encontrado na resposta"));
          }
        })
        .catch(function (error) {
          reject(error);
        });
    });
  }

  function getCartProductsFbits() {
    var endpointCart = "https://" + window.location.hostname + "/api/carrinho";
    return fetch(endpointCart, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
      credentials: "include",
    })
      .then(function (res) {
        if (res.status === 200) {
          return res.json();
        } else {
          return console.error(
            "Erro ao buscar produtos do carrinho:",
            res.status
          );
        }
      })
      .catch(function (error) {
        console.error("Erro ao buscar produtos do carrinho:", error);
      });
  }

  function getCartProductsSF() {
    var endpointCart = "https://" + window.location.hostname + "/graphql";
    const _query = `query Checkout($checkoutId: String!) {
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
}`;
    const bvPage = cookieParser.getInstance().get("carrinho-id");

    const variables = {
      checkoutId: bvPage,
    };

    return new Promise(function (resolve, reject) {
      fetch(endpointCart, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "TCS-Access-Token": _cookieTcsToken,
        },
        body: JSON.stringify({ query: _query, variables: variables }),
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          resolve(data["data"]["data"]["products"]);
        })
        .catch(function (error) {
          reject(new Error("Erro ao buscar 2 produtos do carrinho:", error));
        });
    });
  }

  // TODO: UtilizaÃ§Ã£o de API do pedido mas deixou de funcionar.

  /* function getTransactionProducts() {
        var endpointCart = "https://" + window.location.hostname + "/api/carrinho";
        return fetch(endpointCart, {
            method: "GET",
            headers: {
                "accept": "application/json",
            },
            credentials: "include"
        }).then(function (res) {
            return res.json();
        }).then(function (data) {
            return {
                produtos: data.Produtos,
                pedidoInfo: data.Pedidos
            };
        });
    } */

      function getTransactionProducts() {
        const endpointCart = "https://" + window.location.hostname + "/graphql";
        const _query = `query Checkout($checkoutId: String!) {
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
        }`;
        var _variables;

        return new Promise(function (resolve, reject) {
          const url = window.location.search;
          const params = new URLSearchParams(url);
          const checkoutId = params.get("checkoutId");
          console.log("checkoutId:", checkoutId);
          const tcsToken = cookieParser.getInstance().get("sf_storefront_access_token");
          if (checkoutId) {
            _variables = { checkoutId: checkoutId };
            fetch(_endpointProduct, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "TCS-Access-Token": tcsToken,
              },
              body: JSON.stringify({ query: _query, variables: _variables }),
            }).then(function (res) {
              return res.json();
            }).then(function (data) {
              resolve(data["data"]["data"]);
            }).catch(function (error) {
              reject(new Error("Erro ao buscar 2 produtos do carrinho:", error));
            });
          }
        });
      }


  this.start = function (btgId, tcsToken) {
    _account = validateAccount(btgId);
    if (_account) {
      _cookieBid = getCookieBid();
      internalProcess();
    } else {
      throw { message: "BTG360 Info - Account unknown." };
    }
    var tcsToken = validateTcsToken(tcsToken);
    if (!tcsToken) {
      throw { message: "BTG360 Info - TCS token invalid." };
    }

    getClient()
      .then(function (data) {
        var btgData = [
          {
            email: data?.Email || data?.email || "",
            phone: data?.Phone || data?.phone || "",
          },
        ];
        BtgSend(btgId, "client", btgData, null, null);
      })
      .catch(function (error) {
        console.error("Erro ao buscar cliente:", error);
      });

    var host = window.location.hostname;
    var path = window.location.pathname;

    if (host.indexOf("checkout") !== -1) {
      if (path === "/") {
        getCartProductsFbits()
          .then(function (data) {
            data.Produtos.forEach(function (item) {
              getProduct(item.ProdutoId, tcsToken, "productId")
                .then(function (produto) {
                  var categories = produto.productCategories;
                  BtgSend(btgId, "cart", produto, categories, null);
                })
                .catch(function (error) {
                  console.error("Erro ao buscar produto no carrinho:", error);
                });
            });
          })
          .catch(function (error) {
            console.error("Erro ao buscar produtos do carrinho:", error);
          });
      } else if (path === "/Confirmacao") {
        var cartDetails = Fbits.Carrinho;
        var pedidoId = cartDetails.PedidoId;
        var produtos = cartDetails.Produtos;
        produtos.map(function (item) {
          getProduct(item.ProdutoId, _cookieTcsToken, "productVariantId")
            .then(function (produto) {
              var categories = produto.productCategories;
              BtgSend(btgId, "transaction", produto, categories, pedidoId);
              removeCookie("__btgModule");
              removeCookie("__btgUtms");
            })
            .catch(function (error) {
              console.error("Erro ao buscar produto na transação:", error);
            });
        });
      }
    } else {
      if (path.indexOf("checkout") !== -1 && window.location.search.indexOf("checkoutId") === -1) { 
        getCartProductsSF().then(function (data) {
          data.map((item) => {
            const productId = item.imageUrl.split("/")[5];
            getProduct(productId, _cookieTcsToken, "productVariantId").then(function (produto) {
              const categories = produto.productCategories;
              BtgSend(btgId, "cart", produto, categories, null);
            });
          });
        });
      } else if (path.indexOf("confirmation") !== -1 && window.location.search.indexOf("checkoutId") !== -1) {
        getTransactionProducts().then(function (data) {
          const products = data["orders"][0]["products"];
          const _transactionId = data["orders"][0]["orderId"];
          products.map((item) => {
            const productId = item.imageUrl.split("/")[5];
            getProduct(productId, _cookieTcsToken, "productVariantId").then(function (produto) {
              const categories = produto.productCategories;
              BtgSend(btgId, "transaction", produto, categories, _transactionId);
            });
          });
        });
      }
    }

    if (path.indexOf("/produto/") !== -1) {
      var pathSplit = path.split("-");
      var productId = pathSplit[pathSplit.length - 1];

      getProduct(productId, tcsToken)
        .then(function (produto) {
          BtgSend(
            btgId,
            "product",
            produto,
            { productCategories: produto.productCategories },
            null
          );

          if (typeof wishlistAddClick === "function") {
            var originalWishlistAddClick = wishlistAddClick;
            window.wishlistAddClick = function (...args) {
              const result = originalWishlistAddClick.apply(this, args);
              generateWishlistImage(
                [{ productId: produto.productId, active: true }],
                btgId
              );

              return result;
            };
          }

          if (typeof backInStockOnClick === "function") {
            var originalBackInStockOnClick = backInStockOnClick;
            window.backInStockOnClick = function (...args) {
              const result2 = originalBackInStockOnClick.apply(this, args);
              generateWarnMeImage(
                [{ productId: produto.productId, active: true }],
                btgId
              );

              return result2;
            };
          }
        })
        .catch(function (error) {
          console.error("Erro ao obter produto:", error);
        });
    }

    if (path.indexOf("/busca") !== -1) {
      var search = window.location.search;
      var params = new URLSearchParams(search);
      var searchTerm = params.get("busca");
      BtgSend(btgId, "search", [{ keyword: searchTerm }], null, null);
    }
  };

  window.BtgTracking = this;
})();
