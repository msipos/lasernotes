module.exports = {
    unlockCollection: function(id, effectivePassword) {
        localStorage.setItem("eff_" + id, effectivePassword);
    },
    lockCollection: function(id) {
        localStorage.removeItem("eff_" + id);
    },
    isLockedCollection: function(id) {
        return localStorage.getItem("eff_" + id) ? false : true;
    },
    decrypt: function(id, content) {
        var key = localStorage.getItem("eff_" + id);
        if (!key) return null;

        return sjcl.decrypt(key, content);
    },
    encrypt: function(id, content) {
        var key = localStorage.getItem("eff_" + id);
        if (!key) return false;

        return sjcl.encrypt(key, content);
    }
};
