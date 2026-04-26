from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from http import HTTPStatus

from app.schemas.response_schema import ResponseSchema


async def http_exception_handler(request: Request, exc: HTTPException):
    error = HTTPStatus(exc.status_code).phrase
    return JSONResponse(
        status_code=exc.status_code,
        content=ResponseSchema(
            data=error,
            message=exc.detail,
            status=False,
            status_code=exc.status_code
        ).model_dump()
    )