import axios from "axios"

const TASKS_API_ORIGIN = "https://api.carvia-test.org/poc-office365-service"
const MEDIA_API_ORIGIN = "https://api.carvia-test.org/tackit-service"

export const apiClient = axios.create({
  baseURL: import.meta.env.DEV ? "/api" : TASKS_API_ORIGIN,
  headers: {
    Accept: "application/json",
  },
})

export const mediaApiClient = axios.create({
  baseURL: import.meta.env.DEV ? "/media-api" : MEDIA_API_ORIGIN,
  headers: {
    Accept: "*/*",
  },
  withCredentials: true,
})

mediaApiClient.interceptors.request.use((config) => {
  if (config.data instanceof FormData && config.headers) {
    delete config.headers["Content-Type"]
  }

  const token =
    String(import.meta.env.VITE_MEDIA_API_TOKEN ?? "").trim() ||
    (typeof localStorage !== "undefined"
      ? String(localStorage.getItem("tackit_media_token") ?? "").trim()
      : "")

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`)
  }

  return config
})


// import axios from "axios"

// const TASKS_API_ORIGIN =
//   "https://api.carvia-test.org/poc-office365-service"

// const MEDIA_API_ORIGIN =
//   "https://api.carvia-test.org/tackit-service"

// export const apiClient = axios.create({
//   baseURL: TASKS_API_ORIGIN,
//   headers: {
//     Accept: "application/json",
//   },
// })

// export const mediaApiClient = axios.create({
//   baseURL: MEDIA_API_ORIGIN,
//   headers: {
//     Accept: "*/*",
//   },
// })

// mediaApiClient.interceptors.request.use((config) => {
//   if (config.data instanceof FormData && config.headers) {
//     delete config.headers["Content-Type"]
//   }

//   return config
// })