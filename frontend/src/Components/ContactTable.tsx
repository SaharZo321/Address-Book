import { Button, List, ListItem, SxProps } from "@mui/material";
import { ContactModel, ContactsModel, FilterModel, SortModel, PaginationModel } from "../types";
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
            const fm: FilterModel = filterModel?.items[0] ? {
                filter_field: filterModel.items[0].field,
                filter_values: (
                    typeof filterModel.items[0].value == "string" ?
                        [filterModel.items[0].value] :
                        filterModel.items[0].value
                ),
                filter_operator: (
                    filterModel.items[0].operator.match(/[\w]+/) ?
                        changeCase.snakeCase(filterModel.items[0].operator) :
                        filterModel.items[0].operator)
            } : undefined

            const pm: PaginationModel = {
                page_size: paginationModel.pageSize,
                page: paginationModel.page
            }

            const sm: SortModel = sortModel[0] ? {
                sort_field: sortModel[0].field,
                sort_order: sortModel[0].sort
            } : undefined
            closeModals()
            return fetchContacts(sm, fm, pm)
        },
    })

    if (error) {
        console.error(error.message)
    }

    const { mutateAsync: addContactsMutation, isPending: isAddPending } = useMutation({
        mutationFn: addContact,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["contacts"]
            })
        }
    })

    const { mutateAsync: editContactMutation, isPending: isEditPending } = useMutation({
        mutationFn: editContact,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["contacts"]
            })
        },
    })

    const { mutateAsync: deleteContactsMutation, isPending: isDeletePending } = useMutation({
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
            await editContactMutation(contact)
        } else {
            await addContactsMutation(contact)
        }
    }, [clickedContact])

    const handleDeleteClick = useCallback(async () => {
        await deleteContactsMutation(
            clickedContact.id ? [clickedContact.id] : selectedContacts.map(id => Number(id))
        )
        setSelectedContacts(prev => selectedContacts.filter(id => !prev.includes(id)))
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
    }, [contactsModel?.total])

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
                        rowSelectionModel={selectedContacts}
                        loading={isLoading}
                        slots={{
                            pagination: CustomRowCount
                        }}
                        onPaginationModelChange={setPaginationModel}
                        onFilterModelChange={setFilterModel}
                        onSortModelChange={setSortModel}
                        filterDebounceMs={250}
                        keepNonExistentRowsSelected
                    />
                </ListItem>
            </List>
            <DeleteDialog
                open={modals.delete}
                handleClose={closeModals}
                handleDelete={handleDeleteClick}
                multiple={clickedContact.id ? false : selectedContacts.length > 1}
                isLoading={isDeletePending || isLoading}
            />
            <FormDialog
                open={modals.form}
                handleClose={closeModals}
                handleDoneForm={handleDoneForm}
                contact={clickedContact}
                isLoading={isAddPending || isEditPending || isLoading}
            />
        </>
    )
}





