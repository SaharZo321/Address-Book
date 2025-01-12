import { useMemo, useRef } from "react";
import { useContactAPIContext } from "../Contexts/ContactAPIContext";

export function useContactTableData() {
    const { contactsModel } = useContactAPIContext()

    const contacts = contactsModel?.contacts ? contactsModel.contacts : []

    const rowCountRef = useRef(0);

    const totalRows = useMemo(() => {
        if (contactsModel?.totalRows) {
            rowCountRef.current = contactsModel.totalRows
        }
        return rowCountRef.current;
    }, [contactsModel?.totalRows])

    return { contacts, totalRows }
}