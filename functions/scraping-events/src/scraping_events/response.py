from typing import Annotated, Literal, Self

from pydantic import BaseModel, Field


class Event(BaseModel):
    title: str


class ResponseSuccess(BaseModel):
    type: Literal["success"] = "success"
    events: list[Event]


class ResponseError(BaseModel):
    type: Literal["error"] = "error"
    error_class: str
    detail: str | None

    @classmethod
    def from_exception(cls, exc: Exception) -> Self:
        exc_type = type(exc)
        exc_module = exc_type.__module__
        if exc_module == "builtins":
            class_qualifier = ""
        else:
            class_qualifier = f"{exc_module}."
        return cls(
            error_class=f"{class_qualifier}{exc_type.__name__}",
            detail=str(exc) or None,
        )


type Response = Annotated[ResponseSuccess | ResponseError, Field(discriminator="type")]
