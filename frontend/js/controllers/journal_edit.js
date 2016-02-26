// Controller for "/app/journal/edit/"
function index(collection) {
    App.renderMain("journals_edit.html", { collection: collection }).then(function() {
        $("#journalName").focus();

        var journalBlogged = $("#journalBlogged");
        var journalBlog = $("#journalBlog");

        // Appear journalBlog on checkbox click
        journalBlogged.on("change", function() {
            if (journalBlogged.prop("checked")) {
                journalBlog.removeClass("hide");
            } else {
                journalBlog.addClass("hide");
            }
        });

        // handle button click
        $("#saveJournal").on("click", function(e) {
            e.preventDefault();

            App.backend.updateCollectionObject(collection.id, {
                name: $("#journalName").val(),
                blogged: journalBlogged.prop("checked"),
                blog_slug: $("#journalBlogSlug").val(),
                blog_desc: $("#journalBlogDesc").val()
            }).then(function() {
                App.navigate("journal/" + collection.id + "/");
            });
        });

        return null;
    });
}

module.exports.index = index;
