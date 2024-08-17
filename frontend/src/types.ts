import { GridSortDirection } from "@mui/x-data-grid"

export type ContactResponse = {
    id: number
    first_name: string
    last_name: string
    email: string
    phone: string
}

export type ContactRequest = {
    first_name: string
    last_name: string
    email: string
    phone: string
}

export type Contact = {
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
}

export type ContactWithID = {
    id: number,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
}

export type ContactsModel = {
    contacts: ContactWithID[],
    total: number
}

export type ContactsModelResponse = {
    contacts: ContactResponse[],
    total: number
}

export type ContactsOptions = {
    filter?: {
        field: string,
        operator: string,
        values: string[]
    },
    sort?: {
        field: string,
        order: GridSortDirection,
    },
    pagination?: {
        page: number,
        pageSize: number,
    }
}

export type FilterModelRequest = {
    filter_field: string,
    filter_operator: string,
    filter_values: string[]
} | undefined

export type SortModelRequest = {
    sort_field: string,
    sort_order: GridSortDirection
} | undefined

export type PaginationModelRequest = {
    page: number,
    page_size: number
} | undefined

export type UserResponse = {
    email: string,
    display_name: string
    uuid: string
}

export type User = {
    email: string,
    displayName: string
    uuid: string
} 

export type UserCreateRequest = {
    email: string,
    display_name: string
    password: string
}

export type TokensResponse = {
    access_token: string,
    refresh_token: string,
}