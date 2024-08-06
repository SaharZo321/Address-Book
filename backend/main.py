from flask import jsonify, request
from sqlalchemy.exc import IntegrityError
from models import Contact
from config import db, app, get_ep, create_ep, delete_ep, update_ep


def jsonify_message(message):
    return jsonify({"message": str(message)})


@app.route(get_ep, methods=["GET"])
def get_contacts():
    contacts: list[Contact] = Contact.query.all()
    json_contacts = [contact.to_json() for contact in contacts]
    return jsonify({"contacts": json_contacts})


@app.route(create_ep, methods=["POST"])
def create_contact():
    contact = {
        "first_name": request.json.get("firstName"),
        "last_name": request.json.get("lastName"),
        "phone": request.json.get("phone"),
        "email": request.json.get("email"),
    }

    if any(value is None for value in contact.values()):
        return (
            jsonify_message("Mandatory field was not included"),
            400,
        )

    new_contact = Contact(**contact)

    try:
        db.session.add(new_contact)
        db.session.commit()
    except IntegrityError as e:
        print(e)
        return (
            jsonify_message("A user with these email address or phone number already exists."),
            400,
        )
    except Exception as e:
        print(e)
        return (
            jsonify_message(e),
            400,
        )

    return (
        jsonify_message(
            f"User {new_contact.first_name} {new_contact.last_name} created."
        ),
        201,
    )


@app.route(f"{update_ep}/<int:user_id>", methods=["PATCH"])
def update_contact(user_id: int):
    contact = db.session.get(entity=Contact, ident=user_id)

    if not contact:
        return (
            jsonify_message("User not found"),
            404,
        )

    data = request.json
    contact.first_name = data.get("firstName", contact.first_name)
    contact.last_name = data.get("lastName", contact.last_name)
    contact.phone = data.get("phone", contact.phone)
    contact.email = data.get("email", contact.email)

    db.session.commit()

    return (
        jsonify_message(f"User {contact.first_name} {contact.last_name} updated."),
        200,
    )


@app.route(delete_ep, methods=["DELETE"])
def delete_contact():

    data = request.json
    ids: list[int] = data.get("ids", [])
    if not ids:
        return (
            jsonify_message(f"No users to delete found"),
            400,
        )
    
    print(ids)
    contacts = list(map(lambda id: db.session.get(entity=Contact, ident=id), ids))
    
    if any(not contact for contact in contacts):
        return (
            jsonify_message(f"Some users were not found"),
            404,
        )
    
    for contact in contacts:
        db.session.delete(contact)

    db.session.commit()

    return (
        jsonify_message(f"Users deleted."),
        200,
    )


if __name__ == "__main__":
    with app.app_context():
        db.create_all()

    app.run(debug=True)
