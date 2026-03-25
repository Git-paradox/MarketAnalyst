from __future__ import annotations

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/snapshots", tags=["snapshots"])


@router.post("/", response_model=schemas.SnapshotRead, status_code=status.HTTP_201_CREATED)
def create_snapshot(payload: schemas.SnapshotCreate, db: Session = Depends(get_db)):
    return crud.create_snapshot(db, payload)


@router.get("/", response_model=list[schemas.SnapshotRead])
def list_snapshots(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.list_snapshots(db, skip=skip, limit=limit)


@router.get("/{snapshot_id}", response_model=schemas.SnapshotRead)
def get_snapshot(snapshot_id: int, db: Session = Depends(get_db)):
    return crud.get_snapshot(db, snapshot_id)


@router.put("/{snapshot_id}", response_model=schemas.SnapshotRead)
def update_snapshot(snapshot_id: int, payload: schemas.SnapshotUpdate, db: Session = Depends(get_db)):
    return crud.update_snapshot(db, snapshot_id, payload)


@router.delete("/{snapshot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_snapshot(snapshot_id: int, db: Session = Depends(get_db)):
    crud.delete_snapshot(db, snapshot_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

