import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BASE_URL
console.log(API_URL)


export const getBooking = async (page, limit) => {
    try {
        const response = await axios.get(
            `${API_URL}/api/booking?page=${page}&limit=${limit}`,
            {
                headers: {
                    "Content-Type": "application/json"
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

export const updateBookingStatus = async (id, status) => {
    try {
        const response = await axios.patch(
            `${API_URL}/api/booking/${id}`,
            { status: status },
            {
                headers: {
                    "Content-Type": "application/json"
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

export const deleteBookingStatus = async (id) => {
    try{
        const response =  await axios.delete(
            `${API_URL}/api/booking/${id}`,
            {
                headers:{
                    "Content-Type":"application/type"
                }
            }
        );

        return response.data
    }
    catch(err){
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

export const searchBooking = async (searchValue, page, limit) => {
    try{
        const response = await axios.get(
            `${API_URL}/api/booking/search?q=${searchValue}&page=${page}&limit=${limit}`,
            {
                headers:{
                    "Content-Type":"application/json"
                }
            }
        );

        return response.data
    }
    catch(err){
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