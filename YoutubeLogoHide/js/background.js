function updateIcon(tab) {
	if (!tab) {
		return
	}
	if (!tab.url || tab.url.indexOf('.youtube.com/watch') <= -1) {
		chrome.browserAction.disable(tab.id)	
	} else {
		chrome.browserAction.enable(tab.id)	
	}
}

chrome.tabs.onActivated.addListener((activeInfo) => {
	chrome.tabs.get(activeInfo.tabId, (tab) => {updateIcon(tab)})
});
chrome.tabs.onReplaced.addListener((newId, oldId) => {
	chrome.tabs.get(newId, (tab) => {updateIcon(tab)})
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	updateIcon(tab)
});
