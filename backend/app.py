"""
Flask application for the Diet Plan Recommendation System.
Provides REST API endpoints for meal recommendations and personalization.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import traceback
import os
from config import get_config
from logger import setup_logging, get_logger
from models import initialize_model, get_model

# Create Flask app
app = Flask(__name__)

# Load configuration
config = get_config()
app.config.from_object(config)

# Setup logging
logger = setup_logging(app)

# Enable CORS
CORS(app, resources={r"/api/*": {"origins": "*"}})


# ==================== Error Handlers ====================

@app.errorhandler(400)
def bad_request(error):
    """Handle 400 Bad Request errors"""
    logger.warning(f"Bad request: {str(error)}")
    return jsonify({
        'status': 'error',
        'code': 400,
        'message': 'Bad request',
        'details': str(error)
    }), 400


@app.errorhandler(404)
def not_found(error):
    """Handle 404 Not Found errors"""
    logger.warning(f"Resource not found: {str(error)}")
    return jsonify({
        'status': 'error',
        'code': 404,
        'message': 'Resource not found',
        'details': str(error)
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 Internal Server errors"""
    logger.error(f"Internal server error: {str(error)}\n{traceback.format_exc()}")
    return jsonify({
        'status': 'error',
        'code': 500,
        'message': 'Internal server error',
        'details': 'An unexpected error occurred'
    }), 500


# ==================== Health & Status Endpoints ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint.
    
    Returns:
        JSON with server status and model status
    """
    try:
        model = get_model()
        model_status = 'loaded' if model.is_loaded else 'not_loaded'
        
        return jsonify({
            'status': 'ok',
            'timestamp': datetime.utcnow().isoformat(),
            'server': 'running',
            'model_status': model_status,
            'version': '1.0.0'
        }), 200
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'status': 'error',
            'timestamp': datetime.utcnow().isoformat(),
            'server': 'running',
            'model_status': 'error',
            'details': str(e)
        }), 500


@app.route('/api/info', methods=['GET'])
def get_info():
    """
    Get system information and statistics.
    
    Returns:
        JSON with system information
    """
    try:
        model = get_model()
        
        info = {
            'status': 'ok',
            'system': {
                'name': 'Diet Plan Recommendation System',
                'version': '1.0.0',
                'environment': app.config.get('DEBUG', False) and 'development' or 'production'
            },
            'model': {
                'loaded': model.is_loaded,
                'meals': len(model.df_features) if model.is_loaded else 0,
                'users': len(model.user_meal_ratings) if model.is_loaded else 0
            }
        }
        
        return jsonify(info), 200
    except Exception as e:
        logger.error(f"Error getting info: {str(e)}")
        return jsonify({'status': 'error', 'details': str(e)}), 500


# ==================== Recommendation Endpoints ====================

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    """
    Get hybrid recommendations for a user.
    
    Request JSON:
        {
            'user_id': int (required),
            'top_n': int (optional, default: 5),
            'content_weight': float (optional, default: 0.5),
            'collab_weight': float (optional, default: 0.5),
            'context_weight': float (optional, default: 0.0),
            'context_preferences': dict (optional - meal_type, diet_type, cuisine, min_healthiness)
        }
    
    Returns:
        JSON with list of recommended meals
    """
    try:
        data = request.get_json()
        
        # Validation
        if not data or 'user_id' not in data:
            logger.warning("Missing user_id in request")
            return jsonify({
                'status': 'error',
                'message': 'Missing required field: user_id'
            }), 400
        
        user_id = int(data['user_id'])
        top_n = int(data.get('top_n', app.config['DEFAULT_TOP_N']))
        content_weight = float(data.get('content_weight', 0.5))
        collab_weight = float(data.get('collab_weight', 0.5))
        context_weight = float(data.get('context_weight', 0.0))
        context_preferences = data.get('context_preferences') or {}
        diet_type = context_preferences.get('diet_type') or data.get('diet_type') or 'any'
        context_preferences['diet_type'] = diet_type
        logger.info(f"Received diet_type: {diet_type}")
        
        # Validate weights sum to reasonable value
        total_weight = content_weight + collab_weight + context_weight
        if total_weight == 0:
            return jsonify({
                'status': 'error',
                'message': 'At least one weight must be > 0'
            }), 400
        
        # Validate top_n
        if top_n < 1 or top_n > app.config['MAX_RECOMMENDATIONS']:
            top_n = app.config['DEFAULT_TOP_N']
        
        # Get recommendations
        model = get_model()
        recommendations = model.get_hybrid_recommendations(
            user_id=user_id,
            context_preferences=context_preferences,
            content_weight=content_weight,
            collab_weight=collab_weight,
            context_weight=context_weight,
            top_n=top_n
        )

        response_payload = {
            'status': 'success',
            'user_id': user_id,
        }

        if isinstance(recommendations, dict) and 'weekly_plan' in recommendations:
            response_payload['weekly_plan'] = recommendations.get('weekly_plan', [])
            response_payload['recommendations'] = recommendations.get('recommendations', [])
            response_payload['count'] = len(response_payload['recommendations'])
            response_payload['days'] = len(response_payload['weekly_plan'])
            logger.info(
                f"Generated weekly response for user {user_id} "
                f"(days={response_payload['days']}, recommendations={response_payload['count']})"
            )
        else:
            response_payload['recommendations'] = recommendations
            response_payload['count'] = len(recommendations)
            logger.info(f"Generated {len(recommendations)} recommendations for user {user_id}")

        return jsonify(response_payload), 200
        
    except ValueError as e:
        logger.warning(f"Validation error in recommendations: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Invalid input',
            'details': str(e)
        }), 400
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}\n{traceback.format_exc()}")
        return jsonify({
            'status': 'error',
            'message': 'Error generating recommendations',
            'details': str(e)
        }), 500


@app.route('/api/content-based', methods=['POST'])
def get_content_based():
    """
    Get content-based recommendations for a specific meal.
    
    Request JSON:
        {
            'meal_id': int (required),
            'top_n': int (optional, default: 5)
        }
    
    Returns:
        JSON with similar meals
    """
    try:
        data = request.get_json()
        
        if not data or 'meal_id' not in data:
            logger.warning("Missing meal_id in request")
            return jsonify({
                'status': 'error',
                'message': 'Missing required field: meal_id'
            }), 400
        
        meal_id = int(data['meal_id'])
        top_n = int(data.get('top_n', app.config['DEFAULT_TOP_N']))
        
        model = get_model()
        recommendations = model.get_content_based_recommendations(meal_id, top_n)
        
        logger.info(f"Generated {len(recommendations)} content-based recommendations for meal {meal_id}")
        
        return jsonify({
            'status': 'success',
            'meal_id': meal_id,
            'count': len(recommendations),
            'recommendations': recommendations
        }), 200
        
    except ValueError as e:
        logger.warning(f"Validation error in content-based: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Invalid input',
            'details': str(e)
        }), 400
    except Exception as e:
        logger.error(f"Error generating content-based recommendations: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Error generating recommendations'
        }), 500


@app.route('/api/user-profile', methods=['POST'])
def create_user_profile():
    """
    Create a user profile for personalized recommendations.
    
    Request JSON:
        {
            'user_id': int (required),
            'diet_type': str (optional),
            'cuisine': str (optional),
            'meal_type': str (optional),
            'min_healthiness': int (optional)
        }
    
    Returns:
        JSON with created profile
    """
    try:
        data = request.get_json()
        
        if not data or 'user_id' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Missing required field: user_id'
            }), 400
        
        user_id = int(data['user_id'])
        profile = {
            'user_id': user_id,
            'diet_type': data.get('diet_type', 'Balanced'),
            'cuisine': data.get('cuisine', 'Any'),
            'meal_type': data.get('meal_type', 'Any'),
            'min_healthiness': int(data.get('min_healthiness', app.config['MIN_HEALTHINESS']))
        }
        
        logger.info(f"Created profile for user {user_id}: {profile}")
        
        return jsonify({
            'status': 'success',
            'profile': profile
        }), 201
        
    except ValueError as e:
        logger.warning(f"Validation error in profile creation: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Invalid input',
            'details': str(e)
        }), 400
    except Exception as e:
        logger.error(f"Error creating profile: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Error creating profile'
        }), 500


@app.route('/api/meals/search', methods=['GET'])
def search_meals():
    """
    Search for meals by criteria.
    
    Query parameters:
        - diet_type: str (optional)
        - cuisine: str (optional)
        - meal_type: str (optional)
        - min_rating: float (optional)
        - max_calories: int (optional)
        - limit: int (optional, default: 10)
    
    Returns:
        JSON with matching meals
    """
    try:
        model = get_model()
        df = model.df_features
        
        # Apply filters
        results = df.copy()
        
        diet_type = request.args.get('diet_type')
        if diet_type:
            results = results[results['diet_type'] == diet_type]
        
        cuisine = request.args.get('cuisine')
        if cuisine:
            results = results[results['cuisine'] == cuisine]
        
        meal_type = request.args.get('meal_type')
        if meal_type:
            results = results[results['meal_type'] == meal_type]
        
        min_rating = request.args.get('min_rating', type=float)
        if min_rating:
            results = results[results['rating'] >= min_rating]
        
        max_calories = request.args.get('max_calories', type=int)
        if max_calories:
            results = results[results['calories'] <= max_calories]
        
        limit = int(request.args.get('limit', 10))
        results = results.head(limit)
        
        meals = []
        for _, row in results.iterrows():
            meals.append({
                'meal_id': int(row['meal_id']),
                'meal_name': str(row['meal_name']),
                'cuisine': str(row['cuisine']),
                'diet_type': str(row['diet_type']),
                'rating': float(row['rating']),
                'calories': int(row['calories']) if 'calories' in row else 0
            })
        
        logger.info(f"Search returned {len(meals)} meals with filters: diet_type={diet_type}, cuisine={cuisine}")
        
        return jsonify({
            'status': 'success',
            'count': len(meals),
            'meals': meals
        }), 200
        
    except Exception as e:
        logger.error(f"Error searching meals: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': 'Error searching meals',
            'details': str(e)
        }), 500


# ==================== Root Routes ====================

@app.route('/', methods=['GET'])
def index():
    """Welcome page with API information"""
    return '''
    <!DOCTYPE html>
    <html>
    <head>
        <title>Diet Plan Recommendation System API</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #333; }
            .endpoint { background: #f4f4f4; padding: 10px; margin: 10px 0; border-left: 4px solid #007bff; }
            code { background: #e9ecef; padding: 2px 6px; border-radius: 3px; }
        </style>
    </head>
    <body>
        <h1>Diet Plan Recommendation System API</h1>
        <p>Welcome! This is the backend API for the Diet Plan Recommendation System.</p>
        
        <h2>Available Endpoints:</h2>
        
        <div class="endpoint">
            <strong>Health Check:</strong><br>
            <code>GET /api/health</code> - Check server and model status
        </div>
        
        <div class="endpoint">
            <strong>System Info:</strong><br>
            <code>GET /api/info</code> - Get system information and statistics
        </div>
        
        <div class="endpoint">
            <strong>Get Recommendations:</strong><br>
            <code>POST /api/recommendations</code> - Get hybrid recommendations for a user
        </div>
        
        <div class="endpoint">
            <strong>Content-Based Recommendations:</strong><br>
            <code>POST /api/content-based</code> - Get similar meals
        </div>
        
        <div class="endpoint">
            <strong>Create User Profile:</strong><br>
            <code>POST /api/user-profile</code> - Create personalized user profile
        </div>
        
        <div class="endpoint">
            <strong>Search Meals:</strong><br>
            <code>GET /api/meals/search</code> - Search meals by criteria
        </div>
        
        <hr>
        <p><small>For detailed API documentation, see the README.md file</small></p>
    </body>
    </html>
    '''


@app.route('/api/docs', methods=['GET'])
def api_docs():
    """API documentation endpoint"""
    return jsonify({
        'name': 'Diet Plan Recommendation System API',
        'version': '1.0.0',
        'description': 'Hybrid recommendation system for personalized meal planning',
        'endpoints': {
            '/api/health': 'GET - Health check',
            '/api/info': 'GET - System information',
            '/api/recommendations': 'POST - Get hybrid recommendations',
            '/api/content-based': 'POST - Content-based recommendations',
            '/api/user-profile': 'POST - Create user profile',
            '/api/meals/search': 'GET - Search meals'
        }
    }), 200


# ==================== Application Initialization ====================

def create_app():
    """Application factory function"""
    global app
    
    logger.info("Initializing Diet Plan Recommendation System...")
    
    # Initialize models
    if not initialize_model(app.config.get('DATA_PATH')):
        logger.warning("Models initialized in demo mode")
    
    logger.info("Application initialized successfully")
    return app


if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    debug = app.config.get('DEBUG', False)
    
    logger.info(f"Starting Flask server on port {port} (debug={debug})")
    app.run(host='0.0.0.0', port=port, debug=debug)
