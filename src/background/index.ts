
chrome.runtime.onInstalled.addListener((details) => {
    // 注册右键菜单
    chrome.contextMenus.create({
        title: "记笔记",
        id: "context-menu-1",
        contexts: ["page", "selection"],
    })

    // 初始化设置
    chrome.storage.sync.set({
        port: 3002,
    })
})

// 每次打开插件时注册事件
chrome.contextMenus.onClicked.addListener(async (event) => {
    let [currentTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
    // console.log("点击了选项")
    if (currentTab.id) {
        // console.log(currentTab.id)
        chrome.tabs.sendMessage(currentTab.id, { type: "GET_WORD", selection: event.selectionText })
    }
})



// async function loadData() {
//     let res = await fetch("http://localhost:8086/words_simple/all/", { mode: "no-cors" })
//     let data = await res.json()
//     console.log(data)
// }
// loadData()


export { }
