export async function update() {
    const tabs = await chrome.tabs.query({});
    const currentWindow = await chrome.windows.getCurrent();
    const collator = new Intl.Collator();
    tabs.filter(x => !!x.url).sort((a, b) => collator.compare(a.index, b.index));
    let state = await load();

    let active = refresh(state, tabs, currentWindow);

    if (active) {
        document.getElementById("recover_tab").hidden = false;
        document.getElementById("recover_title").innerText = active.title;
        document.getElementById("recover_img").setAttribute("src", active.favIconUrl);
        document.getElementById("recover_tab").addEventListener("click", async () => {
            await chrome.tabs.update(active.id, { url: active.url });
        });
        document.getElementById("nothing").hidden = true;
    } else {
        document.getElementById("recover_tab").hidden = true;
        document.getElementById("nothing").hidden = false;
    }
    await save(state);
    displayTabList(state);
}
function keepTab(state, current) {
    return !state.saveOpts.stopUrls.some(stop => current.url.includes(stop))
}
function isActiveTab(tab, currentWindow) {
    if (currentWindow && currentWindow.id) {
        return tab.windowId == currentWindow.id && tab.active && tab.highlighted;
    }
    return tab.active && tab.highlighted;
}
function keepMinimal(obj) {
    return {
        id: obj.id,
        index: obj.index,
        windowId: obj.windowId,
        title: obj.title,
        url: obj.url,
        favIconUrl: obj.favIconUrl,
        active: obj.active,
        highlighted: obj.highlighted,
    };
}
/// updates state
export function refresh(state, latest, currentWindow) {
    let active = null;
    for (let i = 0; i < latest.length; i++) {
        if (!latest[i].url) {
            continue;
        }
        const keep = keepTab(state, latest[i]);
        let prev = state.tabs.findIndex(x => x.id === latest[i].id);
        if (keep) {
            if (prev === -1) {
                // new tab
                prev = state.tabs.push(keepMinimal(latest[i])) - 1;
            } else {
                // update stored tab
                state.tabs[prev] = keepMinimal(latest[i]);
            }
        }
        if (prev !== -1 && !active && isActiveTab(latest[i], currentWindow)) {
            active = state.tabs[prev];
        }
    }
    // remove old tabs
    let maxLen = state.tabs.length;
    for (let i = maxLen - 1; i >= 0; i--) {
        const found = latest.findIndex(x => x.id === state.tabs[i].id);
        if (found === -1) {
            // state.tabs.splice(i, 1);
            // temp, don't remove it, just mark it
            state.tabs[i].toRemove = true;
        }
    }
    return active;
}
function displayTabList(state) {
    const template = document.getElementById("li_template");
    const elements = new Set();
    state.tabs.forEach(tab => {
        const element = template.content.firstElementChild.cloneNode(true);

        element.querySelector("img").setAttribute("src", tab.favIconUrl);
        element.querySelector(".title").textContent = tab.title;
        element.querySelector("a").setAttribute("href", tab.url);
        element.addEventListener("click", async () => {
            let cur = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
            await chrome.tabs.update(cur.id, { url: tab.url });
            return false;
        });

        elements.add(element);
    });
    document.querySelector("ul").append(...elements);
}
export async function save(state) {
    await chrome.storage.local.set(state);
}
export async function load() {
    let state = await chrome.storage.local.get();
    if (!state || !state.tabs || state.tabs.length === 0) {
        state = {
            saveOpts: { stopUrls: [] },
            tabs: []
        };
    }
    return state;
}
export function preparePage(document) {
    document
        .getElementById("update")
        .addEventListener("click", async () => {
            await update();
        });
    let el = document.querySelector("ul");
    el.hidden = true;
    let btn = document.getElementById("toggle_show");
    btn.addEventListener("click", () => {
        btn.innerText = el.hidden ? "Hide" : "Show Tabs";
        el.hidden = !el.hidden;
    });
}
