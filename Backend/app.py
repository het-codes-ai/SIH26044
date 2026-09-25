import os
from pathlib import Path
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from config import Config
from models import init_db

# Import 4 active blueprints (Auth + 3 Stakeholders: Student, Institute, Academician)
from blueprints.auth_routes import auth_bp
from blueprints.student_routes import student_bp
from blueprints.academician_routes import academician_bp
from blueprints.institute_routes import institute_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, supports_credentials=True, origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://localhost:5174",
        "http://192.168.29.194:5173"
    ])

    # Initialize the SQLite tables and ensure default seed data exists
    init_db()
    try:
        from seed_data import seed
        seed()
    except Exception as e:
        print(f"[Seed Warning] Auto-seeding skipped: {e}")

    # Register the 3 educational stakeholder blueprints plus auth
    app.register_blueprint(auth_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(academician_bp)
    app.register_blueprint(institute_bp)

    # Serve React frontend build in production
    frontend_dist = Path(__file__).resolve().parent.parent / "Frontend" / "dist"

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        if path != "" and frontend_dist.exists() and (frontend_dist / path).exists():
            return send_from_directory(str(frontend_dist), path)
        elif frontend_dist.exists() and (frontend_dist / "index.html").exists():
            return send_from_directory(str(frontend_dist), "index.html")
        else:
            return jsonify({
                'name': 'VidyaSarthi Educational Ecosystem API',
                'status': 'online',
                'portals': ['Student', 'Institute', 'Academician'],
                'endpoints': {
                    'health': '/api/health',
                    'auth': '/api/auth',
                    'student': '/api/student',
                    'academician': '/api/academician',
                    'institute': '/api/institute'
                }
            }), 200

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'message': 'VidyaSarthi Full-Stack Educational Ecosystem Backend is live!',
            'database_path': app.config['DATABASE_PATH'],
            'portals': ['Student', 'Institute', 'Academician']
        }), 200

    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5001))
    print(f"VidyaSarthi Educational Ecosystem Server starting on http://127.0.0.1:{port}")
    app.run(host='127.0.0.1', port=port, debug=True)