from __future__ import annotations

from typing import Sequence

from fastapi import HTTPException
from sqlalchemy.orm import Session

from . import models, schemas


def _get_or_404(db: Session, model, obj_id: int):
    obj = db.get(model, obj_id)
    if obj is None:
        raise HTTPException(status_code=404, detail=f"{model.__name__} {obj_id} not found")
    return obj


# Snapshots
def create_snapshot(db: Session, payload: schemas.SnapshotCreate) -> models.Snapshot:
    obj = models.Snapshot(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def list_snapshots(db: Session, skip: int = 0, limit: int = 100) -> Sequence[models.Snapshot]:
    return db.query(models.Snapshot).offset(skip).limit(limit).all()


def get_snapshot(db: Session, snapshot_id: int) -> models.Snapshot:
    return _get_or_404(db, models.Snapshot, snapshot_id)


def update_snapshot(db: Session, snapshot_id: int, payload: schemas.SnapshotUpdate) -> models.Snapshot:
    obj = _get_or_404(db, models.Snapshot, snapshot_id)
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(obj, k, v)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def delete_snapshot(db: Session, snapshot_id: int) -> None:
    obj = _get_or_404(db, models.Snapshot, snapshot_id)
    db.delete(obj)
    db.commit()


# Insights
def create_insight(db: Session, payload: schemas.InsightCreate) -> models.Insight:
    obj = models.Insight(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def list_insights(db: Session, skip: int = 0, limit: int = 100) -> Sequence[models.Insight]:
    return db.query(models.Insight).offset(skip).limit(limit).all()


def get_insight(db: Session, insight_id: int) -> models.Insight:
    return _get_or_404(db, models.Insight, insight_id)


def update_insight(db: Session, insight_id: int, payload: schemas.InsightUpdate) -> models.Insight:
    obj = _get_or_404(db, models.Insight, insight_id)
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(obj, k, v)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def delete_insight(db: Session, insight_id: int) -> None:
    obj = _get_or_404(db, models.Insight, insight_id)
    db.delete(obj)
    db.commit()


# Signals
def create_signal(db: Session, payload: schemas.SignalCreate) -> models.Signal:
    obj = models.Signal(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def list_signals(db: Session, skip: int = 0, limit: int = 100) -> Sequence[models.Signal]:
    return db.query(models.Signal).offset(skip).limit(limit).all()


def get_signal(db: Session, signal_id: int) -> models.Signal:
    return _get_or_404(db, models.Signal, signal_id)


def update_signal(db: Session, signal_id: int, payload: schemas.SignalUpdate) -> models.Signal:
    obj = _get_or_404(db, models.Signal, signal_id)
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(obj, k, v)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def delete_signal(db: Session, signal_id: int) -> None:
    obj = _get_or_404(db, models.Signal, signal_id)
    db.delete(obj)
    db.commit()


# Jobs
def create_job(db: Session, payload: schemas.JobCreate) -> models.Job:
    obj = models.Job(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def list_jobs(db: Session, skip: int = 0, limit: int = 100) -> Sequence[models.Job]:
    return db.query(models.Job).offset(skip).limit(limit).all()


def get_job(db: Session, job_id: int) -> models.Job:
    return _get_or_404(db, models.Job, job_id)


def update_job(db: Session, job_id: int, payload: schemas.JobUpdate) -> models.Job:
    obj = _get_or_404(db, models.Job, job_id)
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(obj, k, v)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def delete_job(db: Session, job_id: int) -> None:
    obj = _get_or_404(db, models.Job, job_id)
    db.delete(obj)
    db.commit()

