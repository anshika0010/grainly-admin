import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const createRecipe = async (recipeData) => {
    try{
        const response = await axios.post(`${API_URL}/api/recipe`,
            recipeData,
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

export const updateRecipeRecipe = async (id,recipeData) => {
    try{
        const response = await axios.put(`${API_URL}/api/recipe/${id}`,
            recipeData,
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

export const updateRecipeRecipeStatus = async (id) => {
    try{
        const response = await axios.patch(`${API_URL}/api/recipe/status/${id}`,
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

export const deleteRecipeRecipe = async (id) => {
    try{
        const response = await axios.delete(`${API_URL}/api/recipe/${id}`,
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

export const getRecipe = async (page=1, limit=20,search="", status="") => {
    try{
        const response = await axios.get(`${API_URL}/api/recipe/dashboard?page=${page}&limit=${limit}&search=${search}&status=${status}`,
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