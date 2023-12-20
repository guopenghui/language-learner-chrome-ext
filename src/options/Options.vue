<script setup lang="ts">
import { ref } from 'vue';
import { NMessageProvider, useMessage } from "naive-ui";
import { t } from "../lang/helper";

let host = ref("");
let port = ref(0);
let https = ref(false);
let prefix = ref("");
let token = ref("")

chrome.storage.sync.get(["port", "host", "https", "prefix", "token"], (data) => {
    port.value = data.port;
    host.value = data.host;
    https.value = data.https;
    prefix.value = data.prefix;
    token.value = data.token;
});

let message = useMessage();


function saveSettings() {
    let data = {
        port: port.value,
        host: host.value,
        https: https.value,
        prefix: prefix.value,
        token: token.value,
    };
    chrome.storage.sync.set(data , async () => {
        await chrome.runtime.sendMessage(Object.assign({ type: "CHANGE_SETTINGS" }, data));
        message.success(t("Save Success"));
    });
}

// function MC(props:any, { slots, emit, attrs}: any) {
//   return h("h1", {innerHTML: "Hello"})
// }

</script>

<template>
    <main>
        <h3>Options Page!</h3>
        <div class="option-container">
            <div class="option">
                <span>{{ t("Host") }}: </span>
                <input type="text" v-model="host">
            </div>
            <div class="option">
                <span>{{ t("Port") }}: </span>
                <input type="number" v-model="port">
            </div>
            <div class="option">
                <span>{{ t("Https") }}: </span>
                <input type="checkbox" v-model="https">
            </div>
            <div class="option">
                <span>{{ t("Prefix") }}: </span>
                <input type="text" v-model="prefix">
            </div>
            <div class="option">
                <span>{{ t("Token") }}: </span>
                <input type="text" v-model="token">
            </div>
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
