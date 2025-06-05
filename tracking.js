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
                stdParameters + parameters,
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
        }
        else if (event === "cart" || event === "product") {
            var stdParameters = getParameters(btgId),
                parameters,
                total = data.length;
            if (total <= 0) {
                throw { message: "BTG360 Info - " + event + " image was not generated." };
            }
            generateCartAndProductImage(data, categories, btgId, event);

        } else if (event === "transaction") {
            console.log("chegou aqui 2");
            generateTransactionImage(data, btgId, categories, pedido);

        } else if (event === "search") {
            generateSearchImage(data, btgId)
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

    // TODO: Utilização de API do pedido mas deixou de funcionar.

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

        getClient().then(function (data) {
            var btgData = [{ email: data?.Email || "" }];
            BtgSend(btgId, "client", btgData, null, null);
        }).catch(function (error) {
            console.error("Erro ao buscar cliente:", error);
        });

        var host = window.location.hostname;
        var path = window.location.pathname;

        if (host.indexOf("checkout") !== -1) {
            if (path === "/") {
                getCartProducts().then(function (data) {
                    data.Produtos.forEach(function (item) {
                        getProduct(item.ProdutoId, tcsToken).then(function (produto) {
                            var categories = produto.productCategories;
                            BtgSend(btgId, "cart", produto, categories, null);
                        }).catch(function (error) {
                            console.error("Erro ao buscar produto no carrinho:", error);
                        });
                    });
                }).catch(function (error) {
                    console.error("Erro ao buscar produtos do carrinho:", error);
                });
            } else if (path === "/Confirmacao") {
                    var cartDetails = Fbits.Carrinho
                    var pedidoId = cartDetails.PedidoId;
                    var produtos = cartDetails.Produtos;
                    produtos.map(function (item) {
                        console.log("item:", item);
                        getProduct(item.ProdutoId, tcsToken).then(function (produto) {
                            var categories = produto.productCategories;
                            BtgSend(btgId, "transaction", produto, categories, pedidoId);
                            console.log("chegou aqui 6");
                            removeCookie("__btgModule");
                            removeCookie("__btgUtms");
                        }).catch(function (error) {
                            console.error("Erro ao buscar produto na transação:", error);
                        });
                    });
            }
        }

        if (path.indexOf("/produto/") !== -1) {
            var pathSplit = path.split("-");
            var productId = pathSplit[pathSplit.length - 1];

            getProduct(productId, tcsToken).then(function (produto) {
                BtgSend(btgId, "product", produto, { productCategories: produto.productCategories }, null);

                if (typeof wishlistAddClick === "function") {
                    var originalWishlistAddClick = wishlistAddClick;
                    window.wishlistAddClick = function (...args) {
                        const result = originalWishlistAddClick.apply(this, args);
                        generateWishlistImage([{ productId: produto.productId, active: true }], btgId);

                        return result;
                    };
                }

                if (typeof backInStockOnClick === "function") {
                    var originalBackInStockOnClick = backInStockOnClick;
                    window.backInStockOnClick = function (...args) {
                        const result2 = originalBackInStockOnClick.apply(this, args);
                        generateWarnMeImage([{ productId: produto.productId, active: true }], btgId);

                        return result2;
                    };
                }
            }).catch(function (error) {
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