function redirect(cId) {
    App.navigate("journal/" + cId + "/");
}

function onUnlockClick(collection, e) {
    e.preventDefault();

    var password = $("#journalPassword").val();

    var params = collection.encrypted_params;

    var epp = JSON.parse(params.effective_password_params);
    var ep = App.crypto.computeEffectivePassword(password, epp);

    var cp = JSON.parse(params.challenge_params);
    if (!App.crypto.checkChallengeHash(ep, params.challenge, cp, params.challenge_hash)) {
        App.router.displayError("Incorrect password.")
        return;
    }
    App.cryptoState.unlockCollection(collection.id);
    redirect(collection.id);
}

function render(collection) {
    return App.renderMain("unlock.html", {collection: collection}).then(function() {
        var p = _.partial(onUnlockClick, collection, _);
        $("#journalPassword").focus();
        $("#unlockButton").on("click", p);
        $("#passwordForm").on("submit", p);

        // Clear out stupid uncontrollable password autofillers
        setTimeout(function() { $("#journalPassword").val(""); },
                   150);

    });
}

// Controller for "/app/journals/:id/unlock/"
function index(cId) {
    App.renderMain("loader.html");

    App.backend.getCollection(cId, true).then(
        function(collection) {
            if (!collection.encrypted) return redirect(cId);
            if (collection.encrypted && !App.cryptoState.isLockedCollection(cId)) return redirect(cId);
            return render(collection);
        }
    )
}

// Check if collection is locked.
function check(collection) {
    if (collection.encrypted && App.cryptoState.isLockedCollection(collection.id)) {
        App.navigate("journal/" + collection.id + "/unlock/");
        return true;
    }
    return false;
}

module.exports.index = index;
module.exports.check = check;
