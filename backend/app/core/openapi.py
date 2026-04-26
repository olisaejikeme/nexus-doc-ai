from fastapi.openapi.utils import get_openapi

from configs.settings import settings

def custom_openapi(app):
    """
    Configures the OpenAPI schema for the FastAPI application.
    """
    def openapi():
        if app.openapi_schema:
            return app.openapi_schema

        # Generate default OpenAPI schema
        openapi_schema = get_openapi(
            title="Nexus AI",
            version="v1",
            description="RAG",
            routes=app.routes,
            servers=[{"url": "/", "description": "Default Server Url"}],
            contact={
                 "name": "Olisa Ejikeme",
                 "email": "olisaejikeme@gmail.com",
                # "url": ""
            },
            license_info={"name": "MIT License", "url": "https://opensource.org/licenses/MIT"},
            terms_of_service="Terms of service",
            tags=[],
        )

        # Ensure 'components' key exists
        if "components" not in openapi_schema:
            openapi_schema["components"] = {}

        # Add custom security definitions
        openapi_schema["components"]["securitySchemes"] = {
            "bearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
                "description": "Jwt auth",
                "in": "header",
            }
        }

        # Apply security globally except for exempt routes
        exempt_paths = ["/api/v1/auth/login", "/api/v1/auth/register"]

        for path, methods in openapi_schema["paths"].items():
            for operation in methods.values():
                if path not in exempt_paths:
                    operation["security"] = [{"bearerAuth": []}]

        app.openapi_schema = openapi_schema
        return app.openapi_schema

    return openapi
