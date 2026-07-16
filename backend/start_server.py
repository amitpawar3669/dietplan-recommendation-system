#!/usr/bin/env python3
"""
Quick server startup script with proper path handling.
"""
import sys
import os

# Set the backend directory in Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Now import and run
from app import create_app

if __name__ == '__main__':
    os.environ.setdefault('FLASK_ENV', 'development')
    os.environ.setdefault('DEBUG', 'True')
    
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    
    print("\n" + "="*60)
    print("✓ Diet Plan Recommendation System Online!")
    print("="*60)
    print(f"\n  Server: http://localhost:{port}")
    print(f"  Docs: http://localhost:{port}/api/docs")
    print(f"  Health: http://localhost:{port}/api/health")
    print("\n  Press CTRL+C to stop\n")
    print("="*60 + "\n")
    
    try:
        app.run(host='0.0.0.0', port=port, debug=True)
    except KeyboardInterrupt:
        print("\n\nServer stopped.")
        sys.exit(0)
