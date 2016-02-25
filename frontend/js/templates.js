function loadTemplate(name) {
    return new Promise(function(resolve, reject) {
        $.ajax("/static/ts/" + name, {
            error: function(jqXHR, status, error) {
                $.notify("Sorry! Error getting template from server. Check your connection and/or try to refresh.", "error");
                reject([status, error]);
            },
            method: "GET",
            success: resolve,
            cache: false
        });
    });
}

// Name -> template function
var templateCache = {};

function preloadTemplates() {
    templateCache["loader.html"] = _.template(require("raw!../templates/loader.html"));
}

function renderTemplate(jq, name, context) {
    if (name in templateCache) {
        jq.html(templateCache[name](context));
        return Promise.resolve();
    } else {
        return loadTemplate(name).then(function(data) {
            templateCache[name] = _.template(data);
            jq.html(templateCache[name](context));
        });
    }
}

var components = {
    "item_row": _.template(require("raw!../templates/components/item_row.html"))
}

function renderComponent(name, context) {
    return components[name](context);
}

module.exports.preloadTemplates = preloadTemplates;
module.exports.renderTemplate = renderTemplate;
module.exports.renderComponent = renderComponent;
