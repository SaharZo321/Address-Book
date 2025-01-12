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


declare module '@mui/x-data-grid' {
    interface PaginationPropsOverrides {
        onDeleteSelection: () => void,
        onAdd: () => void,
        isSelected: boolean,
    }
}

function CustomPaginationComponent(props: (GridSlotProps["pagination"] & {
    onDeleteSelection: () => void,
    onAdd: () => void,
    isSelected: boolean,
})) {

    const { onAdd, onDeleteSelection, isSelected, ...paginationProps } = props;
    return (
        <>
            {
                isSelected ?
                    <Button
                        variant="contained"
                        color="error"
                        onClick={onDeleteSelection}
                        sx={{
                            marginRight: "auto",
                        }}
                    >
                        <Delete />
                    </Button> :
                    <Button
                        variant="contained"
                        onClick={onAdd}
                        sx={{
                            marginRight: "auto",
                            marginLeft: "16px",
                        }}
                    >
                        <Add />
                    </Button>
            }
            <GridPagination {...paginationProps} />
        </>
    )
}

type TableProps = {
    sx?: SxProps
    initialPaginationModel: GridPaginationModel
    contactsData: ContactsModel,
    rowSelection: {
        set: (newState: GridRowSelectionModel) => void,
        state: GridRowSelectionModel,
    }
    isFetching: boolean,
    onDeleteClick: (contact: ContactWithID) => void
    onEditClick: (contact: ContactWithID) => void
    onAddClick: () => void
    setPagination: (model: GridPaginationModel) => void
    setFilter: (model: GridFilterModel) => void
    setSort: (model: GridSortModel) => void
    onDeleteSelectionClick: () => void
}


export default function Table(props: TableProps) {

    const columns: GridColDef[] = useMemo(() => [
        {
            field: "actions", type: "actions", getActions: (grid: GridRowParams<ContactWithID>) => (
                [
                    <GridActionsCellItem
                        icon={<Delete />}
                        label="Delete"
                        onClick={() => props.onDeleteClick(grid.row)}
                    />,
                    <GridActionsCellItem
                        icon={<Edit />}
                        label="Edit"
                        onClick={() => props.onEditClick(grid.row)}
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

    return (
        <DataGrid
            rows={props.contactsData.contacts}
            rowCount={props.contactsData.total}
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
            onRowSelectionModelChange={props.rowSelection.set}
            rowSelectionModel={props.rowSelection.state}
            loading={props.isFetching}
            slots={{
                pagination: CustomPaginationComponent,
            }}
            slotProps={{
                loadingOverlay: {
                    variant: 'circular-progress',
                    noRowsVariant: 'skeleton',
                },
                pagination: {
                    onAdd: props.onAddClick,
                    onDeleteSelection: props.onDeleteSelectionClick,
                    isSelected: props.rowSelection.state.length !== 0
                }
            }}
            onPaginationModelChange={props.setPagination}
            onFilterModelChange={props.setFilter}
            onSortModelChange={props.setSort}
            filterDebounceMs={250}
            keepNonExistentRowsSelected
        />
    )
}





