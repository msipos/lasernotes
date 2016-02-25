window.App = {
    demo: false,
    start: function(demo) {
        this.demo = demo || false;
        this.init();
        this.templates.preloadTemplates();
        $(document).ready(function() {
            App.initDom();
            App.renderMain("loader.html");
            App.startHistory();
        });
        this.previousUrl = null;
    },
    init: function() {
        if (this.demo) {
            this.backend = require("./backend_demo.js");
        } else {
            this.backend = require("./backend.js");
        }
        this.crypto = require("./crypto.js");
        this.crypto.init();
        this.cryptoState = require("./crypto_state.js");
        this.csrf = require("./csrf.js");
        this.csrf.init();
        this.router = new(require("./router.js"));
        this.templates = require("./templates.js");
        this.util = require("./util.js");

        this.leaveHelper = null;
        $(window).on("beforeunload", (e) => {
            if (this.leaveHelper !== null) {
                var result = this.leaveHelper();
                if (result) return result;
            }
        });
    },

    initDom: function() {
        this.jqMainContent = $("#mainContent");
    },

    startHistory: function() {
        Backbone.history.start({pushState: true, root: "/app/"});
    },

    navigate: function(url) {
        if (this.leaveHelper !== null) {
            var result = this.leaveHelper();
            if (result) {
                if (!confirm(result)) return;
            }
            this.leaveHelper = null;
        }

        if (url == this.previousUrl) {
            // Bit of a hack here: we want to "refresh a page" when pressing lock button.
            if (url == "") {
                this.router.journalIndex();
            }
        } else {
            this.router.navigate(url, {trigger: true});
            this.previousUrl = url;
        }
    },

    renderMain: function(name, context) {
        return this.templates.renderTemplate(App.jqMainContent, name, context);
    },

    click: function(e) {
        var index = e.href.indexOf('/app/');
        if (index < 0) return true;
        var left = e.href.slice(index+5);
        App.navigate(left);
        return false;
    },

    logOut: function() {
        $("#logoutForm").submit();
        return false;
    },

    lock: function(id) {
        this.cryptoState.lockCollection(id);
        this.navigate("");
    }
};
