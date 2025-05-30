(function BtgTracking() {
    var endpointProduct = "https://storefront-api.fbits.net/graphql";

    function BtgSend(btgId, event, data, categories, pedido) {
        var sendData;

        if (event === "email" || event === "client") {
            sendData = [{ email: data }];
        } else if (event === "cart" || event === "product") {
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

        if (sendData) {
            Btg360.add({
                account: btgId,
                event: event,
                domain: window.location.hostname,
                items: sendData
            });
        } else {
            console.warn("BtgSend: evento não reconhecido ou dados incompletos", event);
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
            fetch(endpointProduct, {
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
            var email = data?.Email || "";
            BtgSend(btgId, "client", email, null, null);
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
