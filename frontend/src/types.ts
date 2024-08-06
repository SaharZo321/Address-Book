export type ContactModel = {
    id: number
    firstName: string
    lastName: string
    email: string
    phone: string
}

export type ContactsData = {
    contacts: ContactModel[]
}

