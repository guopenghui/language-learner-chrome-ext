<template>
    <!-- <button @click="active=true">打开</button> -->
    <NDrawer v-model:show="active" :block-scroll="false" :show-mask="false" :mask-closable="false" :resizable="true"
        :default-width="340" @keyup.esc="active = false" :z-index="999">
        <NMessageProvider>
            <NLoadingBarProvider :to="content">
                <NDrawerContent :title="t('Study')" closable>
                    <LearnPanel />
                </NDrawerContent>
            </NLoadingBarProvider>
        </NMessageProvider>
    </NDrawer>
</template>


<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import {
    NDrawer, NDrawerContent,
    NMessageProvider, NLoadingBarProvider,
} from "naive-ui";
import LearnPanel from "./LearnPanel.vue";
import { t } from "../lang/helper";


let active = ref(false);
let content = ref<HTMLElement | undefined>(undefined);
// let loading = useLoadingBar()

// 用Esc控制抽屉的关闭
function onEsc(event: KeyboardEvent) {
    if (event.key === "Escape") {
        active.value = false;
    }
}

onMounted(() => {
    document.body.addEventListener("keyup", onEsc);
});

onUnmounted(() => {
    document.body.removeEventListener("keyup", onEsc);
});

chrome.runtime.onMessage.addListener((msg, sender, cb) => {
    if (msg.type === "GET_WORD") {
        // console.log("抽屉收到消息")
        active.value = true;
    }
})


</script>