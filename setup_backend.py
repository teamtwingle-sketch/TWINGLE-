
import os
import sys
from pathlib import Path

# Create a virtual environment
def create_venv():
    os.system("python3 -m venv venv")
    print("Virtual environment created.")

# specific for mac/linux
def install_requirements():
    pip_cmd = "./venv/bin/pip"
    requirements = [
        "django",
        "djangorestframework",
        "django-cors-headers",
        "pillow",
        "djangorestframework-simplejwt",
        "python-dateutil"
    ]
    os.system(f"{pip_cmd} install {' '.join(requirements)}")
    print("Backend requirements installed.")

def create_django_project():
    python_cmd = "./venv/bin/python"
    
    # Initialize Project
    if not os.path.exists("backend/dating_core"):
        os.system(f"cd backend && ../{python_cmd} -m django startproject dating_core .")
        
    # Create Apps
    apps = ["users", "profiles", "matches", "chat", "payments", "reports"]
    for app in apps:
        if not os.path.exists(f"backend/{app}"):
            os.system(f"cd backend && ../{python_cmd} -m django startapp {app}")

if __name__ == "__main__":
    create_venv()
    install_requirements()
    create_django_project()
