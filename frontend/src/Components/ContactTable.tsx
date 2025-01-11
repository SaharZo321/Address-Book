import { Button, List, ListItem, SxProps } from "@mui/material";
import { ContactResponse, ContactWithID, Contact, ContactsModel, ContactsModelResponse, ContactsOptions } from "../types";
import { DataGrid, GridActionsCellItem, GridColDef, GridFilterModel, GridPagination, GridPaginationModel, GridRowParams, GridRowSelectionModel, GridSlotProps, GridSortModel } from '@mui/x-data-grid';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Add, Delete, Edit } from "@mui/icons-material";
import { DeleteDialog, FormDialog } from "./Dialogs";
import { useContactAPIContext } from "../Contexts/ContactAPIContext";
import _ from "lodash";
import { useTableOptions } from "../hooks/useTableOptions";
import { useContactTableData } from "../hooks/useContactTableData";


export default function ContactTable(props: { sx?: SxProps, initialPaginationModel: GridPaginationModel }) {

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

    const columns: GridColDef[] = useMemo(() => [
        {
            field: "actions", type: "actions", getActions: (grid: GridRowParams<ContactWithID>) => (
                [
                    <GridActionsCellItem
                        icon={<Delete />}
                        label="Delete"
                        onClick={() => onDeleteClick(grid.row)}
                    />,
                    <GridActionsCellItem
                        icon={<Edit />}
                        label="Edit"
                        onClick={() => onEditClick(grid.row)}
                    />,
                ]
            ),
            width: 70,
        },
        { field: 'firstName', headerName: 'First name', width: 100 },
        { field: 'lastName', headerName: 'Last name', width: 130 },
        { field: 'email', headerName: 'Email', width: 220 },
        { field: 'phone', headerName: 'Phone', width: 140 },
        {
            field: 'full_name',
            headerName: 'Full name',
            description: 'This column is not sortable nor filterable.',
            sortable: false,
            width: 160,
            filterable: false,
            valueGetter: (_, contact: Contact) => `${contact.firstName || ''} ${contact.lastName || ''}`,

        },
    ], [])

    const CustomRowCount = useCallback((props: GridSlotProps["pagination"]) => {

        return (
            <>
                {
                    selectedContacts.length ?
                        <Button
                            variant="contained"
                            color="error"
                            onClick={onDeleteSelectionClick}
                            sx={{
                                marginRight: "auto",
                            }}
                        >
                            <Delete />
                        </Button> :
                        <Button
                            variant="contained"
                            onClick={onAddClick}
                            sx={{
                                marginRight: "auto",
                                marginLeft: "16px",
                            }}
                        >
                            <Add />
                        </Button>
                }
                <GridPagination {...props} />
            </>
        )
    }, [selectedContacts.length, onDeleteSelectionClick, onAddClick])



    return (
        <>
            <List>
                <ListItem>
                    <DataGrid
                        rows={contacts}
                        rowCount={totalRows}
                        columns={columns}
                        pageSizeOptions={[10, 20, 50]}
                        initialState={{
                            pagination: {
                                paginationModel: props.initialPaginationModel
                            }
                        }}
                        paginationMode="server"
                        filterMode="server"
                        sortingMode="server"
                        checkboxSelection
                        sx={props.sx}
                        onRowSelectionModelChange={setSelectedContacts}
                        rowSelectionModel={selectedContacts}
                        loading={isFetching}
                        slots={{
                            pagination: CustomRowCount
                        }}
                        onPaginationModelChange={setPagination}
                        onFilterModelChange={setFilter}
                        onSortModelChange={setSort}
                        filterDebounceMs={250}
                        keepNonExistentRowsSelected
                    />
                </ListItem>
            </List>
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





