import { useMemo, useRef } from "react";
import { useContactAPIContext } from "../Contexts/ContactAPIContext";

export function useContactTableData() {
    const { contactsModel } = useContactAPIContext()

    const contacts = contactsModel?.contacts

    const rowCountRef = useRef(0);

    const totalRows = useMemo(() => {
        if (contactsModel?.total) {
            rowCountRef.current = contactsModel.total
        }
        return rowCountRef.current;
    }, [contactsModel?.total])

    return { contacts, totalRows }
}