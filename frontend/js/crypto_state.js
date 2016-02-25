module.exports = {
    unlockCollection: function(id, effectivePassword) {
        sessionStorage.setItem("eff_" + id, effectivePassword);
    },
    lockCollection: function(id) {
        sessionStorage.removeItem("eff_" + id);
    },
    isLockedCollection: function(id) {
        return sessionStorage.getItem("eff_" + id) ? false : true;
    },
    decrypt: function(id, content) {
        var key = sessionStorage.getItem("eff_" + id);
        if (!key) return null;

        return sjcl.decrypt(key, content);
    },
    encrypt: function(id, content) {
        var key = sessionStorage.getItem("eff_" + id);
        if (!key) return false;

        return sjcl.encrypt(key, content);
    }
};
