from typing import Literal

from pydantic import BaseModel


CheckName = Literal["quality", "weighing", "procurement", "payment"]
CheckStatus = Literal["Pending", "In Progress", "Passed", "Failed"]


class QueueCheckUpdate(BaseModel):
    check: CheckName
    status: CheckStatus
