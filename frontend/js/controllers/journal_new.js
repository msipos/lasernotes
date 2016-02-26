// Handle click on newJournal
function onNewJournalClick(e) {
    e.preventDefault();

    var name = $("#journalName").val();
    var encrypted = $("#journalEncrypted").is(":checked");
    var blogged = $("#journalBlogged").is(":checked");

    var obj = {
        name: name,
        encrypted: encrypted,
        blogged: blogged
    }

    if (encrypted) {
        var password = $("#journalPassword").val();
        var verify = $("#journalVerify").val();
        if (password !== verify) {
            App.router.displayError("Passwords don't match.");
            return;
        }
        if (password.length <= 4) {
            App.router.displayError("Password too short (must be at least 5 characters).");
            return;
        }

        var ip = App.crypto.initializePassword(password);

        obj.effective_password_params = JSON.stringify(ip.effectivePasswordParams);
        obj.challenge = ip.challenge;
        obj.challenge_hash = ip.challengeHash;
        obj.challenge_params = JSON.stringify(ip.challengeParams);
    } else if (blogged) {
        obj.blog_slug = $("#journalBlogSlug").val();
        if (obj.blog_slug.length < 3) {
            App.router.displayError("Slug too small (must be at least 3 characters).")
        }

        obj.blog_desc = $("#journalBlogDesc").val();
        if (obj.blog_desc.length < 3) {
            App.router.displayError("Description too small (must be at least 1 character).")
        }
    }

    App.backend.newCollectionObject(obj).then(function() {
        return App.navigate("");
    });
}

// Controller for "/app/journal/new/"
function index() {
    App.renderMain("journals_new.html").then(function() {
        $("#journalName").focus();

        var journalEncrypted = $("#journalEncrypted");
        var journalPasswords = $("#journalPasswords");
        var journalBlogged = $("#journalBlogged");
        var journalBlog = $("#journalBlog");

        // Appear journalEncrypted on checkbox click
        journalEncrypted.on("change", function() {
            if (journalEncrypted.prop("checked")) {
                journalPasswords.removeClass("hide");
                $("#journalPassword").val("");
                $("#journalVerify").val("");

                journalBlogged.prop("checked", false);
                journalBlogged.prop("disabled", true);
                journalBlog.addClass("hide");
            } else {
                journalPasswords.addClass("hide");
                journalBlogged.prop("disabled", false);
            }
        });

        // Appear journalBlog on checkbox click
        journalBlogged.on("change", function() {
            if (journalBlogged.prop("checked")) {
                journalBlog.removeClass("hide");
                journalPasswords.addClass("hide");
                journalEncrypted.prop("checked", false);
                journalEncrypted.prop("disabled", true);
            } else {
                journalBlog.addClass("hide");
                journalEncrypted.prop("disabled", false);
            }
        });

        // handle button click
        $("#newJournal").on("click", onNewJournalClick);

        return null;
    });
}

module.exports.index = index;
