var backend = {
    ajax: function(url, method, data) {
        return new Promise(function(resolve, reject) {
            var settings = {
                method: method,
                error: function(jqXHR, status, error) {
                    if (status >= 500) {
                        $.notify("Sorry! Server error with " + method + " request.", "error");
                    } else {
                        $.notify("Sorry! Error sending " + method + " request.", "error");
                    }
                    reject([status, error]);
                },
                dataType: "json",
                success: resolve
            };
            if (method === "POST" || method === "PUT") {
                settings.data = JSON.stringify(data);
            }
            $.ajax(url, settings);
        });
    },
    getCollections: function() {
        return this.ajax("/api/v1/collections/", "GET").then(function(res) {
            return res["objects"];
        });
    },
    newCollectionObject: function(obj) {
        return this.ajax("/api/v1/collections/", "POST", obj);
    },
    updateCollectionObject: function(collection, obj) {
        var url = "/api/v1/collections/" + collection + "/";
        return this.ajax(url, "PUT", obj);
    },
    getCollection: function(collection, detail) {
        var url = "/api/v1/collections/" + collection + "/";
        if (detail) url += "?detail=true";
        return this.ajax(url, "GET");
    },
    deleteCollection: function(collection) {
        return this.ajax("/api/v1/collections/" + collection + "/", "DELETE");
    },
    getItems: function(params) {
        // Note: returns {num_pages: n, objects: []}
        var uri = new URI("/api/v1/items/").search(params);
        return this.ajax(uri.href(), "GET");
    },
    getItem: function(id) {
        return this.ajax("/api/v1/items/" + id + "/?detail=true", "GET");
    },
    newItem: function(title, content, notes, typ, collection) {
        var obj = {
            title: title,
            content: content,
            notes: notes,
            typ: typ
        };
        return this.ajax("/api/v1/items/?collection=" + collection, "POST", obj);
    },
    updateItem: function(id, title, content, notes, typ) {
        var obj = {
            title: title,
            content: content,
            notes: notes,
            typ: typ
        };
        return this.updateItemObject(id, obj);
    },
    updateItemObject: function(id, obj) {
        return this.ajax("/api/v1/items/" + id + "/", "PUT", obj);
    },
    deleteItem: function(id) {
        return this.ajax("/api/v1/items/" + id + "/", "DELETE");
    }
};

module.exports = backend;
