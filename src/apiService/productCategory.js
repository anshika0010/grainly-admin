import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const ceateProductCategory = async (categoryData) => {
    try {
        const response = await axios.post(
            `${API_URL}/api/product/category/`,
            categoryData,
            {
                headers:{
                   "Content-Type": "multipart/form-data",
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

export const updateProductCategory = async (id,categoryData) => {
    try {
        const response = await axios.put(
            `${API_URL}/api/product/category/${id}`,
            categoryData,
            {
                headers:{
                    "Content-Type": "multipart/form-data",
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

export const updateStatusProductCategory = async (id) => {
    try {
        const response = await axios.patch(
            `${API_URL}/api/product/category/status/${id}`,
            {},
            {
                headers:{
                    "Content-Type":"application/json"
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

export const deleteProductCategory = async (id) => {
    try {
        const response = await axios.delete(
            `${API_URL}/api/product/category/${id}`,
            {
                headers:{
                    "Content-Type":"application/json"
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

export const getProductCategory = async (page=1, limit=20) =>{
    try{
        const response = await axios.get(
            `${API_URL}/api/product/category/dashboard?page=${page}&limit=${limit}`,
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