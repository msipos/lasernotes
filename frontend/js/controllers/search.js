function index(params) {
    App.renderMain("search.html").then(function() {
        $("#searchText").focus();
        $("#searchButton").on("click", function(e) {
            e.preventDefault();
            var terms = $("#searchText").val().trim();
            if (!terms) {
                $.notify("You must provide a search term", "error");
                return;
            }
            var uri = new URI("search/").search({q: terms});
            App.navigate(uri.href())
        });
    });
}

function results(params) {
    if (!(params.page)) {
        params.page = 1;
    }
    App.backend.getItems(params).then(function(data) {
        var context = {
            params: params,
            items: data.objects,
            num_pages: data.num_pages
        };
        App.renderMain("search_results.html", context).then(function() {
        });
    });

}

module.exports.index = index;
module.exports.results = results;
