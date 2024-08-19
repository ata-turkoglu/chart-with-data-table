<template>
    <div class="w-full h-full flex items-start">
        <RouterView />
    </div>
</template>

<script setup>
import { onBeforeMount } from "vue";
import { useRouter, RouterView } from "vue-router";
import { useStore } from "vuex";
import axios from "./plugins/axios";

const store = useStore();
const router = useRouter();

onBeforeMount(() => {
    const token = JSON.parse(window.localStorage.getItem("token"));
    const user = JSON.parse(window.localStorage.getItem("user"));

    if (token) {
        console.log("app-token-local", token);
        axios.interceptors.request.use(function (config) {
            config.headers = {
                Authorization: `Bearer ${token.AccessToken}`,
            };
            return config;
        });
        store.commit("user/SET_TOKEN", token);
    }

    if (user) {
        console.log("app-user-local");
        store.commit("user/SET_USER", user);
    }

    if (!store.state.user.token) {
        //redirect
        router.push("login");
    }
});
</script>

<style></style>
