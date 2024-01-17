import { load, refresh, save } from "./recover.js";

// fn filter, e.g. "x => x.toRemove"
async function showState(fn) {
    fn = fn || (_ => true);
    return await chrome.storage.local.get().tabs.find(fn);
}
async function update() {
    const tabs = await chrome.tabs.query({});
    const currentWindow = await chrome.windows.getCurrent();
    const collator = new Intl.Collator();
    tabs.filter(x => !!x.url).sort((a, b) => collator.compare(a.index, b.index));
    let state = await load();
    refresh(state, tabs, currentWindow);
    await save(state);
}
function tabHandlers() {
    chrome.runtime.onInstalled.addListener(async (info) => {
        if (info.reason === 'install') {
            await update();
        }
    });
    chrome.tabs.onUpdated.addListener(async function (tabId, info, tab) {
        // console.log({ name: "onUpdated", tabId, info, tab_id: tab.id, tab_index: tab.index, tab_windowId: tab.windowId, tab_title: tab.title, tab_url: tab.url });
        await update();
    });
    // chrome.tabs.onRemoved.addListener(function (tabId, info) {
    //     console.log({ name: "onRemoved", tabId, info });
    // });
}

tabHandlers();
