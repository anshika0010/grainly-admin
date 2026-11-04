import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BASE_URL;
const BLOGS_URL = `${API_URL}/api/blogs`;

// Categories accepted by the backend Blog model.
export const BLOG_CATEGORIES = [
    "Nutrition",
    "Recipes",
    "Health",
    "Lifestyle",
    "Tips",
    "Product News",
    "Wellness",
    "Fitness",
    "Cooking",
    "Reviews",
];

const getAdminToken = () => {
    if (typeof window === "undefined") {
        return null;
    }

    return sessionStorage.getItem("pm_admin_token");
};

// The backend reads the raw admin token from the Authorization header (no "Bearer" prefix).
const authHeaders = () => {
    const token = getAdminToken();
    return token ? { Authorization: token } : {};
};

const toError = (err, fallback) => {
    const data = err?.response?.data;
    const details = Array.isArray(data?.errors) ? `: ${data.errors.join(", ")}` : "";
    console.error(fallback, err?.response?.status, data || err?.message);
    return new Error((data?.message || err?.message || fallback) + details);
};

// The list endpoint only returns published OR unpublished blogs (max 50 per page),
// so fetch every page of both and merge them.
const fetchAllPages = async (published) => {
    const blogs = [];
    let page = 1;
    let hasNext = true;

    while (hasNext) {
        const response = await axios.get(BLOGS_URL, {
            params: { published, page, limit: 50 },
        });
        blogs.push(...(response.data?.blogs || []));
        hasNext = Boolean(response.data?.pagination?.hasNext);
        page += 1;
    }

    return blogs;
};

export const getBlogs = async () => {
    try {
        const [published, drafts] = await Promise.all([
            fetchAllPages("true"),
            fetchAllPages("false"),
        ]);

        const blogs = [...published, ...drafts].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        return { success: true, blogs };
    } catch (err) {
        throw toError(err, "Failed to load blogs");
    }
};

// Returns the full blog (including content). Only works for published blogs.
export const getBlogsById = async (id) => {
    try {
        const response = await axios.get(`${BLOGS_URL}/${id}`);
        return response.data?.blog;
    } catch (err) {
        throw toError(err, "Failed to load blog");
    }
};

export const createBlog = async (blogData) => {
    try {
        const response = await axios.post(BLOGS_URL, blogData, {
            headers: { "Content-Type": "application/json", ...authHeaders() },
        });
        return response.data;
    } catch (err) {
        throw toError(err, "Failed to create blog");
    }
};

export const updateBlog = async (id, blogData) => {
    try {
        const response = await axios.put(`${BLOGS_URL}/${id}`, blogData, {
            headers: { "Content-Type": "application/json", ...authHeaders() },
        });
        return response.data;
    } catch (err) {
        throw toError(err, "Failed to update blog");
    }
};

export const deleteBlog = async (id) => {
    try {
        const response = await axios.delete(`${BLOGS_URL}/${id}`, {
            headers: authHeaders(),
        });
        return response.data;
    } catch (err) {
        throw toError(err, "Failed to delete blog");
    }
};
