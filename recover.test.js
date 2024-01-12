import { RunTests, assertEqual, assertHasValue, skip, log } from './simple_test.js';
import { refresh } from './recover.js';
const TAB_1 = {
    favIconUrl: "fav_1.ico",
    id: 1000, index: 0, windowId: 1100,
    title: "title 1", url: "https://jira.com/ticket1",
    active: false
};
const TAB_2 = {
    favIconUrl: "fav_2.ico",
    id: 1001, index: 1, windowId: 1100,
    title: "title 2", url: "https://google.com/drive/document2",
    active: false
};
RunTests({
    "tabs and their properties are kept": () => {
        let cur = [{ ...TAB_1 }];
        let state = {
            saveOpts: { stopUrls: [] },
            tabs: []
        }

        refresh(state, cur);

        assertEqual(1, state.tabs.length);
        assertEqual(TAB_1, state.tabs[0]);
    },
    "a tab is updated based on it's id": () => {
        const newUrl = "https://news.site/any-page";
        let cur = [
            { ...TAB_1, url: newUrl },
            { ...TAB_2 }
        ];
        assertEqual(newUrl, cur[0].url, "test prep");

        let state = {
            saveOpts: { stopUrls: [] },
            tabs: [{ ...TAB_1 }, { ...TAB_2 }]
        }

        refresh(state, cur);

        assertEqual(2, state.tabs.length);
        assertEqual(newUrl, state.tabs[0].url);
        assertEqual(TAB_2.url, state.tabs[1].url);
    },
    "a tab is not updated if it has moved to a stop URL": () => {
        let cur = [{ ...TAB_1, url: "https://example.com/anything" },{...TAB_2}];
        let state = {
            saveOpts: { stopUrls: ["example.com"] },
            tabs: [{ ...TAB_1 }, { ...TAB_2 }]
        }

        refresh(state, cur);

        assertEqual(2, state.tabs.length);
        assertEqual(TAB_1.url, state.tabs[0].url);
        assertEqual(TAB_2.url, state.tabs[1].url);
    },
    "a tab null tab won't break anything": () => {
        let cur = [{ ...TAB_1, url: null },{...TAB_2}];
        let state = {
            saveOpts: { stopUrls: [] },
            tabs: [{ ...TAB_1 }, { ...TAB_2 }]
        }

        refresh(state, cur);

        assertEqual(2, state.tabs.length);
        assertEqual(TAB_1.url, state.tabs[0].url);
        assertEqual(TAB_2.url, state.tabs[1].url);
    },
    "refresh returns the active tab details": () => {
        const activeTab = {...TAB_2, url: "https://new.site", active: true, highlighted: true};
        let cur = [{ ...TAB_1}, activeTab];
        let state = {
            saveOpts: { stopUrls: [] },
            tabs: [{ ...TAB_1 }, { ...TAB_2 }]
        }

        const actual = refresh(state, cur);

        assertEqual(activeTab, actual);
    },
    "returned active tab details don't be a stop tab": () => {
        const navigatedToStopTab = {...TAB_2, url: "https://ignore.com/any/", active: true, highlighted: true};
        let cur = [{ ...TAB_1}, navigatedToStopTab];
        let state = {
            saveOpts: { stopUrls: ["https://ignore.com"] },
            tabs: [{ ...TAB_1 }, { ...TAB_2 }]
        }

        const actual = refresh(state, cur);

        assertEqual({...TAB_2}, actual);
    },
    "closed tabs are removed": () => {
        let cur = [{ ...TAB_2}];
        let state = {
            saveOpts: { stopUrls: [] },
            tabs: [{ ...TAB_1 }, { ...TAB_2 }]
        }

        refresh(state, cur);

        assertEqual(1, state.tabs.length);
        assertEqual({...TAB_2}, state.tabs[0]);
    }
});
