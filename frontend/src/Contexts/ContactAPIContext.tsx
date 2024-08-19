import { useMutation, UseMutationResult, useQuery, useQueryClient } from "@tanstack/react-query"
import useTokensCookies from "../hooks/useTokensCookies"
import { Contact, ContactsModel, ContactsModelResponse, ContactsOptions, ContactWithID } from "../types"
import { createContactAPI, deleteContactAPI, deleteContactsAPI, editContactAPI, fetchContactAPI, fetchContactsAPI } from "../api"
import { createContext, Dispatch, PropsWithChildren, SetStateAction, useCallback, useContext, useState } from "react"
import { AxiosError, AxiosResponse } from "axios"
import { SnackBarContext } from "../App"



type ContactAPIContext = {
    contactsModel?: ContactsModel,
    readContactMutation: UseMutationResult<AxiosResponse, AxiosError<any>, { id: number }>,
    deleteContactMutation: UseMutationResult<AxiosResponse, AxiosError, { id: number }>,
    editContactMutation: UseMutationResult<AxiosResponse, AxiosError, { contact: ContactWithID }>,
    createContactMutation: UseMutationResult<AxiosResponse, AxiosError, { contact: Contact }>,
    deleteContactsMutation: UseMutationResult<AxiosResponse, AxiosError, { ids: number[] }>,
    setOptions: Dispatch<SetStateAction<ContactsOptions>>,
    isPending: boolean,
}

const ContactAPIContext = createContext<ContactAPIContext | undefined>(undefined)

export const useContactAPIContext = () => {
    const context = useContext(ContactAPIContext)
    if (!context) {
        throw new Error("useContactAPIContext must be used within a ContactAPIProvider")
    }
    return context
}

export default function ContactAPIProvider(props: PropsWithChildren<{ initialOptions: ContactsOptions }>) {
    const { tokens } = useTokensCookies()
    const { openSnackbar, openErrorSnackbar } = useContext(SnackBarContext)
    const queryClient = useQueryClient()

    const [options, setOptions] = useState<ContactsOptions>(props.initialOptions)

    const { data: contactsModel, isPending } = useQuery<ContactsModel>({
        queryKey: ["contacts", options, tokens?.accessToken],
        queryFn: async () => {
            if (!tokens?.accessToken) {
                throw new Error("No access token")
            }
            const response = await fetchContactsAPI({
                options,
                accessToken: tokens.accessToken,
            })
            const contactsModelResponse: ContactsModelResponse = response.data
            return {
                contacts: contactsModelResponse.contacts.map(contact => ({
                    id: contact.id,
                    email: contact.email,
                    phone: contact.phone,
                    firstName: contact.first_name,
                    lastName: contact.last_name,
                })),
                total: contactsModelResponse.total
            }
        }
    })

    const invalidateTable = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["contacts"] })
    }, [])

    const readContactMutation = useMutation<AxiosResponse, AxiosError<any>, { id: number }>({
        mutationFn: async (vars) => {
            if (!tokens?.accessToken) {
                throw new Error("No access token")
            }
            return await fetchContactAPI({ ...vars, accessToken: tokens.accessToken })
        },
        onSuccess: invalidateTable,
        onError: openErrorSnackbar,
    })

    const deleteContactMutation = useMutation<AxiosResponse, AxiosError<any>, { id: number }>({
        mutationFn: async (vars) => {
            if (!tokens?.accessToken) {
                throw new Error("No access token")
            }
            return await deleteContactAPI({ ...vars, accessToken: tokens.accessToken })
        },
        onSuccess: () => {
            openSnackbar({
                open: true,
                message: "Contact was deleted successfully",
                severity: "info"
            })
            invalidateTable()
        },
        onError: openErrorSnackbar,
    })

    const editContactMutation = useMutation<AxiosResponse, AxiosError<any>, { contact: ContactWithID }>({
        mutationFn: async (vars) => {
            if (!tokens?.accessToken) {
                throw new Error("No access token")
            }
            return await editContactAPI({ ...vars, accessToken: tokens.accessToken })
        },
        onSuccess: () => {
            openSnackbar({
                open: true,
                message: "Contact was edited successfully",
                severity: "success"
            })
            invalidateTable()
        },
        onError: openErrorSnackbar,
    })

    const createContactMutation = useMutation<AxiosResponse, AxiosError<any>, { contact: Contact }>({
        mutationFn: async (vars) => {
            if (!tokens?.accessToken) {
                throw new Error("No access token")
            }
            return await createContactAPI({ ...vars, accessToken: tokens.accessToken })
        },
        onSuccess: () => {
            openSnackbar({
                open: true,
                message: "Contact was created successfully",
                severity: "success"
            })
            invalidateTable()
        },
        onError: openErrorSnackbar,
    })

    const deleteContactsMutation = useMutation<AxiosResponse, AxiosError<any>, { ids: number[] }>({
        mutationFn: async (vars) => {
            if (!tokens?.accessToken) {
                throw new Error("No access token")
            }
            return await deleteContactsAPI({ ...vars, accessToken: tokens.accessToken })
        },
        onSuccess: () => {
            openSnackbar({
                open: true,
                message: "Contacts were deleted successfully",
                severity: "info"
            })
            invalidateTable()
        },
        onError: openErrorSnackbar,
    })

    return (
        <ContactAPIContext.Provider value={{
            contactsModel,
            isPending,
            readContactMutation,
            deleteContactMutation,
            editContactMutation,
            createContactMutation,
            deleteContactsMutation,
            setOptions,
        }}>
            {props.children}
        </ContactAPIContext.Provider>
    )
}