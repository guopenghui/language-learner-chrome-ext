<template>
    <Learn
        ref="learnPanel"
        :class="{ 'is-active': active }"
        @close="active = false"
    />
    <div ref="button"
        @click="openPanel"
        :style="{ display: showButton ? 'block' : 'none' }"
        :class="{ 'is-show': showButton }"
        class="reveal-button">
        <!-- <button @click="openPanel">添加单词</button> -->
        <img src="data:image/png;base64,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">
    </div>
</template>


<script setup lang="ts">
import { ref } from "vue";
import Learn from "./Learn.vue";
import { t } from "../lang/helper";
import { useEvent, useMouse } from "./utils"

let learnPanel = ref<InstanceType<typeof Learn>>();


let select = ref<string>("");
let button = ref<HTMLElement>();
let showButton = ref(true);
let {x, y} = useMouse()
useEvent(document, "pointerup", (e) => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
        select.value = selection.toString();
        button.value!.style.top = `${y.value + 20}px`;
        button.value!.style.left = `${x.value + 10}px`;
        showButton.value = true;
    } else {
        select.value = "";
        showButton.value = false;
    }
});

let active = ref(false);
function openPanel() {
    showButton.value = false;
    active.value = true;
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
        learnPanel.value?.search(selection.toString());
    }
}

chrome.runtime.onMessage.addListener((msg, sender, cb) => {
    if (msg.type === "GET_WORD") {
        active.value = true;
    }
})
</script>

<style lang="scss">
#langr-learn-panel {
    display: none;
    opacity: 0;
    &.is-active {
        display: block;
        opacity: 1;
        transition: opacity 1s ease-in-out;
    }
    @keyframes fadeInOut {
      0% { opacity: 0; }
    //   50% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    &.is-active {
      animation: fadeInOut 0.5s ease-in-out backwards;
    }
}
.reveal-button {
    position: fixed;
    z-index: 99999999;
    top: -100;
    right: -100;
    cursor: pointer;
    // padding: 10px;
    img {
        height: 30px;
    //     width: auto;
    //     //  background-image: url(data:image/png;base64,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);
    }
    @keyframes shakeY {
        from,
        to {
            transform: translate3d(0, 0, 0);
        }

        10%,
        30%,
        50%,
        70%,
        90% {
            transform: translate3d(0, -5px, 0);
        }

        20%,
        40%,
        60%,
        80% {
            transform: translate3d(0, 5px, 0);
        }
    }
    &.is-show {
        animation: shakeY 0.5s ease-in-out;
    }
}
</style>