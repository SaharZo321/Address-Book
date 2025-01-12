import { GridPaginationModel } from "@mui/x-data-grid"
import ContactAPIProvider from "../../Contexts/ContactAPIContext"
import ContactTable from "./ContactTable"
import { Box } from "@mui/material"

const initialPaginationModel: GridPaginationModel = { page: 0, pageSize: 10 }

export default function ContactTablePage() {
    return (
        <ContactAPIProvider initialOptions={{
            pagination: initialPaginationModel
        }}>
            <Box sx={{
                width: "100vw",
                paddingTop: "10vh",
                position: "absolute",
                top: 0,
                left: 0,
                display: 'flex',
                justifyContent: "center",
                alignItems: "center",
            }}>

                <ContactTable
                    initialPagination={initialPaginationModel} 
                    sx={{
                        maxWidth: "90vw",
                        height: "70vh"
                    }}
                />
            </Box>
        </ContactAPIProvider>
    )
}