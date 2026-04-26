from app.db.session import SessionLocal
from app.enums.role_status import RoleStatus
from app.models.role import Role
from app.models.user import User
from app.core.security import hash_password
from configs.settings import settings  # Import your settings


def seed():
    db = SessionLocal()
    try:
        # Seed Roles
        roles_to_create = ["ADMIN", "USER"]
        role_objects = {}

        for role_name in roles_to_create:
            role = db.query(Role).filter_by(name=role_name).first()
            if not role:
                role = Role(name=role_name, status=RoleStatus.ACTIVE)
                db.add(role)
                db.flush()
            role_objects[role_name] = role

        # Seed Admin User from Environment Variables
        admin_email = settings.admin_email
        admin_password = settings.admin_password
        admin_name = settings.admin_name

        existing_admin = db.query(User).filter_by(email=admin_email).first()

        if not existing_admin:
            admin = User(
                name=admin_name,
                email=admin_email,
                password_hash=hash_password(admin_password),
                status="ACTIVE",
                role_id=role_objects["ADMIN"].id
            )
            db.add(admin)

        db.commit()
        print("Database seeded successfully!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed()