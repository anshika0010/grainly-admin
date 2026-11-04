import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BASE_URL;
const token = sessionStorage.getItem("pm_admin_token");

export const getContact = async () => {
    try {
        const response = await axios.get(
            `${API_URL}/api/contact/dashboard/`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data;
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

export const updateContact = async (id, status) => {
    try {

        const response = await axios.put(
            `${API_URL}/api/contact/${id}`,
            {
                status: status
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data;
    } catch (err) {
        if (err.response) {
            console.error("Server Error:", err.response.status);
            console.error("Response:", err.response.data);
        } else if (err.request) {
            console.error("No response received from server.");
        } else {
            console.error("Request error:", err.message);
        }

        return err.response?.data || null;
    }
};

export const deleteContact = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/api/contact/${id}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });


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