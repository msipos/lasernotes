var wrap = function(res) {
    return new Promise(function(resolve, reject) {
        resolve(res);
    });
}

var reject = function() {
    return new Promise(function(resolve, reject) {
        reject([500, 'Error']);
    });
}

var backend = {
    cCounter: 1,
    iCounter: 1,
    collections: {},
    items: {},
    getCollections: function() {
        return wrap(this.collections);
    },
    newCollection: function(name, encrypted, effectivePasswordParams, challenge, challengeHash, challengeParams) {
        var obj = {
            name: name,
            encrypted: encrypted,
            effective_password_params: effectivePasswordParams,
            challenge: challenge,
            challenge_hash: challengeHash,
            challenge_params: challengeParams,
            items: {},
            id: this.cCounter
        };
        this.collections[this.cCounter] = obj;
        this.cCounter += 1;
        return wrap(obj);
    },
    getCollection: function(collection, detail) {
        return wrap(this.collections[collection]);
    },
    deleteCollection: function(collection) {
        delete this.collections[collection];
        return wrap(true);
    },
    getItems: function(params) {
        var c = this.collections[params.collection];

        // TODO.

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
        return this.ajax("/api/v1/items/" + id + "/", "PUT", obj);
    },
    deleteItem: function(id) {
        return this.ajax("/api/v1/items/" + id + "/", "DELETE");
    }
};

module.exports = backend;
