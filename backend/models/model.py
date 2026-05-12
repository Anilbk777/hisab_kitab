from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, Date, Numeric, DateTime, Enum as SQLEnum
from datetime import datetime
import enum
from typing import List
from backend.core.database import Base


class KhataType(str, enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_name: Mapped[str] = mapped_column(String(100), nullable=False)
    number: Mapped[str] = mapped_column(
        String(10), unique=True, index=True, nullable=False
    )
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationship
    khatas: Mapped[List["Khata"]] = relationship(
        "Khata", back_populates="user", cascade="all, delete-orphan"
    )


class Khata(Base):
    __tablename__ = "khatas"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    khata_name: Mapped[str] = mapped_column(String(100), nullable=False)
    khata_type: Mapped[KhataType] = mapped_column(SQLEnum(KhataType), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="khatas")
    entries: Mapped[List["Entry"]] = relationship(
        "Entry", back_populates="khata", cascade="all, delete-orphan"
    )


class Entry(Base):
    __tablename__ = "entries"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    khata_id: Mapped[int] = mapped_column(
        ForeignKey("khatas.id", ondelete="CASCADE"), nullable=False,
    )

    entry_date: Mapped[datetime.date] = mapped_column(Date, nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationship
    khata: Mapped["Khata"] = relationship("Khata", back_populates="entries")
