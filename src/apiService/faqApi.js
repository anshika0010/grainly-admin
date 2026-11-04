import axios from "axios";

export const getFaq = async () => {
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/faq/dashboard/`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("pm_admin_token")}`
                }
            }
        );

        return response.data
    }
    catch (err) {
        if (err.response) {
            if (err.response) {
                console.error("Server Error:", err.response.status);
                console.error("Response:", err.response.data);
            } else if (err.request) {
                console.error("No response received from server.");
            } else {
                console.error("Request error:", err.message);
            }

            return err.response?.data;
        }

        return null;
    }
}

export const createFaq = async (FaqData) => {
    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/faq/`,
            FaqData,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("pm_admin_token")}`
                }
            }
        );

        return response.data
    }
    catch (err) {
        if (err.response) {
            if (err.response) {
                console.error("Server Error:", err.response.status);
                console.error("Response:", err.response.data);
            } else if (err.request) {
                console.error("No response received from server.");
            } else {
                console.error("Request error:", err.message);
            }

            return err.response?.data;
        }

        return null;
    }
}

export const updateFaq = async (id, FaqData) => {
    try {

        const response = await axios.put(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/faq/${id}`,
            FaqData,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("pm_admin_token")}`
                }
            }
        );

        return response.data
    }
    catch (err) {
        if (err.response) {
            if (err.response) {
                console.error("Server Error:", err.response.status);
                console.error("Response:", err.response.data);
            } else if (err.request) {
                console.error("No response received from server.");
            } else {
                console.error("Request error:", err.message);
            }

            return err.response?.data;
        }

        return null;
    }
}

export const deleteFaq = async (id) => {
    try {
        const response = await axios.delete(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/faq/${id}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${sessionStorage.getItem("pm_admin_token")}`
                }
            }
        );

        return response.data
    }
    catch (err) {
        if (err.response) {
            if (err.response) {
                console.error("Server Error:", err.response.status);
                console.error("Response:", err.response.data);
            } else if (err.request) {
                console.error("No response received from server.");
            } else {
                console.error("Request error:", err.message);
            }

            return err.response?.data;
        }

        return null;
    }
}