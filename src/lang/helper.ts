import zh from "./locale/zh"
import en from "./locale/en"

const localeMap: { [k: string]: Partial<typeof en> } = {
    en,
    "zh-CN": zh,
}


const lang = chrome.i18n.getUILanguage()
const locale = localeMap[lang || "en"]

export function t(text: keyof typeof en): string {
    return (locale && locale[text]) || en[text]
}