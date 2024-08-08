import { ContactModel, OptionsModel } from "./types";
import { urlCreate, urlDelete, urlGet, urlUpdate } from "./constants";

function send(url: string, type: "PATCH" | "DELETE" | "POST" | "GET", body: any) {
    const options = {
        method: type,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    }
    console.log(JSON.stringify(body))
    
    return fetch(url, options)
}

export function fetchContacts(options: OptionsModel) {
    return send(urlGet, "POST", options).then(response => response.json());
}

export async function addContact(contact: ContactModel) {
    const response = await send(urlCreate, "POST", contact);
    return response.json();
}

export async function editContact(contact: ContactModel) {
    const response = await send(urlUpdate, "PATCH", contact);
    return response.json();
}

export async function deleteContacts(ids: number[]) {
    const response = await send(urlDelete, "DELETE", ids);
    return response.json();
}