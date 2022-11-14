<script setup lang="ts">
import { ref, onMounted } from 'vue'

onMounted(() => {
  let input = document.getElementById("test-input") as HTMLInputElement
  let btn = document.getElementById("test-btn") as HTMLButtonElement
})

let port = ref(0);
chrome.storage.sync.get(["port"], (data) => {
  port.value = data.port
}) 

</script>

<template>
  <main>
    <h3>Current Port</h3>
    <h2>{{ port }}</h2>
  </main>
</template>

<style scoped>
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

h2 {
  color: darkgray;
  font-size: 2rem;
  font-weight: bold;
  margin: 2rem auto;
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
