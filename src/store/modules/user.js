import axios from "@/plugins/axios";

export default {
    namespaced: true,
    state: {
        tokenExpireDate: null,
        AccessToken: null,
        user: null,
        token: null,
    },
    getters: {
        getUserData: (state) => state.user,
    },
    mutations: {
        SET_TOKEN: (state, data) => {
            state.token = data;
            window.localStorage.setItem("token", JSON.stringify(data));
        },
        SET_USER: (state, data) => {
            state.user = data;
            window.localStorage.setItem("user", JSON.stringify(data));
        },
    },
    actions: {
        async login({ commit, dispatch }, data) {
            const userData = {
                Email: null,
                Password: null,
                GrantType: "password",
                Scope: "amazon_data",
                ClientId: "C0001",
                ClientSecret: "SECRET0001",
                RedirectUri: "https://api.eva.guru",
            };
            Object.assign(userData, data);
            return axios
                .post("/oauth/token", userData)
                .then(async (result) => {
                    const resData = result.data;

                    //error
                    if (!resData.ApiStatus)
                        return {
                            status: false,
                            message: resData.ApiStatusMessage,
                        };

                    //success
                    commit("SET_TOKEN", resData.Data);
                    axios.interceptors.request.use(function (config) {
                        config.headers = {
                            Authorization: `Bearer ${resData.Data.AccessToken}`,
                        };
                        return config;
                    });

                    //waiting for new request's response
                    const userResult = await dispatch("getUserInformation", {
                        data: { email: data.Email },
                        AccessToken: resData.Data.RefreshToken,
                    });

                    //error
                    if (!userResult.data.ApiStatus) {
                        return {
                            status: false,
                            message:
                                userResult.ApiStatusMessage ||
                                userResult.data.ApiStatusMessage,
                        };
                    }

                    //success
                    commit("SET_USER", userResult.data.Data.user);

                    return { status: true };
                })
                .catch((e) => {
                    console.log("error-login", e);
                    return {
                        status: false,
                        message: e.response
                            ? e.response.data.ApiStatusMessage
                            : e.message,
                    };
                });
        },
        getUserInformation({ commit }, { data }) {
            return axios
                .post("/user/user-information", data)
                .catch((e) => (e.response ? e.response : e));
        },
    },
};
