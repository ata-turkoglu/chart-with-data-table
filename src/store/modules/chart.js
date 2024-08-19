import axios from "@/plugins/axios";
import moment from "moment";
import store from "../index";

export default {
    namespaced: true,
    state: {
        currency: null,
        chartData: [],
        dateRange: null,
    },
    getters: {
        getChartOptions: (state) => {
            return {
                categories: state.chartData.map((itm) => {
                    const momentDate = moment(itm.date, "YYYY-MM-DD");
                    const weekDay = momentDate.format("dddd");
                    const dataDate = momentDate.format("MM-DD-YYYY");
                    return weekDay + ", " + dataDate;
                }),
                profit: state.chartData.map((itm) => itm.profit),
                fbaSales: state.chartData.map((itm) => itm.fbaAmount),
                fbmSales: state.chartData.map((itm) => itm.fbmAmount),
                shippingAmount: state.chartData.map(
                    (itm) => itm.shippingAmount
                ),
            };
        },
    },
    mutations: {
        SET_CHART_DATA: (state, data) => (state.chartData = data),
        SET_CURRENCY: (state, data) => (state.currency = data),
        SET_DATE_RANGE: (state, data) => (state.dateRange = data),
    },
    actions: {
        async getDailySales({ commit }, payload) {
            const data = {
                marketplace: store.state.user.user.store[0].marketplaceName,
                sellerId: store.state.user.user.store[0].storeId,
                requestStatus: 0,
                day: 30,
                excludeYoYData: true,
            };
            Object.assign(data, payload);

            return axios
                .post("data/daily-sales-overview", data)
                .then((result) => {
                    const resData = result.data;

                    if (!resData.ApiStatus)
                        return {
                            status: false,
                            message: resData.ApiStatusMessage,
                        };

                    commit("SET_CHART_DATA", resData.Data.item);
                    commit("SET_CURRENCY", resData.Data.Currency);
                    console.log("getDailySales", result);
                    return { status: true };
                })
                .catch((e) => {
                    console.log("error-getDailySales", e);
                    return {
                        status: false,
                        message: e.response
                            ? e.response.data.ApiStatusMessage
                            : e.message,
                    };
                });
        },
    },
};
