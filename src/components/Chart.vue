<template>
    <div
        id="chartContainer"
        class="w-full h-full relative rounded-xl overflow-hidden flex items-center justify-center"
    >
        <select
            name="select"
            id="select"
            v-model="selectedRange"
            class="absolute right-0 top-0 z-50 m-4 select-none outline-none"
        >
            <option
                v-for="(item, index) in dayRangeOptions"
                :key="index"
                :value="item.value"
            >
                {{ item.label }}
            </option>
        </select>
        <Chart
            v-if="chartReady"
            :key="key"
            :options="chartOptions"
            class="h-full w-full"
        />
        <LoaderCircle v-else class="animate-spin" color="#475569" size="60" />
    </div>
</template>

<script setup>
import { Chart } from "highcharts-vue";
import { useStore } from "vuex";
import { reactive, ref, computed, watch, defineEmits } from "vue";
import { LoaderCircle } from "lucide-vue-next";

const emit = defineEmits("selection");
const store = useStore();

const indexList = reactive([]);
const key = ref(0);
const chartReady = ref(false);

const chartData = computed(() => store.getters["chart/getChartOptions"]);

//set chart is ready on data received
watch(
    () => chartData.value,
    (val) => {
        if (val.categories.length > 0) {
            chartReady.value = true;
        }
    },
    { deep: true, immediate: true }
);

//column selection
const selectColumn = (e) => {
    const index = e.point.index;
    const list = modifyIndexList(index);
    plotBands.value.forEach((item, indx) => {
        if (list.includes(indx)) {
            item.color = "rgb(240,240,240)";
        } else {
            item.color = "#ffffff";
        }
    });
    const dateList = getDateList(list);
    emit("selection", dateList);

    key.value++;
};
const modifyIndexList = (index) => {
    const existing = indexList.includes(index);
    if (existing) {
        const foundIndx = indexList.indexOf(index);
        indexList.splice(foundIndx, 1);
    } else if (indexList.length >= 2) {
        indexList.shift();
        indexList.push(index);
    } else {
        indexList.push(index);
    }
    return indexList;
};
const getDateList = (list) => {
    return chartData.value.categories.filter((itm, index) =>
        list.includes(index)
    );
};
const resetSelection = () => {
    indexList.length = 0;
    plotBands.value.forEach((item, indx) => {
        item.color = "#ffffff";
    });
    key.value++;
};

//day range selection
const dayRangeOptions = ref([
    { label: "Last 60 Days", value: 60 },
    { label: "Last 30 Days", value: 30 },
    { label: "Last 14 Days", value: 14 },
    { label: "Last 7 Days", value: 7 },
]);
const selectedRange = ref(30);
watch(
    () => selectedRange,
    function (val) {
        chartReady.value = false;
        resetSelection();
        store.commit("chart/SET_DATE_RANGE", val.value);
        store
            .dispatch("chart/getDailySales", { day: val.value })
            .then((res) => {
                if (res.status) {
                    chartReady.value = true;
                }
            });
    },
    { deep: true }
);

const setTooltip = (e) => {
    const date = e.key;
    const index = chartData.value.categories.indexOf(date);
    const fbaSales = chartData.value.fbaSales[index];
    const fbmSales = chartData.value.fbmSales[index];
    const fbaShippingAmount = chartData.value.shippingAmount[index];
    const profit = chartData.value.profit[index];

    return `<b>${e.key}</b><br/>Total Sales: ${
        fbaSales + fbmSales
    }<br/>Shipping: ${fbaShippingAmount}<br/>Profit: ${profit}<br/>FBA Sales: ${fbaSales}<br/>FBM Sales: ${fbmSales}`;
};

const chartOptions = computed(() => {
    return {
        chart: {
            type: "column",
            animation: false,
        },
        title: {
            text: "Daily Sales",
            align: "left",
        },
        xAxis: {
            categories: chartData.value.categories || [],
            plotBands: plotBands.value,
        },

        yAxis: {
            allowDecimals: false,
            min: 0,
            title: {
                text: `Amount(${store.state.chart.currency})`,
            },
        },

        tooltip: {
            formatter: function () {
                return setTooltip(this);
            },
        },

        plotOptions: {
            series: {
                states: {
                    inactive: {
                        opacity: 1,
                    },
                    hover: {
                        enabled: false,
                    },
                },
            },
            column: {
                stacking: "normal",
                dataLabels: {
                    enabled: true,
                    rotation: -90,
                    color: "#FFFFFF",
                    inside: true,
                    style: {
                        fontSize: "10px",
                    },
                },
                events: {
                    click: function (e) {
                        selectColumn(e);
                    },
                },
                animation: {
                    duration: 0,
                },
            },
        },

        series: [
            {
                name: "Profit",
                color: "rgb(113,236,197)",
                data: chartData.value.profit,
                stack: "stack",
            },
            {
                name: "FBA Sales",
                color: "rgb(127,133,232)",
                data: chartData.value.fbaSales,
                stack: "stack",
            },
            {
                name: "FBM Sales",
                color: "rgb(93,51,235)",
                data: chartData.value.fbmSales,
                stack: "stack",
            },
        ],
    };
});

const plotBands = computed(() =>
    chartData.value.categories.map((item, index) => {
        return {
            from: index - 0.5,
            to: index + 0.5,
            color: "#ffffff",
        };
    })
);
</script>
