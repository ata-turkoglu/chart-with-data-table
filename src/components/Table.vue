<template>
    <div v-if="tableReady" id="table" class="h-2/3 w-full rounded-xl pb-12">
        <div id="search" class="w-full h-fit flex relative">
            <Search
                class="absolute left-2 inset-y-0 my-auto"
                size="14"
                color="grey"
            />
            <input
                type="text"
                class="w-3/12 h-7 border border-stone-200 rounded-xl pl-7 text-xs outline-none"
                v-model="searchValue.value"
            />
            <span>{{ searchValue.value }}</span>
        </div>
        <div id="tableContainer" class="w-full my-3 pb-20">
            <table class="w-full">
                <tr class="h-24 w-full bg-white border border-stone-200">
                    <th class="text-left text-xs font-medium">SKU</th>
                    <th class="text-left text-xs font-medium">Product Name</th>
                    <th class="text-xs font-medium">
                        <span class="text-right">{{
                            tableDates.selectedDate.split(",")[0]
                        }}</span>
                        <span class="text-right">{{
                            tableDates.selectedDate.split(",")[1]
                        }}</span>
                        <span class="text-right">Sales/Units</span>
                        <span class="text-right">Average Selling Price</span>
                    </th>
                    <th
                        v-if="tableDates.selectedDate2"
                        class="text-xs font-medium"
                    >
                        <span class="text-right">{{
                            tableDates.selectedDate2.split(",")[0]
                        }}</span>
                        <span class="text-right">{{
                            tableDates.selectedDate2.split(",")[1]
                        }}</span>
                        <span class="text-right">Sales/Units</span>
                        <span class="text-right">Average Selling Price</span>
                    </th>
                    <th v-if="tableDates.selectedDate2" class="w-[10px]"></th>
                    <th class="text-xs font-medium">
                        <span class="text-right">SKU Refund Rate</span>
                        <span class="text-right">
                            (Last {{ dateRange }} days)
                        </span>
                    </th>
                </tr>
                <tr
                    v-for="(item, index) in filteredTableRows"
                    :key="index"
                    class="h-24 w-full border border-stone-200"
                >
                    <td class="text-xs">
                        <span>{{ item.sku }}</span>
                    </td>
                    <td class="text-xs">
                        <span>{{ item.productName }}</span>
                    </td>
                    <td class="text-right text-sky-600 font-bolder text-sm">
                        <span
                            >{{ currency }}{{ item.amount.toFixed(2) }} /
                            {{ item.qty }}</span
                        >
                        <span>{{
                            setAverageSellingPrice(item.amount, item.qty)
                        }}</span>
                    </td>
                    <td
                        v-if="tableDates.selectedDate2"
                        class="text-right text-emerald-800 font-bolder text-sm"
                    >
                        <span
                            >{{ currency }}{{ item.amount2.toFixed(2) }} /
                            {{ item.qty2 }}</span
                        >
                        <span>{{
                            setAverageSellingPrice(item.amount2, item.qty2)
                        }}</span>
                    </td>
                    <td v-if="tableDates.selectedDate2" class="w-[20px]">
                        <span v-if="setIncreaseArrow(item) == null"></span>
                        <ChevronUp
                            v-else-if="setIncreaseArrow(item)"
                            size="20"
                            color="#4ade80"
                        />
                        <ChevronDown v-else size="20" color="red" />
                    </td>
                    <td class="text-right text-sm">
                        <span>{{ item.refundRate }}%</span>
                    </td>
                </tr>
            </table>
            <div
                class="w-full my-6 flex justify-end items-center px-3 select-none"
            >
                <ChevronLeftCircle
                    v-if="selectedPage > 1"
                    class="cursor-pointer"
                    size="20"
                    color="grey"
                    @click="selectPage(-1)"
                />
                <Circle v-else size="20" color="#d4d4d4" />
                <span class="mx-3 text-neutral-800">{{ selectedPage }}</span>
                <Circle
                    v-if="filteredTableRows.length < 10"
                    size="20"
                    color="#d4d4d4"
                />
                <ChevronRightCircle
                    v-else
                    class="cursor-pointer"
                    size="20"
                    color="grey"
                    @click="selectPage(1)"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { useStore } from "vuex";
import { computed, watch, ref, reactive } from "vue";
import {
    Circle,
    ChevronDown,
    ChevronUp,
    ChevronLeftCircle,
    ChevronRightCircle,
    Search,
} from "lucide-vue-next";

const store = useStore();

const tableReady = ref(false);
const selectedPage = ref(1);
const searchValue = reactive({ value: "" });

const tableData = computed(() => store.getters["table/getTableData"]);
const skuList = computed(() =>
    store.getters["table/getSkuList"](selectedPage.value)
);
const tableDates = computed(() => store.getters["table/getTableDates"]);
const maxPage = computed(() => store.getters["table/getMaxPageIndex"]);
const currency = computed(() => store.state.table.currency);
const dateRange = computed(() => store.state.chart.dateRange);

const filteredTableRows = computed(() => {
    if (searchValue.value == "") return skuList.value;

    function filterBySyllable(searchText, text) {
        if (searchText.length < 2) return false;
        const searchList = searchText.toLowerCase().split(" ");
        const rowList = text.toLowerCase().split(" ");

        return searchList.every((item) =>
            rowList.some((el) => el.includes(item))
        );
    }

    return skuList.value.filter((item) => {
        const str =
            item.sku.toLowerCase() + " " + item.productName.toLowerCase();
        return filterBySyllable(searchValue.value, str);
    });
});

//set table is ready on data received
watch(
    () => tableData.value,
    function (val) {
        console.log("tableData", val);
        if (val.skuList.length > 0) tableReady.value = true;
    },
    { immediate: true, deep: true }
);

const setAverageSellingPrice = (amount, qty) => {
    const res = amount / qty;
    return isNaN(res) ? "-" : currency.value + res.toFixed(2);
};

const setIncreaseArrow = (item) => {
    const first = item.amount / item.qty;
    const second = item.amount2 / item.qty2;

    if (isNaN(first) && isNaN(second)) return null;

    if (isNaN(first) && !isNaN(second)) return true;

    if (first == second) return null;

    return second > first;
};

const selectPage = (increase) => {
    console.log("maxPage", maxPage.value);
    selectedPage.value = increase + selectedPage.value;
};
</script>

<style scoped lang="scss">
tr:nth-of-type(odd) {
    background: white;
}

th,
td {
    padding: 0.5rem;
    span {
        display: block;
        max-width: 300px;
    }
}
</style>
