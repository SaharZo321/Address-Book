import ContactTable from './Components/ContactTable'
import { Box } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
    return (
        <QueryClientProvider client={queryClient}>
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
        </QueryClientProvider>
    )
}

export default App
