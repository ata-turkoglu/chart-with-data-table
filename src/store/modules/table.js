import axios from "@/plugins/axios";
import moment from "moment";
import store from "../index";

const setDate = (date) => {
    if (!date) return null;

    const momentDate = moment(date, "YYYY-MM-DD");
    const weekDay = momentDate.format("dddd");
    const dataDate = momentDate.format("MM-DD-YYYY");
    return weekDay + ", " + dataDate;
};

export default {
    namespaced: true,
    state: {
        currency: null,
        tableData: null,
        receivedPageNumber: null,
    },
    getters: {
        getTableData: (state) => state.tableData,
        getSkuList: (state) => (pageNumber) => {
            const start = (pageNumber - 1) * 10;
            const end = start + 10;
            return state.tableData.skuList.slice(start, end);
        },
        getTableDates: (state) => {
            return {
                selectedDate: setDate(state.tableData.selectedDate),
                selectedDate2: setDate(state.tableData.selectedDate2),
            };
        },
        getMaxPageIndex: (state) => {
            return Math.ceil(state.tableData.skuList.length / 10);
        },
    },
    mutations: {
        SET_TABLE_DATA: (state, data) => (state.tableData = data),
        SET_CURRENCY: (state, data) => (state.currency = data),
        SET_RECEIVED_PAGE_NUMBER: (state, data) =>
            (state.receivedPageNumber = data),
    },
    actions: {
        async getDailySalesSkuList(
            { commit, dispatch },
            { dates, pageNumber = 1 }
        ) {
            const preparedDates = dates.map((item) => {
                if (item)
                    return moment(
                        item.split(",")[1].trim(),
                        "MM-DD-YYYY"
                    ).format("YYYY-MM-DD");
            });

            const data = {
                marketplace: store.state.user.user.store[0].marketplaceName,
                sellerId: store.state.user.user.store[0].storeId,
                salesDate: preparedDates[0],
                salesDate2: preparedDates[1] || null,
                pageSize: 30,
                pageNumber,
                isDaysCompare: preparedDates.length > 1 ? 1 : 0,
            };

            return axios
                .post("data/daily-sales-sku-list/", data)
                .then(async (result) => {
                    const resData = result.data;

                    //error
                    if (!resData.ApiStatus)
                        return {
                            status: false,
                            message: resData.ApiStatusMessage,
                        };

                    let tableData = resData.Data.item;
                    commit("SET_RECEIVED_PAGE_NUMBER", pageNumber);

                    const refaundRatesResult = await dispatch("getRefundRate", {
                        skuList: tableData.skuList.map((itm) => itm.sku),
                    });

                    //error
                    if (!refaundRatesResult.data.ApiStatus) {
                        return {
                            status: false,
                            message: refaundRatesResult.ApiStatusMessage,
                        };
                    }

                    const refaundRates = refaundRatesResult.data.Data;

                    tableData.skuList = tableData.skuList.map((item, index) => {
                        return {
                            ...item,
                            ...refaundRates[index],
                        };
                    });

                    commit("SET_TABLE_DATA", tableData);
                    commit("SET_CURRENCY", resData.Data.Currency);

                    return { status: true };
                })
                .catch((e) => {
                    console.log("error-getDailySalesSkuList", e);
                    return {
                        status: false,
                        message: e.response
                            ? e.response.data.ApiStatusMessage
                            : e.message,
                    };
                });
        },
        async getRefundRate({ commit }, { skuList }) {
            const data = {
                marketplace: store.state.user.user.store[0].marketplaceName,
                sellerId: store.state.user.user.store[0].storeId,
                skuList,
                requestedDay: store.state.chart.dateRange,
            };

            return axios
                .post("data/get-sku-refund-rate/", data)
                .catch((e) => (e.response ? e.response : e));
        },
    },
};
