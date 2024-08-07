export const url = "http://localhost:8000/"
export const urlGet = url + "contacts/"
export const urlDelete = url + "delete/"
export const urlUpdate = url + "update/"
export const urlCreate = url + "create/"

export const phoneRegex = /^[+][1-9][0-9]{0,2}-[0-9]{3}-[0-9]{3}-[0-9]{3}$/
export const phonePattern = "[+][1-9][0-9]{0,2}-[0-9]{3}-[0-9]{3}-[0-9]{3}"
export const emailRegex = /^[\w.-]+@\w+([-.]\w+)*(\w'*[.])[a-zA-Z]{2,6}$/
export const wordRegex = /^[A-Za-z]+[-]{0,1}[A-Za-z]+$/