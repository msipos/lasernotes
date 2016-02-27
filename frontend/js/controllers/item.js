function onClickDelete(iId, cId, e) {
    e.preventDefault();

    bootbox.confirm("Are you sure you wish to delete this item? It will be permanently lost.", function(choice) {
        if (!choice) return;
        App.backend.deleteItem(iId).then(function() {
            var url = "journal/" + cId + "/"
            return App.navigate(url);
        });
    });
}

function onChangeVisibility(iId, e) {
    e.preventDefault();

    var choices = [
        'Private',
        'Public (visible on blog)'
    ];

    var dialog = {
        title: 'Choose visibility',
        text: 'Choose visibility for this entry:',
        choices: choices,
        callback: function(c) {
            var visibility = 'P';
            if (c === 1) visibility = 'V';
            App.backend.updateItemObject(iId, {visibility: visibility}).then(function() {
                App.navigate("item/" + iId + "/");
                App.router.refresh();
            });
        }
    };
    App.util.bootboxChoice(dialog);
}

function onMoveEntry(item, current_collection, e) {
    e.preventDefault();

    if (current_collection.encrypted) {
        App.router.displayError("Moving an entry from an encrypted collection is not supported.");
        return;
    }

    App.backend.getCollections().then(function(collections) {
        collections = _.filter(collections, function(c) {
            return c.id != item.collection_id && c.encrypted == false;;
        });
        if (collections.length == 0) {
            App.router.displayError("No other collections to move to.");
            return;
        }

        var choices = _.map(collections, function(c) {
            return c.name;
        });

        var dialog = {
            title: 'Choose journal',
            text: 'Choose journal to move this entry to.  Moving to encrypted journals is not supported.',
            choices: choices,
            callback: function(choice) {
                App.backend.updateItemObject(item.id, {
                  collection_id: collections[choice].id}
                ).then(function() {
                    App.router.refresh();
                    return null;
                });
            }
        }

        App.util.bootboxChoice(dialog);
        return null;
    });
}

// Controller for "/app/item/:id/"
function index(item, collection) {
    item.content = App.util.compileContent(item.content);
    var context = {
        item: item,
        collection: collection
    };
    App.renderMain("item.html", context).then(function() {
        $("#deleteItemButton").on("click", _.partial(onClickDelete, item.id, collection.id, _));

        $("#changeVisibilityLink").on("click", _.partial(onChangeVisibility, item.id, _));

        $("#moveEntry").on("click", _.partial(onMoveEntry, item, collection, _));
    });
}

module.exports.index = index;
