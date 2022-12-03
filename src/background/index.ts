import Api from "../api";

chrome.runtime.onInstalled.addListener((details) => {
    // 注册右键菜单
    chrome.contextMenus.create({
        title: "记笔记",
        id: "context-menu-1",
        contexts: ["page", "selection"],
    });

    // 初始化设置
    chrome.storage.sync.set({
        port: 3002,
    });
});

// 每次打开插件时注册事件
chrome.contextMenus.onClicked.addListener(async (event) => {
    let [currentTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (currentTab.id) {
        chrome.tabs.sendMessage(currentTab.id, { type: "GET_WORD", selection: event.selectionText });
    }
});

let api: Api;
chrome.storage.sync.get(["port"], (data) => {
    api = new Api(data.port ?? 3002);
});

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "CHANGE_PORT") {
        api.port = msg.port;
    }
});
chrome.runtime.onMessage.addListener((msg, _, cb) => {
    if (msg.type === "SEARCH_WORD") {
        api.getExpression(msg.word).then(cb);
        return true;
    }
});
chrome.runtime.onMessage.addListener((msg, _, cb) => {
    if (msg.type === "GET_TAGS") {
        api.getTags().then(cb);
        return true;
    }
});
chrome.runtime.onMessage.addListener((msg, _, cb) => {
    if (msg.type === "POST_WORD") {
        api.postExpression(msg.data).then(cb);
        return true;
    }
});


chrome.alarms.create("echo", { periodInMinutes: 1 / 6 });
chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "echo") {
        let status = await api.echo();
        if (status === 200) {
            chrome.action.setBadgeText({ text: "ON" });
            chrome.action.setBadgeBackgroundColor({ color: "#55bb55" });
        } else {
            chrome.action.setBadgeText({ text: "OFF" });
            chrome.action.setBadgeBackgroundColor({ color: "#fb7254" });
        }
    }
});


// async function loadData() {
//     let res = await fetch("http://localhost:8086/words_simple/all/", { mode: "no-cors" })
//     let data = await res.json()
//     console.log(data)
// }
// loadData()


export { };
