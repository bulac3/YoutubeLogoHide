var showCheckBoxOn;
var showCheckBoxOff;

function sendMessage(action, parameters, callback) {
    console.log(`sendMessage action - ${action}`);
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: action, parameters: parameters }, function (response) {
            console.log(`sendMessage callback`);
            if (callback) {
                console.log(`sendMessage call`);
                callback(response)
            }
        });
    });
}

function isHeaderShown(callback) {
    chrome.tabs.executeScript(null, {
        code: '\
            var header = document.querySelector("#container");\
            var result = null;\
            result = !(header.style.display == "none");\
            result;'
    }, function (result) {
        callback(result[0]);
    });
}

function setSwitcher(param) {
    if (param) {
        showCheckBoxOff.checked = true;
    } else {
        showCheckBoxOn.checked = true;
    }    
}

function showSwitcherChange(event) {
    if (event.target.value == "on") {
        hideHeader();
    } else {
        showHeader();
    }
}

function onLoad() {
    showCheckBoxOn = document.querySelector(".toggle-bg input[value='on']");
    showCheckBoxOff = document.querySelector(".toggle-bg input[value='off']");

    document.querySelector(".open-window").addEventListener("click", function () { sendMessage("openWindow") });
    document.querySelector(".scroll").addEventListener("click", function () { sendMessage("scroll") });
    document.querySelector(".help").addEventListener("click", function () { sendMessage("help") });

    showCheckBoxOn.addEventListener("change", showSwitcherChange);
    showCheckBoxOff.addEventListener("change", showSwitcherChange);

    isHeaderShown(setSwitcher);
}

window.addEventListener("load", onLoad);