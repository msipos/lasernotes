// Handle click on newJournal
function onNewJournalClick(e) {
    e.preventDefault();

    var name = $("#journalName").val();
    var encrypted = $("#journalEncrypted").is(":checked");

    if (encrypted) {
        var password = $("#journalPassword").val();
        var verify = $("#journalVerify").val();
        if (password !== verify) {
            App.router.displayError("Passwords don't match.");
            return;
        }
        if (password.length <= 4) {
            App.router.displayError("Password too short.");
            return;
        }

        var obj = App.crypto.initializePassword(password);

        App.renderMain("loader.html").then(function() {
            return App.backend.newCollection(
                name,
                encrypted,
                JSON.stringify(obj.effectivePasswordParams),
                obj.challenge,
                obj.challengeHash,
                JSON.stringify(obj.challengeParams)
            );
        }).then(function() {
            return App.navigate("");
        });
    } else {
        App.renderMain("loader.html").then(function() {
            return App.backend.newCollection(name, encrypted, "", "", "", "");
        }).then(function() {
            return App.navigate("");
        });
    }
}

// Controller for "/app/journal/new/"
function index() {
    App.renderMain("journals_new.html").then(function() {
        $("#journalName").focus();

        // Appear journalEncrypted on checkbox click
        $("#journalEncrypted").on("change", function() {
            if ($("#journalEncrypted").prop("checked")) {
                $("#journalPasswords").removeClass("hide");
                $("#journalPassword").val("");
                $("#journalVerify").val("");
            } else {
                $("#journalPasswords").addClass("hide");
            }
        });

        // handle button click
        $("#newJournal").on("click", onNewJournalClick);

        return null;
    });
}

module.exports.index = index;
