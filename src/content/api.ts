import { ExpressionInfo } from "./interface";

async function searchWord(word: string): Promise<ExpressionInfo | undefined> {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type: "SEARCH_WORD", word }, (res) => {
            resolve(res);
        });
    });
}
async function postWord(data: ExpressionInfo): Promise<number | undefined> {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type: "POST_WORD", data }, (res) => {
            resolve(res);
        });
    });
}
async function getTags(): Promise<string[] | undefined> {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type: "GET_TAGS" }, (res) => {
            resolve(res);
        });
    });
}



export {
    searchWord,
    postWord,
    getTags,
};