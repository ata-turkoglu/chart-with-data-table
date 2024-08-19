import { createStore } from "vuex";
import axios from "@/plugins/axios";
import user from "./modules/user";
import chart from "./modules/chart";
import table from "./modules/table";

export default createStore({
    state: {},
    getters: {},
    mutations: {},
    actions: {},
    modules: { user, chart, table },
});
