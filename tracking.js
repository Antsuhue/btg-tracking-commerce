(function BtgTracking() {
    var endpointProduct = "https://storefront-api.fbits.net/graphql";

    function getClient() {
        return new Promise(function (resolve, reject) {
            var url; 
            if (!window.location.hostname.includes("checkout")){
                var formatUrl = window.location.hostname.split(".")
                formatUrl.shift();
                formatUrl = formatUrl.join(".");
                url = "https://checkout."+formatUrl+"/api/Login/Get"
            }else{
                url = "https://"+window.location.hostname+"/api/Login/Get"
            } 
            fetch(url, {
                method: "GET",
                headers: {
                    "accept": "application/json"
                },
                mode: "no-cors",
                credentials: "include"
            }).then(function (response) {
                return response.json();
            }).then(function (data) {
                resolve(data);
            }).catch(function (error) {
                reject(error);
            });
        })
    }

    function getProduct(productId, tcsToken) {
        var graphQuery = "query Query { " +
            "products(first: 50, filters: { productId: " + parseInt(productId) + " }) { " +
            "  totalCount " +
            "  pageInfo { hasNextPage hasPreviousPage startCursor endCursor } " +
            "  edges { cursor node { " +
            "    alias: aliasComplete productVariantId productId productName condition " +
            "    attributes { type value name } sku available ean display " +
            "    productBrand { name } condition images { url } " +
            "    buyBox { minimumPrice quantityOffers } " +
            "    productCategories { hierarchy active main name } " +
            "    prices { priceTables { listPrice price } " +
            "      bestInstallment { number value } " +
            "      installmentPlans { displayName installments { discount number value fees } } " +
            "    } } } } }";

        return new Promise(function (resolve, reject) {
            fetch(endpointProduct, {
                method: "POST",
                headers: {
                    "Accept-Encoding": "gzip, deflate, br",
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "TCS-Access-Token": tcsToken
                },
                body: JSON.stringify({ query: graphQuery })
            }).then(function (response) {
                if (!response.ok) {
                    return reject(new Error("Http Error: " + response.status));
                }
                return response.json();
            }).then(function (data) {
                if (
                    data &&
                    data.data &&
                    data.data.products &&
                    data.data.products.edges &&
                    data.data.products.edges.length > 0
                ) {
                    resolve(data.data.products.edges[0].node);
                } else {
                    reject(new Error("Produto não encontrado na resposta"));
                }
            }).catch(function (error) {
                reject(error);
            });
        });
    }

    

    this.start = function (btgId, tcsToken) {
        getClient().then(function (data) {
            console.log(data);
        })

        var host = window.location.hostname;
        switch (host.includes("checkout")) {
            case true:
                path = window.location.pathname;
                if (path.indexOf("/") !== -1) {
                    /* getCartProducts().then(function (data) {
                        console.log(data);
                    }).catch(function (error) {
                        console.error("Error: " + error);
                    }); */
                }
            case false:
                path = window.location.pathname;
                if (path.indexOf("/produto/") !== -1) {
                    var pathSplit = path.split("-");
                    var productId = pathSplit[pathSplit.length - 1];
                    getProduct(productId, tcsToken).then(function (produto) {
                        var categories = produto.productCategories;
                        Btg360.add({
                            account: btgId,
                            event: "product",
                            domain: window.location.hostname,
                            items: [
                                {
                                    id: produto.productId,
                                    name: produto.productName,
                                    price: produto.prices.priceTables[0].price,
                                    department: categories[0].name,
                                    category: categories[1].name,
                                    subCategory: categories[2].name,
                                    brand: produto.productBrand.name
                                }
                            ]
                        });
                    }).catch(function (error) {
                        reject("Error: " + error);
                    });

                }
        }
    }
    window.BtgTracking = this;
})();