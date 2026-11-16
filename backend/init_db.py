from database import Base, engine
from models import Figure

Base.metadata.create_all(bind=engine)

print("Database initialized successfully!")