<template>
    <div id="langr-learn-panel">
        <NConfigProvider :theme="theme">
            <NForm
                :model="model"
                label-placement="top"
                label-width="auto"
                :rules="rules"
                require-mark-placement="right-hanging"
            >
                <!-- 一个单词或短语字符串 -->
                <NFormItem
                    :label="t('Expression')"
                    :label-style="labelStyle"
                    path="expression"
                >
                    <NInput
                        v-model:value="model.expression"
                        :placeholder="t('A word or a phrase')"
                    />
                </NFormItem>
                <!-- 单词或短语的含义(精简) -->
                <NFormItem
                    :label="t('Meaning')"
                    :label-style="labelStyle"
                    path="meaning"
                >
                    <NInput
                        v-model:value="model.meaning"
                        :placeholder="t('A short definition')"
                        type="textarea"
                        autosize
                    />
                </NFormItem>
                <!-- 类别，可以是Word或Phrase -->
                <NFormItem
                    :label="t('Type')"
                    :label-style="labelStyle"
                    path="t"
                >
                    <NRadioGroup v-model:value="model.t">
                        <NRadio value="WORD">{{ t("Word") }}</NRadio>
                        <NRadio value="PHRASE">{{ t("Phrase") }}</NRadio>
                    </NRadioGroup>
                </NFormItem>
                <!-- 当前单词的学习状态 -->
                <NFormItem
                    :label="t('Status')"
                    :label-style="labelStyle"
                    path="status"
                >
                    <NRadioGroup v-model:value="model.status" size="small">
                        <NRadioButton :value="0">{{
                            t("Ignore")
                        }}</NRadioButton>
                        <NRadioButton :style="learningStyle" :value="1">{{
                            t("Learning")
                        }}</NRadioButton>
                        <NRadioButton :style="familiarStyle" :value="2">{{
                            t("Familiar")
                        }}</NRadioButton>
                        <NRadioButton :style="knownStyle" :value="3">{{
                            t("Known")
                        }}</NRadioButton>
                        <NRadioButton :style="LearnedStyle" :value="4">{{
                            t("Learned")
                        }}</NRadioButton>
                    </NRadioGroup>
                </NFormItem>
                <!-- 加一些tag, 可以用来搜索 -->
                <NFormItem
                    :label="t('Tags')"
                    :label-style="labelStyle"
                    path="tags"
                >
                    <NSelect
                        v-model:value="model.tags"
                        filterable
                        multiple
                        tag
                        :placeholder="t('Input or select some tags')"
                        :loading="tagLoading"
                        :options="tagOptions"
                        @search="tagSearch"
                    ></NSelect>
                </NFormItem>
                <!-- 可选,可以记多条笔记 -->
                <NFormItem
                    :label="t('Notes')"
                    :label-style="labelStyle"
                    path="tags"
                >
                    <NDynamicInput v-model:value="model.notes">
                        <template #create-button-default>
                            {{ t("Create") }}
                        </template>
                        <template #="{ index, value }">
                            <NInput
                                type="textarea"
                                :placeholder="t('Write a new note')"
                                v-model:value="model.notes[index]"
                        /></template>
                    </NDynamicInput>
                </NFormItem>
                <!-- 可选,例句也可以记多条 -->
                <div style="margin-bottom: 8px">
                    <label for="Sentences" :style="[labelStyle]">{{
                        t("Sentences")
                    }}</label>
                </div>
                <NDynamicInput
                    v-model:value="model.sentences"
                    :on-create="onCreateSentence"
                >
                    <template #create-button-default>
                        {{ t("Create") }}
                    </template>
                    <template #="{ index, value }">
                        <div
                            style="
                                display: flex;
                                flex-direction: column;
                                flex: 1;
                                border: 2px solid gray;
                                border-radius: 3px;
                                padding: 3px;
                            "
                        >
                            <NFormItem
                                :show-label="false"
                                :path="`sentences[${index}].text`"
                                :rule="sourceRule"
                            >
                                <NInput
                                    type="textarea"
                                    v-model:value="model.sentences[index].text"
                                    :placeholder="t('Origin sentence')"
                                    :autosize="{ minRows: 1, maxRows: 3 }"
                                />
                            </NFormItem>
                            <NFormItem
                                :show-feedback="false"
                                :show-label="false"
                                :path="`sentences[${index}].trans`"
                            >
                                <NInput
                                    type="textarea"
                                    v-model:value="model.sentences[index].trans"
                                    :placeholder="t('Translation (Optional)')"
                                    :autosize="{ minRows: 1, maxRows: 3 }"
                                />
                            </NFormItem>
                            <NFormItem
                                :show-feedback="false"
                                :show-label="false"
                                :path="`sentences[${index}].origin`"
                            >
                                <NInput
                                    type="textarea"
                                    v-model:value="
                                        model.sentences[index].origin
                                    "
                                    :placeholder="t('Origin (Optional)')"
                                    :autosize="{ minRows: 1, maxRows: 3 }"
                                />
                            </NFormItem>
                        </div>
                    </template>
                </NDynamicInput>
            </NForm>
            <!-- 提交按钮 -->
            <div style="margin-top: 10px">
                <NButton
                    style="--n-width: 100%"
                    attr-type="submit"
                    size="large"
                    @click="submit"
                    >{{ t("Submit") }}</NButton
                >
            </div>
        </NConfigProvider>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, CSSProperties } from "vue"
import {
    NForm,
    NFormItem,
    NInput,
    NRadio,
    NRadioButton,
    NRadioGroup,
    NButton,
    NDynamicInput,
    NSelect,
    SelectOption,
    NConfigProvider,
    darkTheme,
    useMessage,
    useLoadingBar
} from "naive-ui"

import { ExpressionInfo, Sentence } from "./interface"
import Api from "../api"
import { t } from "../lang/helper"


let message = useMessage()
const loading = useLoadingBar()


// 凑合
// let t = (x:string) => "XXX"

// 切换明亮/黑暗模式
// const theme = computed(() => {
// 	return store.dark? darkTheme: null
// })
const theme = null;

let api: Api;
chrome.storage.sync.get(["port"], (data) => {
    api = new Api(data.port)	
})
chrome.runtime.onMessage.addListener((msg) => {
    console.log("panel收到改变port信息")
    if(msg.type === "CHANGE_PORT"){
        console.log("panel执行")
        api.port = msg.port
    }
})


//表单数据
let model = ref<ExpressionInfo>({
    expression: "",
    meaning: "",
    status: 0,
    t: "WORD",
    tags: [],
    notes: [],
    sentences: [],
})

// 表单检查规则
let rules = {
    expression: {
        required: true,
        trigger: ["blur", "input"],
        message: t("Please input a word/phrase"),
    },
    meaning: {
        required: true,
        trigger: ["blur", "input"],
        message: t("A short definition is needed"),
    },
    t: {
        required: true,
        trigger: "change",
        message: "Expression can be a word or phrase",
    },
    status: {
        required: true,
    },
}

let sourceRule = {
    required: true,
    trigger: ["blur", "input"],
    message: "At least input a source sentence",
}

let labelStyle: CSSProperties = {
    fontSize: "16px",
    fontWeight: "bold",
    padding: "0 0 8px 2px",
}

function onCreateSentence() {
    return {
        text: "",
        trans: "",
        origin: "",
    }
}

// 单词状态样式
const basicStyle = {}
const learningStyle = {
    backgroundColor: "#ff980055",
}
const familiarStyle = {
    backgroundColor: "#ffeb3c55",
}
const knownStyle = {
    backgroundColor: "#9eda5855",
}
const LearnedStyle = {
    backgroundColor: "#4cb05155",
}

// 异步获取数据库中所有tag
let tagOptions = ref<SelectOption[]>([])
let tagLoading = ref(false)
let tags: string[] = []

async function tagSearch(query: string) {
    tagLoading.value = true
    if (query.length < 2) {
        tags = await api.getTags() ?? []
    }
    tagLoading.value = false

    if (!query.length) {
        tagOptions.value = tags.map((v) => {
            return { label: v, value: v }
        })
        return
    }
    tagOptions.value = tags
        .filter((v) => ~v.indexOf(query))
        .map((v) => {
            return { label: v, value: v }
        })
}

// 提交信息到数据库的加载状态

async function submit() {
    // 表单内容检查
    if (!model.value.expression) {
        message.warning(t("Expression is empty!"))
        return
    }
    if (!model.value.meaning) {
        message.warning(t("Meaning is empty!"))
        return
    }
    if (
        model.value.expression.trim().split(" ").length > 1 &&
        model.value.t === "WORD"
    ) {
        message.warning(t("It looks more like a PHRASE than a WORD"))
        return
    }

    let data = JSON.parse(JSON.stringify(model.value));
    (data as any).expression = (data as any).expression.trim().toLowerCase()
    // 超过1条例句时，sentences中的对象会变成Proxy，尚不知原因，因此用JSON转换一下
    loading.start()
    let statusCode = await api.postExpression(data)

    if (statusCode !== 200) {
        loading.error()
        message.warning("Submit failed")
        console.warn("Submit failed, please check server status")
        return
    }
    loading.finish()
}

// 查询词汇时自动填充新词表单
async function onSearch(selection: string) {
    // console.log("before get")
    let expr = await api.getExpression(selection)
    // console.log("after get")

    let exprType = "WORD"
    if(selection.trim().includes(" ")) {
        exprType = "PHRASE"
    }

    if(expr) {
        model.value = expr
        return
    }else {
        model.value = {
            expression: selection,
            meaning: "",
            status: 1,
            t: exprType,
            tags: [],
            notes: [],
            sentences: [],
        }
        return
    }
}

chrome.runtime.onMessage.addListener((msg, sender, cb) => {
    // console.log(`panel接收到了消息, selection = ${msg.selection}`)
    if(msg.type == "GET_WORD" && msg.selection) {
        onSearch(msg.selection)
    }
})

</script>
