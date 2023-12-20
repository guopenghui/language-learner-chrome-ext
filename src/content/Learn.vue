<template>
    <div ref="panel" id="langr-learn-panel">
        <div ref="handle" class="learn-handle">
            <div class="learn-handle-close" @click="close"></div>
        </div>
        <!-- <button @click="modify">填入输入</button> -->
        <!-- <p style="width: 500px;">{{ sentencesArr }}</p> -->
        <!-- <p style="width: 500px; text-wrap:wrap;">{{ model}}</p> -->
        <div class="learn-scrollbar">
            <div class="learn-body">
                <div class="learn-word">
                    <input type="text"  v-model="model.expression" placeholder="Hello"/>
                    <div style="flex:1;"/>
                    <Status class="status" v-model="model.status"></Status>
                </div>
                <div class="learn-meaning">
                    <input type="text" v-model="model.meaning" placeholder="简短的含义"/>
                </div>
                <div class="learn-tags">
                    <Tags ref="tags" v-model="tagsArr"/>
                </div>
                <div class="learn-notes">
                    <div>笔记</div>
                    <Dyn v-model="model.notes"></Dyn>
                </div>
                <div class="learn-sentences">
                    <div>例句</div>
                    <Dyn v-model="sentencesArr"></Dyn>
                </div>
                <div class="learn-current">
                    <div>正在学习：</div><textarea/>
                </div>
                <div class="learn-submit">
                    <button @click="save">{{ submitText}}</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang='ts'>
import { reactive, ref, watch, toRaw, onMounted, onUnmounted } from 'vue'
import Status from './components/Status.vue'
import Dyn from './components/DynamicInputx.vue'
import Tags from './components/Tags.vue'
import {ExpressionInfo, Sentence} from "./interface"
import {searchWord, postWord} from "./api"
import { sleep, throttle, useEvent } from "./utils"

let emits = defineEmits<{
    (event: "close"): void
}>()

function close() {
    // 清除输入
    model.value.expression = "";
    model.value.meaning = "";
    model.value.status = 1;
    model.value.t = "WORD";
    model.value.tags = [];
    model.value.notes = [];
    model.value.sentences = [];
    
    emits('close');
}


let model = ref<ExpressionInfo>({
    expression: "",
    meaning: "",
    status: 1,
    t: "WORD",
    tags: [],
    notes: [],
    sentences: [],
})
// TEST: 用于测试
// function modify() {
//     model.value.notes=['111', '222'];
//     model.value.sentences.push({text: '111', trans: '222', origin: '333'});
//     console.log(model.value.sentences)
// }

// 直接通过空格判断是否为PHRASE
watch(
    () => model.value.expression,
    (expr) => {
        expr = expr.trim();
        if (expr.split(' ').length > 1) {
            model.value.t = "PHRASE";
        } else {
            model.value.t = "WORD";
        }
    }
)

let sentencesArr = ref<string[]>([])

watch(
    sentencesArr,
    (sentences, oldSentences) => {
        if (sentences.length === oldSentences.length
        && sentences.every((v,i) => v === oldSentences[i])) {
            return;
        }
        model.value.sentences = sentences.map((s: string): Sentence => {
                let v = s.trim().split('\n');
                if (v.length !== 3) {
                    return { text: "", trans: "", origin: ""}
                }
                return { text: v[0], trans: v[1], origin: v[2]}
            });
    }, {
        deep:true
    }
)

let tagsArr = ref<string[]>([]);
let tags = ref<InstanceType<typeof Tags>>();
watch(tagsArr, (tags) => {
    model.value.tags = tags.map(t => t.trim());
})

let submitText = ref<string>("💾保存");
async function save() {
    let data = toRaw(model.value);
    data.expression = data.expression.trim().toLowerCase();
    
    submitText.value = "发送中"
    let statusCode = await postWord(data);
    if (statusCode !== 200) {
        submitText.value = "❌失败";
        console.warn("Submit failed, please check server status");
    } else {
        submitText.value = "✅成功";
        
    }
    tags.value!.dirty = true;  // 刷新保存的tags
    await sleep(1000);
    submitText.value = "💾保存";
}


// 面板的拖动
let handle = ref<HTMLElement>();
let panel = ref<HTMLElement>();
function onMouseMove(e: MouseEvent) {
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    panel.value!.style.left = `${initLeft + deltaX}px`;
    panel.value!.style.top = `${initTop + deltaY}px`;
}

let startX: number;
let startY: number;
let initLeft: number;
let initTop: number;
useEvent(handle, "pointerdown", (e) => {
    let evt = e as MouseEvent;
    startX = evt.clientX;
    startY = evt.clientY;
    initLeft = panel.value!.offsetLeft;
    initTop = panel.value!.offsetTop;
    addEventListener("pointermove", onMouseMove);
})
useEvent(handle, "pointerup", (e) => {
    removeEventListener("pointermove", onMouseMove);
    
})

chrome.runtime.onMessage.addListener((msg, sender, cb) => {
    if (msg.type === "GET_WORD"&& msg.selection ){
        search(msg.selection)
    }
})

async function search(selection: string) {
    selection = selection.trim();
    let expr = await searchWord(selection);

    let exprType = "WORD";
    if (selection.trim().includes(" ")) {
        exprType = "PHRASE";
    }

    
    if (expr) {
        model.value.expression = expr.expression;
        model.value.meaning = expr.meaning;
        model.value.status = expr.status;
        model.value.t = exprType;
        model.value.tags = expr.tags;
        model.value.notes = expr.notes;
        model.value.sentences = expr.sentences;
        
        tagsArr.value = model.value.tags;
        sentencesArr.value = expr.sentences.map((sentence: Sentence) => {
            return ([
                sentence.text.trim(),
                sentence.trans.trim(),
                sentence.origin.trim()
            ].join('\n'));
        });
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

defineExpose({
    search
})

</script>

<style lang="scss">
#langr-learn-panel {
    z-index: 9999999;
    font-size: 14px;
    color: black;
    box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.2), 0 5px 5px 0 rgba(0, 0, 0, 0.24);
    background-color: rgba($color: #fff, $alpha: 0.8);
    border-radius: 5px;
    overflow: hidden;
    position: fixed;
    top: 10px;
    width: 515px;
    // right: 10px;
    .learn-handle {
        height: 20px;
        background-color: dodgerblue;
        position: relative;
        cursor: move;
        .learn-handle-close {
            background-color: #FF5F56;
            position: absolute;
            height: 100%;
            width: 15px;
            top: 0;
            right: 0;
            cursor: pointer;
        }
    }
    .learn-scrollbar {
        position: relative;
        overflow: auto;
        overflow-x: hidden;
        max-height: 500px;
        &::-webkit-scrollbar{
            // display: none;
            position: absolute;
            width: 5px;
            // background-color: red;
            border-top-left-radius: 3px;
            border-bottom-left-radius: 3px;
        }
        &::-webkit-scrollbar-thumb {
            background-color: #c1c1c1; /* 滑块颜色 */
            border-radius: 3px;
        }
    }
    .learn-body {
        padding: 5px;
        padding-right: 10px;
        width: 500px;
        background-color: transparent;
        position: relative;
        overflow: overlay;
        
    }
    input {
        background-color: transparent;
    }
    .learn-word {
        display: flex;
        flex-direction: row;
        input {
            color: black;
            font-size: 2em;
            height: 40px;
            border-color: transparent;
            font-weight: bold;
            font-family: 'Segoe Print';
        }
        .status {
            right: 0;
        }
    }
    .learn-meaning  {
        width: 100%;
        input {
            color: black;
            padding: 4px;
            box-sizing: border-box;
            width: 100%;
        }
    }
    .learn-tags {
        margin-top: 5px;
    }
    .learn-notes {
        margin-top: 5px;
        border: 1px solid black;
        // height: 200px;
        background-color: #4CAF5055;
        border-radius: 5px;
    }
    .learn-sentences {
        border-radius: 5px;
        background-color: #deb88755;
        margin-top: 5px;
        border: 1px solid black;
        // height: 200px;
    }
    .learn-current {
        display: flex;
        height: 1.5em;
        textarea {
            background-color: transparent;
            border-color: transparent;
            resize: none;
        }
    }
    .learn-submit {
        margin-top: 3px;
        button {
        width: 100%;
        }
    }
}
</style>