var controllerBase = require("./controllers/base.js");
var controllerEdit = require("./controllers/journal_edit.js");
var controllerItem = require("./controllers/item.js");
var controllerJournals = require('./controllers/journals.js');
var controllerJournalsNew = require('./controllers/journal_new.js');
var controllerSearch = require("./controllers/search.js");
var controllerUnlock = require("./controllers/unlock.js");

module.exports = Backbone.Router.extend({
    routes: {
        "": "journalIndex",
        "journal/new/": "journalNew",
        "journal/:id/?:params": "journalPage",
        "journal/:id/edit/": "journalEdit",
        "journal/:id/new/url/?:params": "itemNewUrlWithParams",
        "journal/:id/new/url/": "itemNewUrl",
        "journal/:id/new/": "itemNew",
        "journal/:id/": "journal",
        "journal/:id/unlock/": "journalUnlock",
        "item/:id/": "item",
        "item/:id/edit/": "itemEdit",
        "item/:id/edit-date/" : "itemEditDate",
        "search/?:params": "searchWithParams",
        "search/": "search",
        "*splat": "err"
    },

    // Controller for "/app/"
    journalIndex: controllerJournals.index,

    // Controller for "/app/journal/new/"
    journalNew: controllerJournalsNew.index,

    // Controller for "/app/journal/:id/"
    journal: function(id) {
        controllerBase.collectionWithItems(id, controllerJournals.journalPage, {});
    },

    // Controller for "/app/journal/:id/?:params"
    journalPage: function(id, params) {
        params = (new URI("/?" + params)).search(true);
        controllerBase.collectionWithItems(id, controllerJournals.journalPage, params);
    },

    journalEdit: function(id) {
        controllerBase.collection(id, controllerEdit.index, {detail: true});
    },

    // Controller for "/app/journal:id/unlock/"
    journalUnlock: controllerUnlock.index,

    // Controller for "/app/journal/:id/new/"
    itemNew: function(id) {
        controllerBase.collection(id, controllerItem.newItem);
    },

    // Controller for "/app/journal/:id/new/url/"
    itemNewUrl: function(id) {
        controllerBase.collection(id, controllerItem.newUrl);
    },

    // Controller for "/app/journal/:id/new/url/?:params"
    itemNewUrlWithParams: function(id, params) {
        params = (new URI("/?" + params)).search(true);
        controllerBase.collection(id, controllerItem.newUrl, params);
    },

    // Controller for "/app/item/:id/"
    item: function(id) {
        controllerBase.item(id, controllerItem.index);
    },

    // Controller for "/app/item/:id/edit/"
    itemEdit: function(id) {
        controllerBase.item(id, controllerItem.edit);
    },

    // Controller for "/app/item/:id/edit-date/"
    itemEditDate: function(id) {
        controllerBase.item(id, controllerItem.editDate);
    },

    search: function() {
        controllerSearch.index();
    },

    searchWithParams: function(params) {
        params = (new URI("/?" + params)).search(true);
        controllerSearch.results(params);
    },

    err: function() {
        //this.navigate("", {trigger: true, replace: true});
        App.renderMain("404.html");
    },

    // Display an error
    displayError: function(text) {
        $.notify(text, "error");
    },

    rev: {
        journal: function(id, params, override) {
            params = params || {};
            params = $.extend({}, params, override);
            if (params.page == 1) delete params.page;  // page=1 is implied.
            if (params.sortBy == "ct") delete params.sortBy; // sortBy=ct is implied.
            return (new URI("/app/journal/" + id + "/")).search(params).href();
        },
        search: function(params, override) {
            params = params || {};
            params = $.extend({}, params, override);
            if (params.page == 1) delete params.page;  // page=1 is implied.
            return (new URI("/app/search/")).search(params).href();
        }
    },

    refresh: function () {
        var tmp = Backbone.history.fragment;
        this.navigate(tmp + (new Date).getTime());
        this.navigate(tmp, { trigger: true })
    }
});
