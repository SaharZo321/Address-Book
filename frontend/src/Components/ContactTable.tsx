import { Button, List, ListItem, SxProps } from "@mui/material";
import { ContactModel, ContactsModel, OptionsModel } from "../types";
import { DataGrid, GridActionsCellItem, GridColDef, GridFilterModel, GridPagination, GridPaginationModel, GridRowParams, GridRowSelectionModel, GridSlotProps, GridSortModel } from '@mui/x-data-grid';
import { useCallback, useMemo, useRef, useState } from "react";
import { Add, Delete, Edit } from "@mui/icons-material";
import { DeleteDialog, FormDialog } from "./Dialogs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addContact, deleteContacts, editContact, fetchContacts } from "../api";
import * as changeCase from "change-case";

const emptyContact: ContactModel = { id: 0, first_name: "", last_name: "", email: "", phone: "" }
const initialPaginationModel: GridPaginationModel = { page: 0, pageSize: 10 }

export default function ContactTable(props: { sx?: SxProps }) {

    const [modals, setModals] = useState({ delete: false, form: false })
    const [selectedContacts, setSelectedContacts] = useState<GridRowSelectionModel>([])
    const [clickedContact, setClickedContact] = useState<ContactModel>(emptyContact)
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(initialPaginationModel)
    const [filterModel, setFilterModel] = useState<GridFilterModel>()
    const [sortModel, setSortModel] = useState<GridSortModel>([])
    const queryClient = useQueryClient()

    const { data: contactsModel, isLoading, error } = useQuery<ContactsModel>({
        queryKey: ["contacts", paginationModel, filterModel, sortModel],
        queryFn: () => {
            console.log(filterModel)
            console.log(sortModel)
            const options: OptionsModel = {
                pagination: {
                    page_size: paginationModel.pageSize,
                    page: paginationModel.page
                },
                sort: sortModel[0] ? {
                    field: sortModel[0].field,
                    order: sortModel[0].sort
                } : undefined,
                filter: filterModel?.items[0] ? {
                    field: filterModel.items[0].field,
                    values: filterModel.items[0].value,
                    operator: (
                        filterModel.items[0].operator.match(/[\w]+/) ? 
                        changeCase.snakeCase(filterModel.items[0].operator) : 
                        filterModel.items[0].operator)
                } : undefined
            }
            console.log(options)
            return fetchContacts(options)
        },
    })

    if (error) {
        console.error(error)
    }

    const { mutateAsync: addContactMutation } = useMutation({
        mutationFn: addContact,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["contacts"]
            })
        }
    })

    const { mutateAsync: editContactMutation } = useMutation({
        mutationFn: editContact,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["contacts"]
            })
        }
    })

    const { mutateAsync: deleteContactsMutation } = useMutation({
        mutationFn: deleteContacts,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["contacts"]
            })
        },

    })

    const closeModals = useCallback(() => {
        setModals({ delete: false, form: false })
        setClickedContact(emptyContact)
    }, [])

    const onEditClick = useCallback((contact: ContactModel) => {
        setClickedContact(contact)
        setModals(prev => ({ ...prev, form: true }))
    }, [])

    const onAddClick = useCallback(() => {
        setClickedContact(emptyContact)
        setModals(prev => ({ ...prev, form: true }))
    }, [])

    const onDeleteClick = useCallback((contact: ContactModel) => {
        setClickedContact(contact)
        setModals(prev => ({ ...prev, delete: true }))
    }, [])

    const onDeleteSelectionClick = useCallback(() => {
        setClickedContact(emptyContact)
        setModals(prev => ({ ...prev, delete: true }))
    }, [])

    const handleDoneForm = useCallback(async (contact: ContactModel) => {
        if (clickedContact.id) {
            try {
                await editContactMutation(contact)
                closeModals()
            } catch (e) {
                console.error(e)
            }
        } else {
            try {
                await addContactMutation(contact)
                closeModals()
            } catch (e) {
                console.error(e)
            }
        }
    }, [clickedContact])

    const handleDeleteClick = useCallback(async () => {
        try {
            await deleteContactsMutation(
                clickedContact.id ? [clickedContact.id] : selectedContacts.map(id => Number(id))
            )
            closeModals()
        } catch (e) {
            console.error(e)
        }
    }, [clickedContact, selectedContacts])

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
        { field: 'id', headerName: 'ID', type: "number", width: 50 },
        { field: 'first_name', headerName: 'First name', width: 100 },
        { field: 'last_name', headerName: 'Last name', width: 130 },
        { field: 'email', headerName: 'Email', width: 220 },
        { field: 'phone', headerName: 'Phone', width: 140 },
        {
            field: 'full_name',
            headerName: 'Full name',
            description: 'This column is not sortable nor filterable.',
            sortable: false,
            width: 160,
            filterable: false,
            valueGetter: (_, contact: ContactModel) => `${contact.first_name || ''} ${contact.last_name || ''}`,
            
        },
    ], [])

    const CustomRowCount = useCallback((props: GridSlotProps["pagination"]) => {
        return (
            <>
                {
                    Boolean(selectedContacts.length) ?
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
                                marginLeft: "8px",
                            }}
                        >
                            <Add />
                        </Button>
                }
                <GridPagination {...props} />
            </>
        )
    }, [selectedContacts.length, onDeleteSelectionClick])

    const rowCountRef = useRef(contactsModel?.total || 0);

    const rowCount = useMemo(() => {
        rowCountRef.current = contactsModel ? contactsModel.total : rowCountRef.current;
        return rowCountRef.current;
    }, [contactsModel?.total]);

    return (
        <>
            <List>
                <ListItem>
                    <DataGrid
                        rows={contactsModel?.contacts}
                        rowCount={rowCount}
                        columns={columns}
                        pageSizeOptions={[10, 20, 50]}
                        initialState={{
                            pagination: {
                                paginationModel: initialPaginationModel
                            }
                        }}
                        paginationMode="server"
                        filterMode="server"
                        sortingMode="server"
                        checkboxSelection
                        sx={props.sx}
                        onRowSelectionModelChange={setSelectedContacts}
                        loading={isLoading}
                        slots={{
                            pagination: CustomRowCount
                        }}
                        onPaginationModelChange={setPaginationModel}
                        onFilterModelChange={setFilterModel}
                        onSortModelChange={setSortModel}
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





