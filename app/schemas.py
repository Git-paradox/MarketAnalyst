from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


# Snapshots
class SnapshotBase(BaseModel):
    url: str
    timestamp: datetime
    text: str
    embedding: list[float]


class SnapshotCreate(SnapshotBase):
    pass


class SnapshotUpdate(BaseModel):
    url: Optional[str] = None
    timestamp: Optional[datetime] = None
    text: Optional[str] = None
    embedding: Optional[list[float]] = None


class SnapshotRead(SnapshotBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# Insights
class InsightBase(BaseModel):
    signal: str
    source: str
    confidence: float


class InsightCreate(InsightBase):
    pass


class InsightUpdate(BaseModel):
    signal: Optional[str] = None
    source: Optional[str] = None
    confidence: Optional[float] = None


class InsightRead(InsightBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# Signals
class SignalBase(BaseModel):
    type: str
    company: str
    weight: float


class SignalCreate(SignalBase):
    pass


class SignalUpdate(BaseModel):
    type: Optional[str] = None
    company: Optional[str] = None
    weight: Optional[float] = None


class SignalRead(SignalBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


# Jobs
class JobBase(BaseModel):
    title: str
    company: str
    intent: str


class JobCreate(JobBase):
    pass


class JobUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    intent: Optional[str] = None


class JobRead(JobBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

