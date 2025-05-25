from pydantic import BaseModel


class Event(BaseModel):
    title: str


class Response(BaseModel):
    events: list[Event]
