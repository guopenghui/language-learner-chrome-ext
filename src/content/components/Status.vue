<template>
    <div id="langr-status">
        <div v-for="i in 5"
            @click="update(i - 1)"
            :class="{selected: status === i-1}">
            {{ i - 1 }}
        </div>
    </div>
</template>

<script setup lang='ts'>
import { ref, watchEffect } from 'vue'
let status = ref(0)
let props = defineProps<{
    modelValue: number
}>();

watchEffect(() => {
    status.value = props.modelValue;
})

let emits = defineEmits<{
	(event: "update:modelValue", newValue: number): void
}>();

function update(i: number) {
    status.value = i;
	emits("update:modelValue", i);
}

</script>

<style lang="scss">
#langr-status {
    width: 80px;
    // background-color: #ffff0055;
    display: grid;
    grid-template-columns: repeat(3, 1fr); /* 三列，每列平均占据剩余空间 */
    grid-template-rows: repeat(2, auto); /* 两行，行高根据内容自适应 */
    gap: 5px; /* 列和行之间的间距，可根据需要调整 */
    div {
        opacity: 0.3;
        cursor: pointer;
        &.selected {
            opacity: 0.8;
        }
        &:nth-child(1) {
            background-color: #808080;
        }
        &:nth-child(2) {
            background-color: #ff9800;
            grid-column: 2 / 4;
        }
        &:nth-child(3) {
            background-color: #ffeb3c;
        }
        &:nth-child(4) {
            background-color: #9eda58;
        }
        &:nth-child(5) {
            background-color: #4cb051;
        }
    }    
}

</style>