var unlock = require("./unlock.js");

// Controller base that will fetch a collection and invoke controllerFunc with
// a collection object.  It may potentially bail out and invoke the unlock
// screen.
function collectionBase(cId, controllerFunc, params) {
    App.renderMain("loader.html");

    var detail = params && (params.detail || false);

    App.backend.getCollection(cId, detail).then(
        function(collection) {
            if (unlock.check(collection)) return null;

            controllerFunc(collection, params);
        }
    )
}

// Like above but also fetches items.
function collectionWithItemsBase(cId, controllerFunc, params) {
    App.renderMain("loader.html");

    // Implications:
    if (!params.page) params.page = 1;
    if (!params.sortBy) params.sortBy = "ct";

    params.page = parseInt(params.page);
    params.collection = cId;

    var p = Promise.join(App.backend.getCollection(cId),
                         App.backend.getItems(params));
    p.then(function(data) {
        var collection = data[0];
        if (unlock.check(collection)) return null;

        var items = data[1];
        if (collection.encrypted) {
            _.each(items.objects, (item) => {
                item.title = App.cryptoState.decrypt(cId, item.title);
            });
        }

        controllerFunc(data[0], data[1], params);
    });
}

// Controller base that will fetch an, item, its collection and invoke
// controllerFunc with (item, collection) args.  It may potentially bail out
// and invoke the unlock screen instead.
function itemBase(iId, controllerFunc) {
    App.renderMain("loader.html");

    var itemData;
    App.backend.getItem(iId).then(
        function(data) {
            itemData = data;
            return App.backend.getCollection(data.collection_id);
        }
    ).then(
        function(collection) {
            if (unlock.check(collection)) return null;

            if (collection.encrypted) {
                itemData.title = App.cryptoState.decrypt(itemData.collection_id, itemData.title);
                itemData.content = App.cryptoState.decrypt(itemData.collection_id, itemData.content);
            }

            controllerFunc(itemData, collection);
        }
    );
}

module.exports.collection = collectionBase;
module.exports.item = itemBase;
module.exports.collectionWithItems = collectionWithItemsBase;
