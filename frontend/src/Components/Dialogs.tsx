import { ChangeEventHandler, useCallback, useEffect, useMemo, useState } from "react"
import { ContactModel } from "../types"
import { emailRegex, phonePattern, phoneRegex, wordRegex } from "../constants";
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, List, ListItem, TextField } from "@mui/material"
import { faker } from '@faker-js/faker';
import _ from "lodash";


export function FormDialog(props: {
    open: boolean,
    contact: ContactModel,
    handleClose: () => void,
    handleDoneForm: (contact: ContactModel) => void,
    isLoading?: boolean
}) {

    const [contact, setContact] = useState<ContactModel>(props.contact)

    const generate = useCallback(() => {
        const firstName = faker.person.firstName()
        const lastName = faker.person.lastName()
        const newContact: ContactModel = {
            id: contact.id,
            first_name: firstName,
            last_name: lastName,
            email: faker.internet.email({
                firstName,
                lastName
            }),
            phone: faker.helpers.fromRegExp(phonePattern),
        }
        setContact(newContact)
    }, [contact])

    const isContactValid = useMemo(() => {
        return (
            contact.first_name.match(wordRegex) &&
            contact.last_name.match(wordRegex) &&
            contact.email.match(emailRegex) &&
            contact.phone.match(phoneRegex) &&
            !_.isEqual(contact, props.contact)
        )
    }, [contact])

    useEffect(() => {
        _.delay(setContact, props.open ? 0 : 200, props.contact)
    }, [props.open])

    const str = useMemo(() => (props.contact.id ? "Edit" : "Create"), [props.contact])

    const onFormChange: ChangeEventHandler<HTMLInputElement> = useCallback(event => {
        let value = event.target.value
        const id = event.target.id
        if (id === "first_name" || id === "last_name")
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
                            error={!contact.first_name.match(wordRegex)}
                            autoFocus
                            required
                            id="first_name"
                            label="First name"
                            value={contact.first_name}
                            fullWidth
                            onChange={onFormChange}
                        />
                    </ListItem>
                    <ListItem>
                        <TextField
                            error={!contact.last_name.match(wordRegex)}
                            required
                            id="last_name"
                            label="Last name"
                            value={contact.last_name}
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
                    <ListItem sx={{ justifyContent: "center", gap: "12px" }}>
                        <Button variant="contained" onClick={generate}>
                            Generate
                        </Button>
                    </ListItem>
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.handleClose}>Cancel</Button>
                <Button variant="contained" disabled={!isContactValid} onClick={onSubmit}>{props.isLoading ? <CircularProgress size={20}/> : str}</Button>
            </DialogActions>
        </Dialog>
    )
}

export function DeleteDialog(props: {
    open: boolean,
    multiple?: boolean,
    handleClose: () => void,
    handleDelete: () => void,
    isLoading?: boolean
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
                <Button variant="contained" color="error" onClick={props.handleDelete} autoFocus>{props.isLoading ? <CircularProgress size={20}/> : "Delete"}</Button>
            </DialogActions>
        </Dialog>
    )
}