// Controller for "/app/"
function index() {
    App.renderMain("loader.html");

    App.backend.getCollections().then(function(data) {
        return App.renderMain("journals.html", {journals: data});
    });
}

function onClickDelete(cId, e) {
    e.preventDefault();

    bootbox.confirm("Are you sure you wish to delete this journal? All entries in it will be lost.", function(choice) {
        if (!choice) return;
        App.backend.deleteCollection(cId).then(function() {
            App.navigate("");
        });
    });
}

function getUrl(id, keywords) {
    var u = new URI("/app/journal/" + id + "/")
    _.each(keywords, function(kw) {
        u.addQuery(kw, keywords[kw]);
    });

}

// Controller for "/app/journal/:id/?page=:p"
function journalPage(collection, items, params) {
    var context = {
        collection: collection,
        params: params,
        items: items.objects,
        num_pages: items.num_pages
    };

    App.renderMain("items.html", context).then(function() {
        $("#deleteJournalButton").on("click", _.partial(onClickDelete, collection.id, _));
    });
}

module.exports.index = index;
module.exports.journalPage = journalPage;
