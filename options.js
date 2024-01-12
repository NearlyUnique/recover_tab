import { load, save } from "./recover.js";

async function initPage() {
    const state = await load();
    let content = state?.saveOpts?.stopUrls || [];
    stopUrls.value = content.join("\n").trim();
}
async function optionsSave() {
    const state = await load();
    state.saveOpts.stopUrls = stopUrls.value
        .split("\n")
        .map(x => x.trim())
        .filter(x => x.length > 0);
    await save(state);
}
async function optionsReset() {
    await chrome.storage.local.clear();
    await save({
        saveOpts: { stopUrls: [] },
        tabs: []
    });
    stopUrls.value = "";
}

const stopUrls = document.getElementById('stop_urls');
await initPage();

document.getElementById('debug_options').addEventListener("click", async () => {
    await initPage();
});

document.getElementById('save_opts').addEventListener("click", async () => {
    await optionsSave();
});

document.getElementById("reset").addEventListener("click", async () => {
    await optionsReset();
});

