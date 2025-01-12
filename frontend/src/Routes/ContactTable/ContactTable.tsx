import { Box, SxProps } from "@mui/material";
import Table from "./Table"
import ContactAPIProvider, { useContactAPIContext } from "../../Contexts/ContactAPIContext";
import { GridPaginationModel, GridRowSelectionModel } from "@mui/x-data-grid";
import { DeleteDialog, FormDialog } from "../../Components/Dialogs";
import { useCallback, useState } from "react";
import { Contact, ContactWithID } from "../../types";
import { useTableOptions } from "../../hooks/useTableOptions";
import { useContactTableData } from "../../hooks/useContactTableData";

export default function ContactTable(props: { initialPagination: GridPaginationModel, sx?: SxProps }) {
    const [modals, setModals] = useState({ delete: false, form: false })
    const [selectedContacts, setSelectedContacts] = useState<GridRowSelectionModel>([])
    const [clickedContact, setClickedContact] = useState<ContactWithID>()
    const { setFilter, setSort, setPagination } = useTableOptions()
    const { contacts, totalRows } = useContactTableData()

    const {
        isPending: isFetching,
        deleteContactMutation: { mutateAsync: deleteContact, isPending: isDeleteContactPending },
        editContactMutation: { mutateAsync: editContact, isPending: isEditContactPending },
        createContactMutation: { mutateAsync: createContact, isPending: isCreateContactPending },
        deleteContactsMutation: { mutateAsync: deleteContacts, isPending: isDeleteContactsPending },
    } = useContactAPIContext()

    const closeModals = useCallback(() => {
        setModals({ delete: false, form: false })
        setClickedContact(undefined)
    }, [])

    const onEditClick = useCallback((contact: ContactWithID) => {
        setClickedContact(contact)
        setModals(prev => ({ ...prev, form: true }))
    }, [])

    const onAddClick = useCallback(() => {
        setClickedContact(undefined)
        setModals(prev => ({ ...prev, form: true }))
    }, [])

    const onDeleteClick = useCallback((contact: ContactWithID) => {
        setClickedContact(contact)
        setModals(prev => ({ ...prev, delete: true }))
    }, [])

    const onDeleteSelectionClick = useCallback(() => {
        setClickedContact(undefined)
        setModals(prev => ({ ...prev, delete: true }))
    }, [])

    const handleDoneForm = useCallback(async (contact: Contact) => {
        if (clickedContact) {
            await editContact({ contact: { ...contact, id: clickedContact.id } })
        } else {
            await createContact({ contact })
        }
        closeModals()
    }, [clickedContact, editContact, createContact])

    const handleDelete = useCallback(async () => {
        if (clickedContact) {
            await deleteContact({ id: clickedContact.id })
            setSelectedContacts(prev => prev.filter(id => id !== clickedContact.id))
        } else if (selectedContacts) {
            await deleteContacts({ ids: selectedContacts.map(id => Number(id)) })
            setSelectedContacts([])
        }
        closeModals()
    }, [clickedContact, selectedContacts, deleteContact, deleteContacts])
    return (
        <>
            <Table
                initialPaginationModel={props.initialPagination}
                sx={props.sx}
                isFetching={isFetching}
                contactsData={{ contacts, totalRows }}
                callbacks={{
                    onAddClick: onAddClick,
                    onDeleteClick: onDeleteClick,
                    onDeleteSelectionClick: onDeleteSelectionClick,
                    onEditClick: onEditClick
                }}
                setOptions={{
                    setFilter: setFilter,
                    setPagination: setPagination,
                    setSort: setSort,
                }}
                rowSelection={{
                    set: setSelectedContacts,
                    state: selectedContacts,
                }}
            />
            <DeleteDialog
                open={modals.delete}
                handleClose={closeModals}
                handleDelete={handleDelete}
                multiple={clickedContact ? false : selectedContacts.length > 1}
                isPending={isDeleteContactsPending || isFetching || isDeleteContactPending}
            />
            <FormDialog
                open={modals.form}
                handleClose={closeModals}
                handleDoneForm={handleDoneForm}
                initialContact={clickedContact}
                isPending={isCreateContactPending || isFetching || isEditContactPending}
            />
        </>
    )
}