import os
from app import app  # Importa o aplicativo do app.py

# Se você precisar definir variáveis de ambiente:
# os.environ.setdefault('FLASK_ENV', 'production')

# Define a aplicação WSGI
application = app

if __name__ == "__main__":
   application.run()
