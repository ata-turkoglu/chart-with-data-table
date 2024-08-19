import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import Login from "@/views/Login.vue";
import store from "@/store";
import moment from "moment";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "Home",
            component: HomeView,
        },
        {
            path: "/login",
            name: "Login",
            component: Login,
        },
    ],
});

router.beforeEach((to, from, next) => {
    const token = store.state.user.token;
    if (to.name !== "Login" && (!token || checkTokenExpired(token.ExpiresAt)))
        next({ name: "Login" });
    else next();
});

const checkTokenExpired = (date) => {
    return false;
    if (!date) return false;
    const expireDate = moment(date);
    const now = moment();
    return expireDate > now;
};

export default router;
