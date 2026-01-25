from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

class Category(BaseModel):
    id: int