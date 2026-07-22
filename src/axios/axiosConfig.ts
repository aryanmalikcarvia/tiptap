import axios from "axios"

const TASKS_API_ORIGIN =
  "https://api.carvia-test.org/poc-office365-service"

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
})

mediaApiClient.interceptors.request.use((config) => {
  if (config.data instanceof FormData && config.headers) {
    delete config.headers["Content-Type"]
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