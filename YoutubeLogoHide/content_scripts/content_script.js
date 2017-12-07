var settings = {
    scrollX: "0",
    scrollY: "80",
    positionX: "0",
    positionY: "0",
    width: "460",
    height: "360",
    showHelpOnPopup: true
};

var hotkeys = "Ctrl+Alt+M - Hide/show menu\n" +
    "Ctrl+Alt+C - Scroll\n" +
    "Ctrl+Alt+D - Done both hide and scroll\n" +
    "Ctrl+Alt+N - New window\n" +
    "Ctrl+Alt+R - Reset settings(available only in popup)\n" +
    "Ctrl+Alt+H - Help (show hotkeys info)\n";

function loadSettings(callback) {
    chrome.storage.sync.get("settings", function (items) {
        if (items.settings) {
            settings = items.settings;
        }
        if (callback) {
            callback(settings);
        }
    });
}

function saveSettings() {
    chrome.storage.sync.set({ "settings": settings }, function () {});
}

function isHeaderShown(parameters, sender, sendResponse) {
    var header = document.querySelector("#container");
    if (header == null) {
        return null;
    }
    var result = header.style.display != "none";
    if (parameters) {
        parameters.callback(result);
    }
    return result;    
}

function hideHeader(parameters, sender, sendResponse) {
    var header = document.querySelector("#container");
    if (header != null) {
        header.style.display = "none";
    }
}

function showHeader(parameters, sender, sendResponse) {
    var header = document.querySelector("#container");
    if (header != null) {
        header.style.display = "flex";
    }
}

function scroll(parameters, sender, sendResponse) {
    window.scrollTo(settings.scrollX, settings.scrollY);
}

function doneAll(parameters, sender, sendResponse) {
    hideHeader();
    scroll();
}

function help(parameters, sender, sendResponse) {
    alert(hotkeys);
}

function openNew(parameters, sender, sendResponse) {
    var url = window.location;
    loadSettings(function (settings) {
        var myWindow = window.open(url, '_blank', `resizable=yes, scrollbars=yes, titlebar=yes,width=${settings.width}, height=${settings.height}, left=${settings.positionX}, top=${settings.positionY},alwaysRaised`);
        myWindow.focus();
    });
}

function resetSettings(parameters, sender, sendResponse) {
    if (confirm("Apply window size?")) {
        settings.width = window.innerWidth;
        settings.height = window.innerHeight;
    }

    if (confirm("Apply scroll?")) {
        settings.scrollX = window.scrollX;
        settings.scrollY = window.scrollY;
    }

    if (confirm("Apply window position?")) {
        settings.positionX = window.screenLeft;
        settings.positionY = window.screenTop;
    }
    saveSettings();
}

function keyDown(e) {
    if (!(e.altKey && e.ctrlKey)) {
        return;
    }
    var keyCode = e.keyCode;
    if (keyCode == 77) { // "M" hide/show menu
        if (isHeaderShown()) {
            hideHeader();
        } else {
            showHeader();
        }
    }
    if (keyCode == 67) { // "C" scroll
        scroll();
    }
    if (keyCode == 78) { // "N" new window
        openNew();
    }
    if (keyCode == 68) { // "D" doneAll
        doneAll();
    }
    if (keyCode == 72) { // "H" help 
        help();
    }    
    if (window.opener && keyCode == 82) { // "R" reset settings only in popup
        resetSettings();
    }
}

function main() {
    console.log(`main`); 
    var messageCallbacks = {
        "isHeaderShown": isHeaderShown,
        "hideHeader": hideHeader,
        "showHeader": showHeader,
        "openWindow": openNew,
        "scroll": scroll,
        "doneAll": doneAll,
        "help": help,
    }

    console.log(`before listener`);
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            console.log(`receive message with action ${request.action}: \n${JSON.stringify(request)}`);
            if (messageCallbacks[request.action]) {
                messageCallbacks[request.action](request.parameters, sender, sendResponse);
            } else {
                console.error(`unrecognizes action ${request.action}: \n${JSON.stringify(request)}`);
            }
        }
    );

    document.addEventListener('keydown', keyDown, false)
    console.log(`window.opener`);
    console.log(window.opener);    
    if (window.opener) {
        console.log(`set timer`);
        var timerId = setInterval(function () {
            console.log("interval");
            if (isHeaderShown()) {
                doneAll();
            }
            if (isHeaderShown() == false) {                
                clearInterval(timerId);
                if (settings.showHelpOnPopup) {
                    if (!confirm(`Menu is not available in new window. Control by hotkeys:\n${hotkeys}\nContinue show this message?`)) {
                        settings.showHelpOnPopup = false;
                        saveSettings();
                    }
                }
            }
        }, 500);
    }
}

loadSettings(main);