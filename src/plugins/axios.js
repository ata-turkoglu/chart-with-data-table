/* import Axios from "axios";

const axios = Axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
});

export default axios; */

import Axios from "axios";

export const axiosConfig = { baseURL: import.meta.env.VITE_BASE_URL };

const axios = Axios.create(axiosConfig);

export default axios;
