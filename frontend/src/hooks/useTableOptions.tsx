import { GridFilterModel, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import { useContactAPIContext } from "../Contexts/ContactAPIContext";
import _ from "lodash";
import { useCallback } from "react";

type UseTableOptions = {
    setFilter: (filterModel: GridFilterModel) => void
    setSort: (filterModel: GridSortModel) => void
    setPagination: (filterModel: GridPaginationModel) => void
}

/**
 * Hook to get a setting function for the server filter options.
 * @returns
 */
export function useTableOptions(): UseTableOptions {
    const { setOptions } = useContactAPIContext()

    const setFilter = useCallback((filterModel: GridFilterModel) => {
        if (!filterModel.items[0] || !filterModel.items[0].value) {
            setOptions(prev => ({
                ...prev,
                filter: undefined
            }))
            return
        }
        setOptions(prev => ({
            ...prev,
            filter: {
                field: _.snakeCase(filterModel.items[0].field),
                operator: (
                    filterModel.items[0].operator.match(/[\w]+/) ?
                        _.snakeCase(filterModel.items[0].operator) :
                        filterModel.items[0].operator
                ),
                values: (
                    typeof filterModel.items[0].value == "string" ?
                        [filterModel.items[0].value] :
                        filterModel.items[0].value
                )
            }
        }))
    }, [])

    const setSort = useCallback((sortModel: GridSortModel) => {
        if (!sortModel[0]) {
            setOptions(prev => ({
                ...prev,
                sort: undefined
            }))
            return
        }
        setOptions(prev => ({
            ...prev,
            sort: {
                field: _.snakeCase(sortModel[0].field),
                order: sortModel[0].sort
            }
        }))
    }, [])

    const setPagination = useCallback((paginationModel: GridPaginationModel) => {
        setOptions(prev => ({
            ...prev,
            pagination: paginationModel
        }))
    }, [])

    return { setFilter, setSort, setPagination }
}