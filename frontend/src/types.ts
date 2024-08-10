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

export type FilterModel = {
    filter_field: string,
    filter_operator: string,
    filter_values: string[]
} | undefined

export type SortModel = {
    sort_field: string,
    sort_order: GridSortDirection
} | undefined

export type PaginationModel = {
    page: number,
    page_size: number
} | undefined
