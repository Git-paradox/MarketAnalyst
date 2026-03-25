from __future__ import annotations

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/signals", tags=["signals"])


@router.post("/", response_model=schemas.SignalRead, status_code=status.HTTP_201_CREATED)
def create_signal(payload: schemas.SignalCreate, db: Session = Depends(get_db)):
    return crud.create_signal(db, payload)


@router.get("/", response_model=list[schemas.SignalRead])
def list_signals(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.list_signals(db, skip=skip, limit=limit)


@router.get("/{signal_id}", response_model=schemas.SignalRead)
def get_signal(signal_id: int, db: Session = Depends(get_db)):
    return crud.get_signal(db, signal_id)


@router.put("/{signal_id}", response_model=schemas.SignalRead)
def update_signal(signal_id: int, payload: schemas.SignalUpdate, db: Session = Depends(get_db)):
    return crud.update_signal(db, signal_id, payload)


@router.delete("/{signal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_signal(signal_id: int, db: Session = Depends(get_db)):
    crud.delete_signal(db, signal_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

