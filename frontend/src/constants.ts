export const url = "http://localhost:8000/"
export const urlSingle = url + "contact/"
export const urlMultiple = url + "contacts/"

export const phoneRegex = /^[+][1-9][\d]{0,2}-[\d]{3}-[\d]{3}-[\d]{3}$/
export const phonePattern = "[+][1-9][0-9]{0,2}-[0-9]{3}-[0-9]{3}-[0-9]{3}"
export const emailRegex = /^[\w.-]+@\w+([-.]\w+)*(\w'*[.])[a-zA-Z]{2,6}$/
export const wordRegex = /^[A-Za-z]+[-']{0,1}[A-Za-z]+$/