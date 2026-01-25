from typing import Optional,List
from pydantic import BaseModel,Field,field_validator
from datetime import datetime
from .base import BaseSchema

class User(BaseSchema):
    id: int