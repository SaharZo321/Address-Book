import { Button, List, ListItem, SxProps } from "@mui/material";
import { ContactModel } from "../types";
import { DataGrid, GridActionsCellItem, GridColDef, GridPagination, GridRowParams, GridRowSelectionModel, GridSlotProps } from '@mui/x-data-grid';
import { useCallback, useMemo, useState } from "react";
import { Add, Delete, Edit } from "@mui/icons-material";
import { DeleteDialog, FormDialog } from "./Dialogs";

const emptyContact: ContactModel = { id: 0, firstName: "", lastName: "", email: "", phone: "" }

export default function ContactTable(props: {
    contacts: ContactModel[],
    sx?: SxProps,
    editCallback: (contact: ContactModel) => void,
    createCallback: (contact: ContactModel) => void,
    deleteCallback: (ids: number[]) => void,
    updateTable: () => void,
    isLoading: boolean,
}) {

    const [modals, setModals] = useState({ delete: false, form: false })
    const [selectedContacts, setSelectedContacts] = useState<number[]>([])
    const [clickedContact, setClickedContact] = useState<ContactModel>(emptyContact)

    const closeModals = useCallback(() => setModals({ delete: false, form: false }), [])

    const onEditClick = useCallback((contact: ContactModel) => {
        console.log(contact)
        setClickedContact(contact)
        setModals(prev => ({ ...prev, form: true }))
    }, [])

    const onAddClick = useCallback(() => {
        setClickedContact(emptyContact)
        setModals(prev => ({ ...prev, form: true }))
    }, [])

    const onDeleteClick = useCallback((contact: ContactModel) => {
        console.log(contact)
        setClickedContact(contact)
        setModals(prev => ({ ...prev, delete: true }))
    }, [])

    const onDeleteSelectionClick = useCallback(() => {
        setClickedContact(emptyContact)
        setModals(prev => ({ ...prev, delete: true }))
    }, [])

    const handleDeleteClick = useCallback(() => {
        closeModals()
        if (!clickedContact.id && !selectedContacts) return

        props.deleteCallback(clickedContact.id ? [clickedContact.id] : selectedContacts)
        setClickedContact(emptyContact)
    }, [clickedContact, selectedContacts])


    const handleDoneForm = useCallback((contact: ContactModel) => {
        closeModals()
        setClickedContact({id: 0, email: "", phone: "", firstName: "", lastName: ""})
        clickedContact.id ?
            props.editCallback(contact) :
            props.createCallback(contact)
    }, [clickedContact])


    const columns: GridColDef[] = useMemo(() => [
        {
            field: "actions", type: "actions", getActions: (grid: GridRowParams<ContactModel>) => (
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
        { field: 'id', headerName: 'ID', type: "number", width: 70 },
        { field: 'firstName', headerName: 'First name', width: 130 },
        { field: 'lastName', headerName: 'Last name', width: 130 },
        { field: 'email', headerName: 'Email', width: 200 },
        { field: 'phone', headerName: 'Phone', width: 120 },
        {
            field: 'fullName',
            headerName: 'Full name',
            description: 'This column is not sortable.',
            sortable: false,
            width: 160,
            valueGetter: (_, contact: ContactModel) => `${contact.firstName || ''} ${contact.lastName || ''}`,
        },
    ], [])


    const onRowSelectionModelChange = useCallback((ids: GridRowSelectionModel) => {
        setSelectedContacts(ids.map(id => Number(id)))
    }, [])

    const CustomRowCount = useCallback((props: GridSlotProps["pagination"]) => {

        return (
            <>
                {
                    Boolean(selectedContacts.length) &&
                    <Button
                        variant="contained"
                        color="error"
                        sx={{ marginRight: "auto" }}
                        onClick={onDeleteSelectionClick}
                    >
                        Delete
                    </Button>
                }
                <Button
                    size="large"
                    variant="contained"
                    startIcon={<Add />}
                    onClick={onAddClick}
                    sx={{
                        position: "absolute",
                        left: "40%",
                        right: "40%",
                    }}
                >
                    Add Contact
                </Button>
                <GridPagination {...props} />
            </>
        )
    }, [selectedContacts.length, onDeleteSelectionClick])


    return (
        <>
            <List>
                <ListItem>
                    <DataGrid
                        rows={props.contacts}
                        columns={columns}
                        autoPageSize
                        checkboxSelection
                        sx={props.sx}
                        onRowSelectionModelChange={onRowSelectionModelChange}
                        loading={props.isLoading}
                        slots={{
                            pagination: CustomRowCount
                        }}

                    />
                </ListItem>
            </List>
            <DeleteDialog
                open={modals.delete}
                handleClose={closeModals}
                handleDelete={handleDeleteClick}
                multiple={clickedContact.id ? false : selectedContacts.length > 1}
            />
            <FormDialog
                open={modals.form}
                handleClose={closeModals}
                handleDoneForm={handleDoneForm}
                contact={clickedContact}
            />
        </>
    )
}





