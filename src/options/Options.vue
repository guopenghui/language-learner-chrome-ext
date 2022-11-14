<script setup lang="ts">
import { ref } from 'vue'
import { NMessageProvider, useMessage } from "naive-ui"
import { t } from "../lang/helper"

let port = ref(3002)
chrome.storage.sync.get(["port"], (data) => {
    port.value = data.port
})

let message = useMessage()


function saveSettings() {
    chrome.storage.sync.set({
        port: port.value,
    }, () => {
        chrome.runtime.sendMessage({type: "CHANGE_PORT", port: port.value})
        message.success(t("Save Success"))
    })
}

// function MC(props:any, { slots, emit, attrs}: any) {
//   return h("h1", {innerHTML: "Hello"})
// }

</script>

<template>
    <main>
        <h3>Options Page!</h3>
        <div class="option-container">
            <span>{{t("Port")}}: </span>
            <input type="number" v-model="port">
            <button @click="saveSettings">Save</button>
        </div>
    </main>
</template>

<style>
main {
    text-align: center;
    padding: 1em;
    margin: 0 auto;
}

h3 {
    color: #42b983;
    text-transform: uppercase;
    font-size: 1.5rem;
    font-weight: 200;
    line-height: 1.2rem;
    margin: 2rem auto;
}

h6 {
    font-size: 0.5rem;
    color: #999999;
    margin: 0.5rem;
}

a {
    font-size: 0.5rem;
    margin: 0.5rem;
    color: #cccccc;
    text-decoration: none;
}

@media (min-width: 480px) {
    h3 {
        max-width: none;
    }
}

@media (prefers-color-scheme: light) {
    a:hover {
        color: #747bff;
    }

    h6 {
        color: #333333;
    }
}
</style>
