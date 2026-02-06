
import subprocess
import time
import sys

def start_backend():
    print("Starting Django Backend...")
    return subprocess.Popen(["./venv/bin/python", "backend/manage.py", "runserver", "8000"])

def start_frontend():
    print("Starting Vite Frontend...")
    return subprocess.Popen(["npm", "run", "dev"], cwd="frontend")

import threading

def run_cleanup_schedule():
    # Start after some delay
    time.sleep(60) 
    while True:
        try:
            print("Running scheduled cleanup of inactive users...")
            subprocess.run(["./venv/bin/python", "backend/manage.py", "delete_inactive_users"])
        except Exception as e:
            print(f"Cleanup failed: {e}")
        # Run every 24 hours
        time.sleep(86400)

if __name__ == "__main__":
    # Start cleanup thread
    cleanup_thread = threading.Thread(target=run_cleanup_schedule, daemon=True)
    cleanup_thread.start()

    b = start_backend()
    f = start_frontend()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        b.terminate()
        f.terminate()
        print("\nServers stopped.")
