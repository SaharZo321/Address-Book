import { useEffect, useState, useCallback } from 'react'
import { urlCreate, urlDelete, urlGet, urlUpdate } from './constants'
import { ContactModel, ValidationError } from './types'
import ContactTable from './Components/ContactTable'
import { Box } from '@mui/material'

const send = async (url: string, type: "PATCH" | "DELETE" | "POST" | "GET", body: any) => {
    const options = {
        method: type,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    }
    
    return await fetch(url, options)
}

function App() {

    const [contacts, setContacts] = useState<ContactModel[]>([])

    const [isLoading, setIsLoading] = useState(false)

    const fetchContacts = useCallback(async () => {
        setIsLoading(true)
        try {
            const response = await fetch(urlGet)
            const data: ContactModel[] = await response.json()
            setContacts(data)
        }
        catch(e) {
            alert(e)
        }
        setIsLoading(false)

    }, [])

    useEffect(() => {
        fetchContacts()
    }, [])

    

    const onEditContact = useCallback(async (contact: ContactModel, cb?: () => void) => {
        const url = urlUpdate + `${contact.id}`
        
        const response = await send(url, "PATCH", contact)
        
        if (response.status !== 201 && response.status !== 200) {
            const data: ValidationError = await response.json()
            alert(data.detail)
            return
        }

        cb?.()
        fetchContacts()

    }, [])

    const onCreateContact = useCallback(async (contact: ContactModel, cb?: () => void) => {
        
        const response = await send(urlCreate, "POST", contact)

        if (response.status !== 201 && response.status !== 200) {
            const data: ValidationError = await response.json()
            alert(data.detail)
            return
        }

        cb?.()
        fetchContacts()

    }, [])

    const onDeleteContact = useCallback(async (ids: number[], cb?: () => void) => {

        const response = await send(urlDelete, "DELETE", ids)
        
        if (response.status !== 201 && response.status !== 200) {
            const data: ValidationError = await response.json()
            alert(data.detail)
            return
        }

        cb?.()
        fetchContacts()

    }, [])

    return (
        <>
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
                    updateTable={fetchContacts}
                    contacts={contacts}
                    editCallback={onEditContact}
                    deleteCallback={onDeleteContact}
                    createCallback={onCreateContact}
                    sx={{
                        maxWidth: "90vw",
                        minHeight: "70vh"
                    }}
                    isLoading={isLoading}
                />
            </Box>
        </>
    )
}

export default App
