import { ChangeEventHandler, useCallback, useEffect, useMemo, useState } from "react"
import { ContactModel } from "../types"
import { emailRegex, phonePattern, phoneRegex, wordRegex } from "../constants";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, List, ListItem, TextField } from "@mui/material"
import { faker } from '@faker-js/faker';

export function FormDialog(props: {
    open: boolean,
    contact: ContactModel,
    handleClose: () => void,
    handleDoneForm: (contact: ContactModel) => void,
}) {

    const [contact, setContact] = useState<ContactModel>(props.contact)

    const generate = useCallback(() => {
        const firstName = faker.person.firstName()
        const lastName = faker.person.lastName()
        const contact = {
            id: 0,
            firstName: firstName,
            lastName: lastName,
            email: faker.internet.email({
                firstName,
                lastName
            }),
            phone: faker.helpers.fromRegExp(phonePattern),
        }
        setContact(contact)
    }, [])

    const isContactValid = useMemo(() => {
        return (
            contact.firstName.match(wordRegex) &&
            contact.lastName.match(wordRegex) &&
            contact.email.match(emailRegex) &&
            contact.phone.match(phoneRegex)
        )
    } ,[contact])

    useEffect(() => {
        setContact(props.contact)
        console.log("refreshed dialog")
    }, [props.contact])

    const str = useMemo(() => (props.contact.id ? "Edit" : "Create"), [props.contact])

    const onFormChange: ChangeEventHandler<HTMLInputElement> = useCallback(event => {
        let value = event.target.value
        const id = event.target.id
        if (id === "firstName" || id ==="lastName")
            value = value.charAt(0).toUpperCase() + value.toLowerCase().slice(1)
        setContact(prev => ({
            ...prev,
            [id]: value
        }))
    }, [])

    const onSubmit = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        props.handleDoneForm(contact)
    }, [contact])

    return (
        <Dialog
            open={props.open}
            onClose={props.handleClose}
        >
            <DialogTitle align="center">
                {`${str} Contact`}
            </DialogTitle>
            <DialogContent>
                <List>
                    <ListItem>
                        <TextField
                            error={!contact.firstName.match(wordRegex)}
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
                            error={!contact.lastName.match(wordRegex)}
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
                            error={!contact.email.match(emailRegex)}
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
                            error={!contact.phone.match(phoneRegex)}
                            required
                            id="phone"
                            label="Phone"
                            value={contact.phone}
                            type="tel"
                            fullWidth
                            onChange={onFormChange}
                        />
                    </ListItem>
                    <ListItem sx={{justifyContent: "center"}}>
                        <Button variant="contained" onClick={generate}>
                            Generate
                        </Button>
                    </ListItem>
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.handleClose}>Cancel</Button>
                <Button variant="contained" disabled={!isContactValid} onClick={onSubmit}>{str}</Button>
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