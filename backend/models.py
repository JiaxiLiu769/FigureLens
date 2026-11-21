
from sqlalchemy import String, Integer, ForeignKey, Float
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Figure(Base):
    __tablename__ = "figures"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    name: Mapped[str] = mapped_column(
        String(200)
    )

    character: Mapped[str] = mapped_column(
        String(100)
    )

    series: Mapped[str] = mapped_column(
        String(100)
    )

    manufacturer: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    scale: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    price: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )