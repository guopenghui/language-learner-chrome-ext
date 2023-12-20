<template>
    <div id="tags-input" >
        <!-- <div>{{ modelValue }}</div> -->
        <div>tags: </div>
        <div class="tips-wrapper">
            <input type="text" v-model="query" />
            <ul class="tips">
                <li v-for="s in showed"> {{ s }}</li>
            </ul>
        </div>
    </div>
</template>

<script setup lang='ts'>
import { ref, computed, watch } from 'vue'
import { getTags } from "../api"
const props = defineProps<{
    modelValue: string[],
}>()
const emits = defineEmits(['update:modelValue'])

watch(() => props.modelValue, () => {
    query.value = props.modelValue.join(",")
})

let allTags = ref<string[]>([]);
let dirty = ref(true);
// 当 dirty 被修改为 true 时更新 allTags
watch(dirty, async (newDirty) => {
    if (!newDirty) return;

    let all = await getTags();
    if (all) {
        allTags.value = all;
        dirty.value = false;
    }
}, { 
    immediate: true, // 组件首次加载时初始化 allTags 
})

let query = ref("");
let showed = computed(() => {
    // if (query.value.length < 1) return [];
    return allTags.value
        .filter(s => s.includes(lastTag(query.value)))
})
function lastTag(s: string): string {
    let v = s.split(/[,，]/);
    return v[v.length - 1]?.trim() || ""
}
watch(query, () => {
    emits("update:modelValue", query.value.split(/[,，]/))
})

defineExpose({
    dirty
})

</script>

<style lang="scss">
#tags-input {
    display: flex;
    height: 20px;
    .tips-wrapper {
        overflow: visible;
        flex: 1;
        margin-left: 5px;
        // height: 100%;
        input {
            box-sizing: border-box;
            width: 100%;
            border: none;
        }
        .tips {
            position: relative;
            z-index: 999999999;
            list-style-type: none;
            padding-top: 5px;
            padding-left: 0px;
            margin-top: 0px;
            background-color: aliceblue;
            border-left: 2px solid gray;
            border-right: 2px solid gray;
            border-bottom: 2px solid gray;
            li {
                padding-left: 5px;
                border-bottom: 1px solid gray;
            }
            
        }
        input:not(:focus)+.tips {
            display: none;
        }
    }
    
}

</style>