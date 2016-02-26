function compileContent(content) {
    return marked(content, {sanitize: true});
}

function onClickDelete(iId, cId, e) {
    e.preventDefault();

    bootbox.confirm("Are you sure you wish to delete this item? It will be permanently lost.", function(choice) {
        if (!choice) return;
        App.backend.deleteItem(iId).then(function() {
            var url = "journal/" + cId + "/"
            return App.navigate(url);
        });
    });
}

function onChangeVisibility(iId, e) {
    e.preventDefault();

    var choices = [
        'Private',
        'Public (visible on blog)'
    ];

    var dialog = {
        title: 'Choose visibility',
        text: 'Choose visibility for this entry:',
        choices: choices,
        callback: function(c) {
            var visibility = 'P';
            if (c === 1) visibility = 'V';
            App.backend.updateItemObject(iId, {visibility: visibility}).then(function() {
                App.navigate("item/" + iId + "/");
                App.router.refresh();
            });
        }
    };
    App.util.bootboxChoice(dialog); 
}

// Controller for "/app/item/:id/"
function index(item, collection) {
    item.content = compileContent(item.content);
    var context = {
        item: item,
        collection: collection
    };
    App.renderMain("item.html", context).then(function() {
        $("#deleteItemButton").on("click", _.partial(onClickDelete, item.id, collection.id, _));

        $("#changeVisibilityLink").on("click", _.partial(onChangeVisibility, item.id, _));
    });
}

var dirtyFlag;
var leaveHelperFlag;

function leaveHelper() {
    if (leaveHelperFlag) return;
    if (!dirtyFlag) return;
    return "Your changes will not be saved if you leave the page. Are you sure you wish to leave the page?";
}

function setupLeaveHelper() {
    dirtyFlag = false;
    leaveHelperFlag = false;
    App.leaveHelper = leaveHelper;

    $("#itemName, #itemContents").on("keyup input change", function() {
        dirtyFlag = true;
    });
}

function onClickAccept(collection, item, acceptType, typ, e) {
    e.preventDefault();
    var title = $("#itemName").val();
    var text = $("#itemContents").val();
    var notes = $("#itemNotes").val();

    if (collection.encrypted) {
        title = App.cryptoState.encrypt(collection.id, title);
        text = App.cryptoState.encrypt(collection.id, text);
    }

    if (acceptType === "new") {
        App.backend.newItem(title, text, notes, typ, collection.id).then(function(item) {
            var url = "item/" + item.id + "/";
            leaveHelperFlag = true;
            return App.navigate(url);
        });
    } else {
        App.backend.updateItem(item.id, title, text, notes, typ).then(function() {
            var url = "item/" + item.id + "/"
            leaveHelperFlag = true;
            return App.navigate(url);
        });
    }
}

function resetTabs() {
  $("#previewTab, #editTab, #helpTab").removeClass("active");
  $("#itemContents, #previewContents, #helpContents").addClass("hidden");
}

function setupEditPreviewTabs() {
  $("#editTab > a").on("click", function(e) {
    e.preventDefault();
    resetTabs();
    $("#editTab").addClass("active");
    $("#itemContents").removeClass("hidden");
  });
  $("#previewTab > a").on("click", function(e) {
    e.preventDefault();

    var textArea = $("#itemContents");
    var preview = $("#previewContents");

    // Set preview contents to have height to prevent jumping.
    var height = textArea.css("height");
    preview.css("min-height", height);

    // Compile contents
    var content = textArea.val();
    preview.html(compileContent(content));

    // Switch
    resetTabs();
    $("#previewTab").addClass("active");
    preview.removeClass("hidden");
  });
  $("#helpTab > a").on("click", function(e) {
    e.preventDefault();

    // Set help contents to have height to prevent jumping.
    var textArea = $("#itemContents");
    var height = textArea.css("height");
    $("#helpContents").css("min-height", height);

    resetTabs();
    $("#helpTab").addClass("active");
    $("#helpContents").removeClass("hidden");
  });
}

// Controller for "/app/item/:id/edit/"
function edit(item, collection) {
    var context = {
        action: "Edit",
        collection_id: collection.id,
        collection_name: collection.name,
        title: item.title,
        content: item.content,
        notes: item.notes,
        typ: item.typ
    };

    App.renderMain("items_edit.html", context).then(function() {
        $("#itemName").focus();
        $("#acceptItem").on("click", _.partial(onClickAccept, collection, item, "edit", item.typ, _));
        setupLeaveHelper();
        setupEditPreviewTabs();
    });
}

// Controller for "/app/journal/:id/new/"
function newItem(collection) {
    var context = {
        action: "New",
        collection_id: collection.id,
        collection_name: collection.name,
        title: null,
        content: null,
        notes: null,
        typ: "E"
    };
    return App.renderMain("items_edit.html", context).then(function() {
        $("#itemName").focus();
        $("#acceptItem").on("click", _.partial(onClickAccept, collection, null, "new", 'E', _));
        setupLeaveHelper();
        setupEditPreviewTabs();
    });
}

// Controller for "/app/journal/:id/new/url/?:params"
function newUrl(collection, params) {
    var title = null, content = null;
    if (params) {
        if (params.title) {
            title = params.title;
        }
        if (params.content) {
            content = params.content;
        }
    }
    var context = {
        action: "New",
        collection_id: collection.id,
        collection_name: collection.name,
        title: title,
        content: content,
        notes: null,
        typ: "U"
    };
    return App.renderMain("items_edit.html", context).then(function() {
        $("#itemName").focus();
        $("#acceptItem").on("click", _.partial(onClickAccept, collection, null, "new", 'U', _));
        setupLeaveHelper();
    });
}

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


module.exports.edit = edit;
module.exports.editDate = editDate;
module.exports.index = index;
module.exports.newItem = newItem;
module.exports.newUrl = newUrl;
