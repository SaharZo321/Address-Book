import { ContactModel, FilterModel, PaginationModel, SortModel } from "./types";
import { urlMultiple, urlSingle } from "./constants";
import qs from "qs";

async function send(url: string, type: "PATCH" | "DELETE" | "POST" | "GET", body: any) {
    const options = {
        method: type,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    }

    return fetch(url, options).then(async response => {
        if (response.status >= 400) {
            console.error(await response.json())
        }
    })

}

export async function fetchContacts(sortParams: SortModel, filterParams: FilterModel, pagingationParams: PaginationModel) {
    const query_params = {
        ...sortParams,
        ...filterParams,
        ...pagingationParams,
    }
    const query = qs.stringify(query_params, {
        addQueryPrefix: true,
        arrayFormat: "repeat"
    })
    console.log(query)
    return fetch(urlMultiple + query).then(async response => {
        const data = await response.json()
        if (response.status >= 400) {
            console.error(data)
        }
        return data
    })
}

export async function addContact(contact: ContactModel) {
    return send(urlSingle, "POST", contact)
}

export async function editContact(contact: ContactModel) {
    return send(urlSingle + `${contact.id}`, "PATCH", contact)
}

export async function deleteContacts(ids: number[]) {
    const query = qs.stringify({ ids }, {
        addQueryPrefix: true,
        arrayFormat: "repeat"
    })
    return send(urlMultiple + query, "DELETE", ids)
}