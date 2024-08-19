import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./index.css";
import HighchartsVue from "highcharts-vue";

const app = createApp(App);

app.use(router).use(store).use(HighchartsVue);

app.mount("#app");
