from typing import List, Optional

from pydantic import BaseModel, Field

class UploadResponse(BaseModel):
    meeting_id: str
    status: str
    message: str


class ActionItemResult(BaseModel):
    assignee: str
    task: str
    deadline: Optional[str] = None
    quote: str


class DecisionResult(BaseModel):
    decision_text: str
    reasoning_context: str


class InsightsPayload(BaseModel):
    action_items: List[ActionItemResult]
    decisions: List[DecisionResult]


class MeetingInsightsResponse(BaseModel):
    meeting_id: str
    status: str
    message: str
    insights: InsightsPayload

class ActionItemSchema(BaseModel):
    assignee: str = Field(description="The person responsible for the task")
    task: str = Field(description="The exact description of the task")
    deadline: Optional[str] = Field(description="The deadline for the task, if mentioned")
    quote_source: str = Field(description="The exact chunk from the transcript confirming this task")

class DecisionSchema(BaseModel):
    decision_text: str = Field(description="The finalized decision made")
    reasoning_context: str = Field(description="The context or reasoning behind the decision")
