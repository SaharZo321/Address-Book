import { ChangeEventHandler, useCallback, useEffect, useMemo, useState } from "react"
import { Contact } from "../types"
import { emailRegex, phonePattern, phoneRegex, wordRegex } from "../constants";
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, List, ListItem, TextField, Typography } from "@mui/material"
import { faker } from '@faker-js/faker';
import _ from "lodash";

const emptyContact: Contact = { firstName: "", lastName: "", email: "", phone: "" }

export function FormDialog(props: {
    open: boolean,
    initialContact?: Contact,
    handleClose: () => void,
    handleDoneForm: (contact: Contact) => void,
    isPending?: boolean,
    formError?: string,
}) {
    const initialContact = useMemo(() => {
        return props.initialContact ? props.initialContact : emptyContact
    }, [props.initialContact])
    const [contact, setContact] = useState<Contact>(initialContact)

    const generate = useCallback(() => {
        const firstName = faker.person.firstName()
        const lastName = faker.person.lastName()
        setContact({
            firstName,
            lastName,
            email: faker.internet.email({
                firstName,
                lastName
            }),
            phone: faker.helpers.fromRegExp(phonePattern),
        })
    }, [contact])

    const isContactValid = useMemo(() => {
        return (
            contact.firstName.match(wordRegex) &&
            contact.lastName.match(wordRegex) &&
            contact.email.match(emailRegex) &&
            contact.phone.match(phoneRegex) &&
            !_.isEqual(contact, initialContact)
        )
    }, [contact, initialContact])

    useEffect(() => {
        _.delay(setContact, props.open ? 0 : 200, initialContact)
    }, [props.open])

    const str = useMemo(() => (props.initialContact ? "Edit" : "Create"), [props.initialContact])

    const onFormChange: ChangeEventHandler<HTMLInputElement> = useCallback(event => {
        const value = event.target.value
        const id = event.target.name
        setContact(prev => ({
            ...prev,
            [id]: value
        }))
    }, [])

    const onSubmit = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        props.handleDoneForm(contact)
    }, [contact, props.handleDoneForm])

    return (
        <Dialog
            open={props.open}
            onClose={props.handleClose}
            maxWidth="xs"
        >
            <DialogTitle align="center">
                {`${str} Contact`}
            </DialogTitle>
            <DialogContent>
                <List>
                    {
                        props.formError &&
                        <ListItem>
                            <Typography color="error" textAlign="center" width="100%">
                                {props.formError}
                            </Typography>
                        </ListItem>
                    }
                    <ListItem>
                        <TextField
                            error={!contact.firstName.match(wordRegex)}
                            required
                            id="contact-form first-name"
                            name="firstName"
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
                            name="lastName"
                            id="contact-form last-name"
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
                            id="contact-form email"
                            name="email"
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
                            name="phone"
                            id="contact-form phone"
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
                <Button variant="contained" disabled={!isContactValid} onClick={onSubmit}>{props.isPending ? <CircularProgress size={20} /> : str}</Button>
            </DialogActions>
        </Dialog>
    )
}

export function DeleteDialog(props: {
    open: boolean,
    multiple?: boolean,
    handleClose: () => void,
    handleDelete: () => void,
    isPending?: boolean
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
                <Button variant="contained" color="error" onClick={props.handleDelete}>{props.isPending ? <CircularProgress size={20} /> : "Delete"}</Button>
            </DialogActions>
        </Dialog>
    )
}