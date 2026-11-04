import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BASE_URL;
const getAdminToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return sessionStorage.getItem("pm_admin_token");
};

const token = getAdminToken();

export const getBlogCategory = async () => {
    try {
        const response = await axios.get(
            `${API_URL}/api/blogcategory/dashboard/`,
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

export const createBlogCategory = async (blogData) => {
    try {

        const response = await axios.post(`${API_URL}/api/blogcategory/`,
            blogData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
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

export const updateBlogCategory = async (id, blogData) => {
    try {

        const response = await axios.put(`${API_URL}/api/blogcategory/${id}`,
            blogData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
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

export const deleteBlogCategory = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/api/blogcategory/${id}`,
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