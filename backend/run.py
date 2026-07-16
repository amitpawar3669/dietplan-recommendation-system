#!/usr/bin/env python
"""
Development server runner script.
Run this to start the Flask development server with auto-reload.
"""

import os
import sys
from app import create_app

def main():
    """Run the development server"""
    
    # Set development environment
    os.environ.setdefault('FLASK_ENV', 'development')
    os.environ.setdefault('DEBUG', 'True')
    
    app = create_app()
    
    # Get configuration
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    debug = os.environ.get('DEBUG', 'True').lower() == 'true'
    
    print("\n" + "="*60)
    print("Diet Plan Recommendation System - Development Server")
    print("="*60)
    print(f"\n✓ Starting server on http://{host}:{port}")
    print(f"  Debug mode: {debug}")
    print(f"  Environment: development")
    print("\n  Available endpoints:")
    print(f"    - Health: http://{host}:{port}/api/health")
    print(f"    - Docs: http://{host}:{port}/api/docs")
    print(f"    - Home: http://{host}:{port}/")
    print("\n  Press CTRL+C to stop\n")
    print("="*60 + "\n")
    
    app.run(host=host, port=port, debug=debug)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nServer stopped.")
        sys.exit(0)
