from alchemical.aio import Alchemical

db = Alchemical("sqlite:///instance//addressbook.db")

word_pattern = r"^[A-Za-z]+[-']{0,1}[A-Za-z]+$"
phone_pattern = r"^[+][1-9][\d]{0,2}-[\d]{3}-[\d]{3}-[\d]{3}$"

SINGLE = "/contact/"
MULTIPLE = "/contacts/"