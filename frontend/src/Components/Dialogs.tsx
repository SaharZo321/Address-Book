import { ChangeEventHandler, useCallback, useEffect, useMemo, useState } from "react"
import { ContactModel } from "../types"
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, List, ListItem, TextField } from "@mui/material"

export function FormDialog(props: {
    open: boolean,
    contact: ContactModel,
    handleClose: () => void,
    handleDoneForm: (contact: ContactModel) => void,
}) {

    const [contact, setContact] = useState<ContactModel>(props.contact)

    useEffect(() => {
        setContact(props.contact)
        console.log("refreshed dialog")
    }, [props.contact])

    const str = useMemo(() => (props.contact.id ? "Edit" : "Create"), [props.contact])

    const onFormChange: ChangeEventHandler<HTMLInputElement> = useCallback(event => {
        setContact(prev => ({
            ...prev,
            [event.target.id]: event.target.value
        }))
    }, [])

    return (
        <Dialog
            open={props.open}
            onClose={props.handleClose}
            PaperProps={{
                component: "form",
                onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                    event.preventDefault()
                    props.handleDoneForm(contact)
                },
                autoComplete: "off",
            }}
        >
            <DialogTitle align="center">
                {`${str} Contact`}
            </DialogTitle>
            <DialogContent>
                <List>
                    <ListItem>
                        <TextField
                            autoFocus
                            required
                            id="firstName"
                            label="First name"
                            value={contact.firstName}
                            fullWidth
                            onChange={onFormChange}
                        />
                    </ListItem>
                    <ListItem>
                        <TextField
                            required
                            id="lastName"
                            label="Last name"
                            value={contact.lastName}
                            fullWidth
                            onChange={onFormChange}
                        />
                    </ListItem>
                    <ListItem>
                        <TextField
                            required
                            id="email"
                            label="Email"
                            value={contact.email}
                            type="email"
                            fullWidth
                            onChange={onFormChange}
                        />
                    </ListItem>
                    <ListItem>
                        <TextField
                            required
                            id="phone"
                            label="Phone"
                            value={contact.phone}
                            type="tel"
                            fullWidth
                            onChange={onFormChange}
                        />
                    </ListItem>
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.handleClose}>Cancel</Button>
                <Button variant="contained" type="submit">{str}</Button>
            </DialogActions>
        </Dialog>
    )
}

export function DeleteDialog(props: {
    open: boolean,
    multiple?: boolean,
    handleClose: () => void,
    handleDelete: () => void,
}) {
    return (
        <Dialog
            open={props.open}
            onClose={props.handleClose}
        >
            <DialogTitle>
                {`Are you sure to delete ${props.multiple ? "these entries?" : "this entry?"}`}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {`Once deleted ${props.multiple ? "these entries" : "this entry"} cannot be restored.`}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.handleClose}>Cancel</Button>
                <Button variant="contained" color="error" onClick={props.handleDelete} autoFocus>Delete</Button>
            </DialogActions>
        </Dialog>
    )
}