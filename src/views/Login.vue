<template>
    <div
        id="login"
        class="w-full h-full flex flex-col items-center justify-center"
    >
        <div
            id="loginForm"
            class="w-[350px] h-[350px] bg-stone-50 border border-neutral-200 rounded flex flex-col items-center justify-start relative pt-12 shadow-lg"
        >
            <div class="w-3/5 flex flex-col mb-6">
                <label for="email" class="mb-2 text-sm text-neutral-700">
                    Email
                </label>
                <input
                    id="email"
                    type="text"
                    class="border border-neutral-200 text-neutral-700 rounded px-3 py-2 text-sm shadow-inner"
                    v-model="userData.Email"
                />
            </div>

            <div class="w-3/5 flex flex-col mb-6">
                <label for="password" class="mb-2 text-sm text-neutral-700">
                    Password
                </label>
                <div class="relative w-full">
                    <input
                        id="password"
                        :type="showPassword ? 'text' : 'password'"
                        class="w-full border border-neutral-200 text-neutral-700 rounded px-3 py-2 text-sm shadow-inner"
                        v-model="userData.Password"
                    />
                    <div
                        class="absolute right-2 inset-y-0 my-auto cursor-pointer grid items-center"
                        @click="showPassword = !showPassword"
                    >
                        <Eye v-if="showPassword" size="16" color="#525252" />
                        <EyeOff v-else size="16" color="#525252" />
                    </div>
                </div>
            </div>

            <button
                class="w-[100px] m-2 border border-blue-200 rounded px-5 py-2 flex items-center justify-center bg-blue-100 shadow-md hover:shadow-none disabled:bg-stone-100 disabled:shadow-none disabled:text-stone-400 disabled:border-stone-200"
                @click="login"
                :disabled="!validation || spinner"
            >
                <LoaderCircle
                    v-if="spinner"
                    class="animate-spin"
                    color="#475569"
                />
                <span v-else class="text-sm">Login</span>
            </button>

            <Transition>
                <div
                    v-if="errorData.errorStatus"
                    class="w-fit h-fit p-1 px-10 text-center absolute bottom-3 inset-x-0 mx-auto"
                >
                    <span class="text-sm text-red-800">{{
                        errorData.errorMessage
                    }}</span>
                </div>
            </Transition>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { Eye, EyeOff, LoaderCircle } from "lucide-vue-next";

const store = useStore();
const router = useRouter();
const spinner = ref(false);
const showPassword = ref(false);
const userData = reactive({ Email: null, Password: null });

/* let userData = reactive({
    Email: null,
    Password: null,
    GrantType: "password",
    Scope: "amazon_data",
    ClientId: "C0001",
    ClientSecret: "SECRET0001",
    RedirectUri: "https://api.eva.guru",
}); */

let errorData = reactive({
    errorStatus: false,
    errorMessage: "",
});

const validation = computed(() => {
    return userData.Email && userData.Password;
});

onMounted(() => {
    let loginData = JSON.parse(window.localStorage.getItem("login"));
    if (loginData) {
        Object.assign(userData, loginData);
    }
});

const login = () => {
    spinner.value = true;
    store.dispatch("user/login", userData).then((res) => {
        if (res.status) {
            window.localStorage.setItem(
                "login",
                JSON.stringify({
                    Email: userData.Email,
                    Password: userData.Password,
                })
            );
            spinner.value = false;

            //redirect home page
            router.push("/");
        } else {
            spinner.value = false;
            errorData.errorStatus = true;
            errorData.errorMessage = res.message || "Login Error";
            setTimeout(() => {
                errorData.errorStatus = false;
            }, 3000);
        }
    });
};
</script>

<style scoped>
#login {
    user-select: none;
}

.v-enter-active,
.v-leave-active {
    transition: opacity 1s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}
</style>
