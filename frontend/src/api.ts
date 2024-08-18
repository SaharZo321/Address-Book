import axios from "axios";
import { Contact, ContactRequest, ContactsOptions, ContactWithID } from "./types";
import qs from "qs"
export const server_url = "http://localhost:8000"
const version = "v1"
const prefix = `/api/${version}`
export const contacts_url = server_url + prefix + "/contacts"
export const auth_url = server_url + prefix + "/users"

const contactsInstance = (accessToken: string) => axios.create({
    baseURL: contacts_url,
    headers: {
        Authorization: `Bearer ${accessToken}`,
    },
    paramsSerializer: params => qs.stringify(params, { arrayFormat: "repeat" })
})

const userInstance = (token: string) => axios.create({
    baseURL: auth_url,
    headers: {
        Authorization: `Bearer ${token}`,
    }
})

const formInstance = axios.create({
    baseURL: auth_url,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
})

export async function fetchContactsAPI(vars: {
    options: ContactsOptions,
    accessToken: string,
}) {
    const { options: { sort, filter, pagination }, accessToken } = vars

    const params = {
        page: pagination?.page,
        page_size: pagination?.pageSize,
        sort_field: sort?.field,
        sort_order: sort?.order,
        filter_field: filter?.field,
        filter_operator: filter?.operator,
        filter_values: filter?.values
    }
    return contactsInstance(accessToken).get("", { params })
}

export async function fetchContactAPI(vars: { id: number, accessToken: string }) {
    const { id, accessToken } = vars
    return contactsInstance(accessToken).get(`/${id}`)
}

export async function createContactAPI(vars: { contact: Contact, accessToken: string }) {
    const { contact, accessToken } = vars
    const contactRequest: ContactRequest = {
        first_name: contact.firstName,
        last_name: contact.lastName,
        email: contact.email,
        phone: contact.phone
    }
    // return send({ url: contacts_url, method: "POST", body: contactRequest, accessToken })
    return contactsInstance(accessToken).post("", contactRequest)
}

export async function editContactAPI(vars: { contact: ContactWithID, accessToken: string }) {
    const { contact, accessToken } = vars
    const contactRequest: ContactRequest = {
        first_name: contact.firstName,
        last_name: contact.lastName,
        email: contact.email,
        phone: contact.phone
    }
    return contactsInstance(accessToken).patch(`/${contact.id}`, contactRequest)

}

export async function deleteContactsAPI(vars: { ids: number[], accessToken: string }) {
    const { ids, accessToken } = vars
    return contactsInstance(accessToken).delete("", { params: { ids } })
}

export async function deleteContactAPI(vars: { id: number, accessToken: string }) {
    const { id, accessToken } = vars
    return contactsInstance(accessToken).delete(`/${id}`)
}

export async function registerAPI(user: { email: string, password: string, displayName: string }) {
    const { email, password, displayName: display_name } = user
    const body = {
        password,
        email,
        display_name,
    }
    return axios.post(`${auth_url}/register`, body)
}

export async function loginAPI(credentials: { email: string, password: string }) {
    const data = {
        username: credentials.email,
        password: credentials.password,
    }
    return formInstance.post("/login", data)
}

export async function activateUserAPI(credentials: { email: string, password: string }) {
    const data = {
        username: credentials.email,
        password: credentials.password,
    }
    return formInstance.post("/activate", data)

}

export async function getConnectedUserAPI(accessToken: string) {
    return userInstance(accessToken).get("/me")
}

export async function changeDisplayNameAPI(variables: { accessToken: string, displayName: string }) {
    const { accessToken, displayName: display_name } = variables
    const body = {
        display_name
    }
    return userInstance(accessToken).patch("/display-name", body)
    
}

export async function changePasswordAPI(variables: { securityToken: string, password: string }) {
    const { securityToken, password } = variables
    const body = {
        password
    }
    return userInstance(securityToken).patch("/change-password", body)
}

export async function logoutAPI(accessToken: string) {
    return userInstance(accessToken).post("/logout")
}

export async function deactivateUserAPI(variables: { securityToken: string }) {
    const { securityToken } = variables
    
    return userInstance(securityToken).post("/deactivate")

}

export async function refreshTokenAPI(refreshToken: string) {
    return userInstance(refreshToken).get("/refresh-token")
}

export async function verifyPasswordAPI(vars: { accessToken: string, password: string }) {
    const { accessToken, password } = vars
    const body = {
        password
    }
    return userInstance(accessToken).post("/security-token", body)
}



