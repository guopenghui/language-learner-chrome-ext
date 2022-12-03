import { createApp } from "vue";
import App from "./App.vue";

let elem = document.createElement("div");
elem.id = "langr-app";
document.body.appendChild(elem);

let app = createApp(App);
app.mount(elem);

// console.log(app)