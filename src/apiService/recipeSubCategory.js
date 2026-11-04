import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const createSub = async (categoryData) => {
    try{
        const response = await axios.post(`${API_URL}/api/recipe/category/sub`,
            categoryData,
            {
                headers:"application/json"
            }
        );

        return response.data;
    }catch(err){
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

export const updateSubCategory = async (id,categoryData) => {
    try{
        const response = await axios.put(`${API_URL}/api/recipe/category/sub/${id}`,
            categoryData,
            {
                headers:"application/json"
            }
        );

        return response.data;
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

export const updateSubCategoryStatus = async (id) => {
    try{
        const response = await axios.patch(`${API_URL}/api/recipe/category/sub/status/${id}`,
            {},
            {
                headers:"application/json"
            }
        );

        return response.data;
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

export const deleteSubCategory = async (id) => {
    try{
        const response = await axios.delete(`${API_URL}/api/recipe/category/sub/${id}`,
            {
                headers:"application/json"
            }
        );

        return response.data;
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

export const getCategory = async (page=1, limit=20) => {
    try{
        const response = await axios.get(`${API_URL}/api/recipe/category/sub/dashboard?page=${page}&limit=${limit}`,
            {
                headers:"application/json"
            }
        );

        return response.data;
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