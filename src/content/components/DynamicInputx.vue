<template>
    <div class="learn-dyn-input">
        <!-- <div>{{ texts }}</div> -->
        <div class="learn-text" v-for="(t, i) in texts" >
        <textarea class="dyn-input-text" rows="3" v-model="texts[i]" @input="onKeydown"  placeholder="xxxx"/>
        <button @click="close(t)">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
        </div>
        <button class="add-text" @click="add">+</button>
    </div>
</template>

<script setup lang='ts'>
import { ref, watch, nextTick} from 'vue'
let texts = ref<string[]>([]);

const props = defineProps<{
    modelValue: string[]
}>();
let emits = defineEmits<{
	(event: "update:modelValue", newValue: string[]): void
}>();

watch(() => props.modelValue, () => {
    // texts.value.splice(0);
    // texts.value.push(...props.modelValue);
    texts.value =  copy(props.modelValue);
    console.log("texts执行了watch, texts= ", texts.value);
    console.log("此时props.modelValue = ", props.modelValue);
    nextTick(() => {
        let elems = document.querySelectorAll(".dyn-input-text");
        elems.forEach((e) => {
            adjustHeight(e as HTMLTextAreaElement);
        })        
    })
},{
    immediate: true,
    deep: true
})

function onKeydown(e:Event) {
    console.log("onKeydown, texts = ", texts.value);
    emits("update:modelValue", copy(texts.value));
    adjustHeight(e.target as HTMLTextAreaElement);
}

function adjustHeight(target: HTMLTextAreaElement) {
    // let target = e.target as HTMLTextAreaElement;
    target.style.height = "auto";
    target.style.height = target.scrollHeight + "px";
} 


function close(t: string) {
    let index = texts.value.findIndex((v) => v === t);

    texts.value.splice(index, 1);
    emits("update:modelValue", copy(texts.value));
}

function add() {
    texts.value.push("");
    console.log("add 了, texts = ", texts.value);
    emits("update:modelValue", copy(texts.value));
}

function copy(arr: string[]) {
    return arr.map((v) => v);
}

</script>

<style lang="scss">
.learn-dyn-input {
    padding: 2px;
    .add-text {
        height: 18px;
        width: 100%;
    }
    .learn-text {
        width: 100%;
        position: relative;
        textarea {
            box-sizing: border-box;
            width: 100%;
            resize: none;
            font-size: 1em;
            font-family: Arial,"楷体";
            &::-webkit-scrollbar {
                display: none;
            }
        }
        button {
            box-sizing: content-box;
            padding: 0;
            border-radius: 8px;
            height: 12px;
            width: 12px;
            position: absolute;
            top: 0;
            right: 0;
            margin-top: 2px;
            margin-right: 2px;
            svg {
                position: absolute;
                top: 0;
                right: 0;
            }
        }
    }
}
</style>