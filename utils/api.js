import { API_URL, STRAPI_API_TOKEN } from "./urls"

export const fetchDataFromApi = async (endpoint) => {
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
    },
  }

  const res = await fetch(`${API_URL}${endpoint}`, options)
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
  return res.json()
}

export const createData = async (endpoint, data) => {
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }

  const res = await fetch(`${API_URL}${endpoint}`, options)
  if (!res.ok) throw new Error(`Create failed: ${res.statusText}`)
  return res.json()
}

export const updateData = async (endpoint, data) => {
  const options = {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }

  const res = await fetch(`${API_URL}${endpoint}`, options)
  if (!res.ok) throw new Error(`Update failed: ${res.statusText}`)
  return res.json()
}

export const deleteData = async (endpoint) => {
  const options = {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
    },
  }

  const res = await fetch(`${API_URL}${endpoint}`, options)
  if (!res.ok) throw new Error(`Delete failed: ${res.statusText}`)
  return { message: "Deleted successfully" }
}