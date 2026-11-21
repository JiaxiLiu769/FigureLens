
from sqlalchemy import text
from database import engine

with engine.begin() as conn:
    columns = conn.execute(
        text("PRAGMA table_info(figures)")
    ).fetchall()

    column_names = [column[1] for column in columns]

    if "price" not in column_names:
        conn.execute(
            text("ALTER TABLE figures ADD COLUMN price FLOAT")
        )

    conn.execute(
        text("""
            UPDATE figures
            SET price = 129.99
            WHERE name = 'Hatsune Miku - Test Version A'
        """)
    )

    conn.execute(
        text("""
            UPDATE figures
            SET price = 39.99
            WHERE name = 'Hatsune Miku - Test Version B'
        """)
    )

print("Test prices added successfully!")
