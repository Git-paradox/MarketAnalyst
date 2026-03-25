from __future__ import annotations

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..database import get_db

router = APIRouter(prefix="/insights", tags=["insights"])


@router.post("/", response_model=schemas.InsightRead, status_code=status.HTTP_201_CREATED)
def create_insight(payload: schemas.InsightCreate, db: Session = Depends(get_db)):
    return crud.create_insight(db, payload)


@router.get("/", response_model=list[schemas.InsightRead])
def list_insights(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.list_insights(db, skip=skip, limit=limit)


@router.get("/{insight_id}", response_model=schemas.InsightRead)
def get_insight(insight_id: int, db: Session = Depends(get_db)):
    return crud.get_insight(db, insight_id)


@router.put("/{insight_id}", response_model=schemas.InsightRead)
def update_insight(insight_id: int, payload: schemas.InsightUpdate, db: Session = Depends(get_db)):
    return crud.update_insight(db, insight_id, payload)


@router.delete("/{insight_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_insight(insight_id: int, db: Session = Depends(get_db)):
    crud.delete_insight(db, insight_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

