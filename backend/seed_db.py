
from sqlalchemy import select

from database import SessionLocal
from models import Figure

# 两条测试商品数据
sample_figures = [
    {
        "name": "Hatsune Miku - Test Version A",
        "character": "Hatsune Miku",
        "series": "Vocaloid",
        "manufacturer": "Manufacturer A",
        "scale": "1/7",
    },
    {
        "name": "Hatsune Miku - Test Version B",
        "character": "Hatsune Miku",
        "series": "Vocaloid",
        "manufacturer": "Manufacturer B",
        "scale": "Prize Figure",
    },
]

with SessionLocal() as db:
    for item in sample_figures:
        # 检查是否已经存在，避免重复插入
        existing = db.scalar(
            select(Figure).where(
                Figure.name == item["name"]
            )
        )

        if existing is None:
            db.add(Figure(**item))

    # 将数据正式保存到数据库
    db.commit()

print("Sample figures inserted successfully!")
