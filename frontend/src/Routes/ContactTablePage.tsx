import { Box } from "@mui/material";
import ContactTable from "../Components/ContactTable"
import ContactAPIProvider from "../Contexts/ContactAPIContext";


export default function ContactTablePage() {

    return (
        <ContactAPIProvider>
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
                    sx={{
                        maxWidth: "90vw",
                        height: "70vh"
                    }}
                />
            </Box>
        </ContactAPIProvider>
    )
}