import { API_URL, STRAPI_API_TOKEN } from "./urls";

// Function to fetch data (GET request)
export const fetchDataFromApi = async (endpoint) => {
    const options = {
        method: "GET",
        headers: {
            Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
    };

    const res = await fetch(`${API_URL}${endpoint}`, options);
    const data = await res.json();
    return data;
};

// Function to create data (POST request)
export const createData = async (endpoint, data) => {
    const options = {
        method: "POST",
        headers: {
            Authorization: `Bearer ${STRAPI_API_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    };

    const res = await fetch(`${API_URL}${endpoint}`, options);
    const responseData = await res.json();
    return responseData;
};

// Function to update data (PUT request)
export const updateData = async (endpoint, data) => {
    const options = {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${STRAPI_API_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    };

    const res = await fetch(`${API_URL}${endpoint}`, options);
    const responseData = await res.json();
    return responseData;
};

// Function to delete data (DELETE request)
export const deleteData = async (endpoint) => {
    const options = {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
    };

    const res = await fetch(`${API_URL}${endpoint}`, options);
    if (res.ok) {
        return { message: "Deleted successfully" };
    } else {
        const errorData = await res.json();
        return errorData;
    }
};
