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
    preview.html(App.util.compileContent(content));

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

module.exports.edit = edit;
module.exports.newItem = newItem;
module.exports.newUrl = newUrl;
