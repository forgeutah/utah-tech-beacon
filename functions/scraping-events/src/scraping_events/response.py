from typing import Annotated, Literal

from pydantic import BaseModel, Field


class Event(BaseModel):
    title: str


class ResponseSuccess(BaseModel):
    type: Literal["success"] = "success"
    events: list[Event]


class ResponseError(BaseModel):
    type: Literal["error"] = "error"
    error_class: str
    detail: str


type Response = Annotated[ResponseSuccess | ResponseError, Field(discriminator="type")]
