// Controller for "/app/journal/:id/edit-date/"
function editDate(item, collection) {
    var context = {
        collection_id: collection.id,
        collection_name: collection.name,
        title: item.title,
        content: item.content,
        notes: item.notes,
        typ: item.typ
    };

    App.renderMain("edit_date.html", context).then(function() {
        $("#dateInput").val(App.util.formatDatePicker(new Date(item.created_at)));
        $('#dateInput').datepicker({});

        $("#setDateButton").on("click", function(e) {
            e.preventDefault();
            var d = $("#dateInput").val();
            App.backend.updateItemObject(item.id, {created_at: d}).then(function() {
                var url = "item/" + item.id + "/";
                return App.navigate(url);
            });
        });
    });
}

module.exports.editDate = editDate;
