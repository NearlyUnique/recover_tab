import { RunTests, assertEqual, assertHasNoValue, assertHasValue, skip, log } from './simple_test.js';
import { refresh } from './recover.js';
const TAB_1 = {
    favIconUrl: "fav_1.ico",
    id: 1000, index: 0, windowId: 1100,
    title: "title 1", url: "https://jira.com/ticket1",
    active: false,
    highlighted: false,
};
const TAB_2 = {
    favIconUrl: "fav_2.ico",
    id: 1001, index: 1, windowId: 1100,
    title: "title 2", url: "https://google.com/drive/document2",
    active: false,
    highlighted: false,
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
    "tabs properties are stipped down": () => {
        let cur = [{ ...TAB_1, otherProperty: "any" }];
        let state = {
            saveOpts: { stopUrls: [] },
            tabs: []
        }

        refresh(state, cur);

        assertEqual(1, state.tabs.length);
        assertHasNoValue(state.tabs[0].otherProperty);
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
    "EXPERIMENT: closed tabs are not removed, jsut marked": () => {
        const lastTab = {
            url:"https://lasttab.com",
            favIconUrl:"#",
            title:"Last Tab",
            id:999,
            index:999,
            active:false,
            highlighted:false,
        }
        let cur = [lastTab, { ...TAB_2}];
        let state = {
            saveOpts: { stopUrls: [] },
            tabs: [lastTab, { ...TAB_1 }, { ...TAB_2 }]
        }

        refresh(state, cur);

        assertEqual(3, state.tabs.length);
        assertEqual(true, state.tabs.findIndex(x => x.id === lastTab.id) >= 0 , "last tab still there");
        const t1 = state.tabs.findIndex(x => x.id === TAB_1.id)
        assertEqual(true, t1 >= 0, "tab 1 still there");
        assertEqual(true, state.tabs[t1].toRemove, "tab 1 still there");
        assertEqual(true, state.tabs.findIndex(x => x.id === TAB_2.id) >= 0, "tab 2 still there");
    }
});
