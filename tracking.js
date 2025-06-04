(function BtgTracking() {
    var _endpointProduct = "https://storefront-api.fbits.net/graphql";
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
            generateProductImage(items);
        },
        cart: function (items) {
            generateCartImage(items);
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
            },
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
    function validateEvent(event) {
        return typeof event === "string" ? event.toLowerCase() : null;
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
    function generateClientImage(items) {
        if (typeof items[0] === "undefined") {
          return false;
        }
    }
    function generateModuleCookie() {
        var data = getQueryStringArray(),
            moduleId = validateItem(data["btg_module"]);
        if (moduleId) {
            setCookie("__btgModule", moduleId, 1);
        }
    }
    function getParameters(account) {
        var parameters = "btgId=" + account;
        parameters += "&cookieBid=" + _cookieBid;
        parameters += "&url=" + validateItem(window.location.href);
        parameters += "&rand=" + getRand(true);
        parameters += getUtmsCookie();
        return parameters;
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
        var sendData;
        console.log(data);

        if (event === "email" || event === "client") {
            console.log(_cookieBid);
            if (typeof data[0] === "undefined") {
                return false;
              }
              if (
                typeof data[0].email === "string" ||
                typeof data[0].token === "string"
              ) {
                var stdParameters = getParameters(btgId),
                  parameters,
                  usid = validateItem(data[0].usid);
                if (usid) {
                  parameters += "&usid=" + usid;
                  data[0].email = "";
                }
                
                var isOptin =
                  typeof data[0].isOptin !== "undefined" ? data[0].isOptin : true;
                parameters += "&email=" + validateItem(data[0].email);
                parameters += "&facebookId=" + validateItem(data[0].facebookId);
                parameters += "&webPushId=" + validateItem(data[0].webPushId);
                parameters += "&phone=" + validateItem(data[0].phone);
                parameters += "&token=" + validateItem(data[0].token);
                parameters += "&encrypt=" + validateItem(data[0].encrypt);
                parameters += "&isOptin=" + isOptin;
                createImage(generateUrl("c", "__client.gif"), stdParameters + parameters);
                execute({
                    account: btgId,
                    event: "client",
                    items: data
                });
              }
            }
        else if (event === "cart" || event === "product") {
            sendData = [{
                id: data.productId,
                name: data.productName,
                price: data.prices.priceTables[0].price,
                department: categories.productCategories[0]?.name || "",
                category: categories.productCategories[1]?.name || "",
                subCategory: categories.productCategories[2]?.name || "",
                brand: data.productBrand.name
            }];
        } else if (event === "transaction") {
            sendData = [{
                transactionId: pedido.pedidoInfo.Id,
                id: data.productId,
                name: data.productName,
                price: data.prices.priceTables[0].price,
                department: categories.productCategories[0]?.name || "",
                category: categories.productCategories[1]?.name || "",
                subCategory: categories.productCategories[2]?.name || "",
                brand: data.productBrand.name
            }];
        }
    }

    function getClient() {
        return new Promise(function (resolve, reject) {
            var url;
            if (!window.location.hostname.includes("checkout")) {
                var formatUrl = window.location.hostname.split(".");
                formatUrl.shift();
                formatUrl = formatUrl.join(".");
                url = "https://checkout." + formatUrl + "/api/Login/Get";
            } else {
                url = "https://" + window.location.hostname + "/api/Login/Get";
            }

            fetch(url, {
                method: "GET",
                headers: {
                    "accept": "application/json"
                },
                credentials: "include"
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                resolve(data);
            }).catch(function (error) {
                reject(error);
            });
        });
    }

    function getProduct(productId, tcsToken) {
        var graphQuery = "query Query { " +
            "products(first: 50, filters: { productId: " + parseInt(productId, 10) + " }) { " +
            "  edges { node { " +
            "    productId productName productBrand { name } " +
            "    productCategories { name } " +
            "    prices { priceTables { price } } " +
            "  } } } }";

        return new Promise(function (resolve, reject) {
            fetch(_endpointProduct, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "TCS-Access-Token": tcsToken,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ query: graphQuery })
            }).then(function (response) {
                if (!response.ok) {
                    return reject(new Error("Http Error: " + response.status));
                }
                return response.json();
            }).then(function (data) {
                if (data?.data?.products?.edges?.length > 0) {
                    resolve(data.data.products.edges[0].node);
                } else {
                    reject(new Error("Produto não encontrado na resposta"));
                }
            }).catch(function (error) {
                reject(error);
            });
        });
    }

    function getCartProducts() {
        var endpointCart = "https://" + window.location.hostname + "/api/carrinho";
        return fetch(endpointCart, {
            method: "GET",
            headers: {
                "accept": "application/json"
            },
            credentials: "include"

        }).then(function (res) {
            return res.json();
        });
    }

    function getTransactionProducts() {
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
    }

    this.start = function (btgId, tcsToken) {
        getClient().then(function (data) {
            var btgData = [{email: data?.Email || ""}];
            BtgSend(btgId, "client", btgData, null, null);
        }).catch(function (error) {
            console.error("Erro ao buscar cliente:", error);
        });

        var host = window.location.hostname;
        var path = window.location.pathname;

        if (host.indexOf("checkout") !== -1) {
            if (path === "/") {
                console.log("Página de Carrinho");
                getCartProducts().then(function (data) {
                    data.Produtos.forEach(function (item) {
                        getProduct(item.ProdutoId, tcsToken).then(function (produto) {
                            BtgSend(btgId, "cart", produto, { productCategories: produto.productCategories }, null);
                        }).catch(function (error) {
                            console.error("Erro ao buscar produto no carrinho:", error);
                        });
                    });
                }).catch(function (error) {
                    console.error("Erro ao buscar produtos do carrinho:", error);
                });
            } else if (path === "/Confirmacao") {
                console.log("Página de Transação");
                getTransactionProducts().then(function (data) {
                    data.produtos.forEach(function (item) {
                        getProduct(item.ProdutoId, tcsToken).then(function (produto) {
                            BtgSend(btgId, "transaction", produto, { productCategories: produto.productCategories }, { pedidoInfo: data.pedidoInfo });
                        }).catch(function (error) {
                            console.error("Erro ao buscar produto na transação:", error);
                        });
                    });
                }).catch(function (error) {
                    console.error("Erro ao buscar dados da transação:", error);
                });
            }
        }

        if (path.indexOf("/produto/") !== -1) {
            var pathSplit = path.split("-");
            var productId = pathSplit[pathSplit.length - 1];

            getProduct(productId, tcsToken).then(function (produto) {
                BtgSend(btgId, "product", produto, { productCategories: produto.productCategories }, null);
            }).catch(function (error) {
                console.error("Erro ao obter produto:", error);
            });
        }
    };

    window.BtgTracking = this;
})();