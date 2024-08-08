import { GridSortDirection } from "@mui/x-data-grid"

export type ContactModel = {
    id: number
    first_name: string
    last_name: string
    email: string
    phone: string
}

export type ContactsModel = {
    contacts: ContactModel[],
    total: number
}

export type OptionsModel = {
    pagination: {
        page_size: number,
        page: number
    },
    sort?: {
        field: string,
        order: GridSortDirection
    },
    filter?: {
        field: string,
        operator: string,
        values: string[] | string
    }
}