"""
Configuration management for the Diet Plan Recommendation System backend.
Handles environment variables, settings, and application configuration.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Base configuration class"""
    
    # Flask settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    TESTING = False
    
    # API settings
    JSON_SORT_KEYS = False
    JSONIFY_PRETTYPRINT_REGULAR = True
    
    # Model settings
    MODEL_PATH = os.getenv('MODEL_PATH', os.path.join(os.path.dirname(__file__), 'models'))
    DATA_PATH = os.getenv('DATA_PATH', os.path.join(os.path.dirname(__file__), 'data'))
    
    # Recommendation settings
    DEFAULT_TOP_N = 5
    MIN_HEALTHINESS = 30
    MAX_RECOMMENDATIONS = 120
    
    # Collaborative filtering settings
    NUM_USERS = 50
    RATING_THRESHOLD = 3.5


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    SECRET_KEY = os.getenv('SECRET_KEY')
    if not SECRET_KEY:
        raise ValueError("SECRET_KEY environment variable must be set in production")


class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    TESTING = True
    SECRET_KEY = 'test-secret-key'


def get_config():
    """Get configuration based on environment"""
    env = os.getenv('FLASK_ENV', 'development').lower()
    
    config_mapping = {
        'development': DevelopmentConfig,
        'production': ProductionConfig,
        'testing': TestingConfig,
    }
    
    return config_mapping.get(env, DevelopmentConfig)
