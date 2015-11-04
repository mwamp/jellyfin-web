﻿(function () {

    var updatedProducts = [];

    function updateProductInfo(id, owned, price) {

        updatedProducts = updatedProducts.filter(function (r) {
            return r.id != id;
        });

        var product = {
            id: id,
            owned: owned,
            price: price
        };

        updatedProducts.push(product);

        Events.trigger(IapManager, 'productupdated', [product]);
    }

    function getProduct(feature) {

        var id;
        if (feature == 'embypremieremonthly') {
            id = "emby.premiere.monthly";
        } else {
            id = "com.emby.mobile.unlock";
        }

        var products = updatedProducts.filter(function (r) {
            return r.id == id;
        });

        return products.length ? products[0] : null;
    }

    var storeReady = false;
    function onStoreReady() {
        storeReady = true;
        refreshPurchases();
    }

    function isPurchaseAvailable() {

        return storeReady;
    }

    function beginPurchase(feature, email) {

        if (feature == 'embypremieremonthly') {
            return MainActivity.purchasePremiereMonthly(email);
        }
        if (feature == 'embypremiereweekly') {
            return MainActivity.purchasePremiereWeekly(email);
        }
        return MainActivity.purchaseUnlock(email);
    }

    function onPurchaseComplete(result) {

        if (result) {
            refreshPurchases();
        }
    }

    function refreshPurchases() {
        NativeIapManager.getPurchaseInfos("window.IapManager.updateProduct");
    }

    function getSubscriptionOptions() {
        var deferred = DeferredBuilder.Deferred();

        var options = [];

        options.push({
            feature: 'embypremieremonthly',
            buttonText: 'EmbyPremiereMonthly'
        });

        options = options.filter(function (o) {
            return getProduct(o.feature) != null;

        }).map(function (o) {

            o.buttonText = Globalize.translate(o.buttonText, getProduct(o.feature).price);
            o.owned = getProduct(o.feature).owned;
            return o;
        });

        deferred.resolveWith(null, [options]);
        return deferred.promise();
    }

    window.IapManager = {
        isPurchaseAvailable: isPurchaseAvailable,
        getProductInfo: getProduct,
        updateProduct: updateProductInfo,
        beginPurchase: beginPurchase,
        onPurchaseComplete: onPurchaseComplete,
        getSubscriptionOptions: getSubscriptionOptions,
        onStoreReady: onStoreReady
    };

    NativeIapManager.initStore();

})();