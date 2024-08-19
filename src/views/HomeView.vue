<template>
    <div id="home" class="w-full h-full p-6 overflow-scroll bg-stone-50">
        <div class="w-full h-3/5 flex items-center justify-center mb-6 border">
            <Chart v-if="chartState" @selection="selectedDates" />
            <Transition v-else-if="errorData.errorStatus">
                <div
                    class="w-fit h-fit p-1 px-10 text-center absolute bottom-3 inset-x-0 mx-auto"
                >
                    <span class="text-lg text-red-800">{{
                        errorData.errorMessage
                    }}</span>
                    <br />
                    <span>Refresh Page</span>
                </div>
            </Transition>
            <LoaderCircle
                v-else
                class="animate-spin"
                color="#475569"
                size="60"
            />
        </div>
        <Table v-if="tableState" class="h-2/5" />
    </div>
</template>

<script setup>
import { useStore } from "vuex";
import Chart from "@/components/Chart.vue";
import Table from "@/components/Table.vue";
import { ref, watch, computed, onMounted, reactive } from "vue";
import { LoaderCircle } from "lucide-vue-next";

const store = useStore();
const chartState = ref(false);
const tableState = ref(false);

const user = computed(() => store.getters["user/getUserData"]);

let errorData = reactive({
    errorStatus: false,
    errorMessage: "",
});

//check userId to get daily sales
onMounted(() => {
    if (user.value.userId) {
        getDailySales();
    }
});
watch(
    () => user.value,
    function (user) {
        console.log("user-watch", user);
        if (user) {
            getDailySales();
        }
    },
    { deep: true }
);

const getDailySales = async () => {
    store.dispatch("chart/getDailySales").then((result) => {
        if (result.status) {
            chartState.value = true;
        } else {
            chartState.value = false;
            errorData.errorStatus = true;
            errorData.errorMessage = res.message || "Data couldn't be received";
        }
    });
};

const selectedDates = (dates) => {
    getDailySalesSkuList({ dates });
};

const getDailySalesSkuList = async (dates) => {
    store.dispatch("table/getDailySalesSkuList", dates).then((result) => {
        if (result.status) {
            tableState.value = true;
        }
    });
};
</script>
