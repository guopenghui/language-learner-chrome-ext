<template>
    <div id="langr-learn-panel">
        <NConfigProvider :theme="theme" :theme-overrides="themeOverrides">
            <NForm :model="model" label-placement="top" label-width="auto" :rules="rules"
                require-mark-placement="right-hanging">
                <!-- 一个单词或短语字符串 -->
                <NFormItem :label="t('Expression')" label-placement="left" :label-style="labelStyle" path="expression">
                    <NInput size="small" v-model:value="model.expression" :placeholder="t('A word or a phrase')" />
                </NFormItem>
                <!-- 单词或短语的含义(精简) -->
                <NFormItem :label="t('Meaning')" label-placement="left" :label-style="labelStyle" path="meaning">
                    <NInput size="small" v-model:value="model.meaning" :placeholder="t('A short definition')" type="textarea"
                        autosize />
                </NFormItem>
                <!-- 类别，可以是Word或Phrase -->
                <!-- <NFormItem :label="t('Type')" label-placement="left" :label-style="labelStyle" path="t">
                    <NRadioGroup v-model:value="model.t">
                        <NRadio value="WORD">{{ t("Word") }}</NRadio>
                        <NRadio value="PHRASE">{{ t("Phrase") }}</NRadio>
                    </NRadioGroup>
                </NFormItem> -->
                <!-- 当前单词的学习状态 -->
                <NFormItem :label="t('Status')" label-placement="left" :label-style="labelStyle" path="status">
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
                <NFormItem :label="t('Tags')" label-placement="left" :label-style="labelStyle" path="tags">
                    <NSelect size="small" v-model:value="model.tags" filterable multiple tag
                        :placeholder="t('Input or select some tags')" :loading="tagLoading" :options="tagOptions"
                        @search="tagSearch"></NSelect>
                </NFormItem>
                <!-- 可选,可以记多条笔记 -->
                <NFormItem :label="t('Notes')" :label-style="labelStyle" path="tags">
                    <NDynamicInput v-model:value="model.notes" :create-button-props="{size: 'small'}">
                        <template #create-button-default>
                            {{ t("Create") }}
                        </template>
                        <template #="{ index, value }">
                            <NInput type="textarea" :placeholder="t('Write a new note')"
                                v-model:value="model.notes[index]" />
                        </template>
                    </NDynamicInput>
                </NFormItem>
                <!-- 可选,例句也可以记多条 -->
                <div style="margin-bottom: 8px">
                    <label for="Sentences" :style="[labelStyle]">{{
                            t("Sentences")
                    }}</label>
                </div>
                <NDynamicInput v-model:value="model.sentences" :on-create="onCreateSentence" :create-button-props="{size: 'small'}">
                    <template #create-button-default>
                        {{ t("Create") }}
                    </template>
                    <template #="{ index, value }">
                        <div style="
                                display: flex;
                                flex-direction: column;
                                flex: 1;
                                border: 2px solid gray;
                                border-radius: 3px;
                                padding: 3px;
                            ">
                            <NFormItem :show-label="false" :path="`sentences[${index}].text`" :rule="sourceRule">
                                <NInput type="textarea" v-model:value="model.sentences[index].text"
                                    :placeholder="t('Origin sentence')" :autosize="{ minRows: 1, maxRows: 3 }" />
                            </NFormItem>
                            <NFormItem :show-feedback="false" :show-label="false" :path="`sentences[${index}].trans`">
                                <NInput type="textarea" v-model:value="model.sentences[index].trans"
                                    :placeholder="t('Translation (Optional)')" :autosize="{ minRows: 1, maxRows: 3 }" />
                            </NFormItem>
                            <NFormItem :show-feedback="false" :show-label="false" :path="`sentences[${index}].origin`">
                                <NInput type="textarea" v-model:value="
                                    model.sentences[index].origin
                                " :placeholder="t('Origin (Optional)')" :autosize="{ minRows: 1, maxRows: 3 }" />
                            </NFormItem>
                        </div>
                    </template>
                </NDynamicInput>
            </NForm>
            <!-- 提交按钮 -->
            <div style="margin-top: 10px">
                <NButton style="--n-width: 100%" attr-type="submit" size="large" @click="submit">{{ t("Submit") }}
                </NButton>
            </div>
        </NConfigProvider>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, CSSProperties } from "vue";
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
    useLoadingBar,
GlobalThemeOverrides
} from "naive-ui";

import { ExpressionInfo, Sentence } from "./interface";
import { t } from "../lang/helper";
import { getTags, searchWord, postWord } from "./api";


let message = useMessage();
const loading = useLoadingBar();


// 凑合
// let t = (x:string) => "XXX"

// 切换明亮/黑暗模式
// const theme = computed(() => {
// 	return store.dark? darkTheme: null
// })
const theme = null;

// 样式设置
const themeOverrides: GlobalThemeOverrides = {
	common: {},
	Form: {
		labelFontSizeTopMedium: "15px",
		feedbackFontSizeMedium: "13px",
		blankHeightMedium: "5px",
		feedbackHeightMedium: "22px",
	},
	Radio: {
		buttonBorderRadius: "5px",
		fontSizeMedium: "13px",
		fontSizeSmall: "13px",
		buttonHeightSmall: "22px",
	},
	Input: {
		fontSizeSmall: "12px",
		paddingSmall: "0 5px",
	},
	DynamicInput: {
		actionMargin: "0 0 0 5px",
	},
};



//表单数据
let model = ref<ExpressionInfo>({
    expression: "",
    meaning: "",
    status: 0,
    t: "WORD",
    tags: [],
    notes: [],
    sentences: [],
});

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
};

let sourceRule = {
    required: true,
    trigger: ["blur", "input"],
    message: "At least input a source sentence",
};

let labelStyle: CSSProperties = {
    fontSize: "16px",
    fontWeight: "bold",
    padding: "0 0 8px 2px",
};

function onCreateSentence() {
    return {
        text: "",
        trans: "",
        origin: "",
    };
}

// 单词状态样式
const basicStyle = {};
const learningStyle = {
    backgroundColor: "#ff980055",
};
const familiarStyle = {
    backgroundColor: "#ffeb3c55",
};
const knownStyle = {
    backgroundColor: "#9eda5855",
};
const LearnedStyle = {
    backgroundColor: "#4cb05155",
};

// 异步获取数据库中所有tag
let tagOptions = ref<SelectOption[]>([]);
let tagLoading = ref(false);
let tags: string[] = [];

async function tagSearch(query: string) {
    tagLoading.value = true;
    if (query.length < 2) {
        tags = await getTags() ?? [];
    }
    tagLoading.value = false;

    if (!query.length) {
        tagOptions.value = tags.map((v) => {
            return { label: v, value: v };
        });
        return;
    }
    tagOptions.value = tags
        .filter((v) => ~v.indexOf(query))
        .map((v) => {
            return { label: v, value: v };
        });
}

// 提交信息到数据库的加载状态

async function submit() {
    // 表单内容检查
    if (!model.value.expression) {
        message.warning(t("Expression is empty!"));
        return;
    }
    if (!model.value.meaning) {
        message.warning(t("Meaning is empty!"));
        return;
    }
    if (
        model.value.expression.trim().split(" ").length > 1 &&
        model.value.t === "WORD"
    ) {
        model.value.t = "PHRASE";
        // message.warning(t("It looks more like a PHRASE than a WORD"));
        // return;
    }

    let data = JSON.parse(JSON.stringify(model.value));
    (data as any).expression = (data as any).expression.trim().toLowerCase();
    // 超过1条例句时，sentences中的对象会变成Proxy，尚不知原因，因此用JSON转换一下
    loading.start();
    let statusCode = await postWord(data);

    if (statusCode !== 200) {
        loading.error();
        message.warning("Submit failed");
        console.warn("Submit failed, please check server status");
        return;
    }
    
    message.success("Submit Success");
    loading.finish();
}

// 查询词汇时自动填充新词表单
async function onSearch(selection: string) {
    let expr = await searchWord(selection);

    let exprType = "WORD";
    if (selection.trim().includes(" ")) {
        exprType = "PHRASE";
    }

    if (expr) {
        model.value = expr;
        return;
    } else {
        model.value = {
            expression: selection,
            meaning: "",
            status: 1,
            t: exprType,
            tags: [],
            notes: [],
            sentences: [],
        };
        return;
    }
}

chrome.runtime.onMessage.addListener((msg, sender, cb) => {
    if (msg.type == "GET_WORD" && msg.selection) {
        onSearch(msg.selection);
    }
})

</script>

<style>
body {
    color: red !important;
}
.n-dynamic-input .n-button-group {
		flex-direction: column;
}
.n-dynamic-input .n-button-group button{
			height: 26px;
			width: 26px;

			&:nth-child(1) {
				border-top-left-radius: 0px !important;
				border-top-right-radius: 0px !important;
				border-bottom-left-radius: 0 !important;
				border-bottom-right-radius: 0 !important;
			}

			&:nth-child(2) {
				border-top-left-radius: 0 !important;
				border-top-right-radius: 0 !important;
				border-bottom-left-radius: 0px !important;
				border-bottom-right-radius: 0px !important;
			}
		}
</style>