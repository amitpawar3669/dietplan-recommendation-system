"""
Utility functions for the Diet Plan Recommendation System backend.
"""

import os
import json
from datetime import datetime


def ensure_directory(path):
    """
    Ensure a directory exists, creating it if necessary.
    
    Args:
        path: Directory path
    """
    if not os.path.exists(path):
        os.makedirs(path)


def save_json(data, filepath):
    """
    Save data to JSON file.
    
    Args:
        data: Data to save
        filepath: Path to save file
    """
    ensure_directory(os.path.dirname(filepath))
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2, default=str)


def load_json(filepath):
    """
    Load data from JSON file.
    
    Args:
        filepath: Path to JSON file
        
    Returns:
        Loaded data
    """
    if not os.path.exists(filepath):
        return None
    
    with open(filepath, 'r') as f:
        return json.load(f)


def validate_meal_id(meal_id):
    """
    Validate meal ID format.
    
    Args:
        meal_id: Meal ID to validate
        
    Returns:
        bool: True if valid
    """
    try:
        int(meal_id)
        return True
    except (ValueError, TypeError):
        return False


def validate_user_id(user_id):
    """
    Validate user ID format.
    
    Args:
        user_id: User ID to validate
        
    Returns:
        bool: True if valid
    """
    try:
        int(user_id)
        return True
    except (ValueError, TypeError):
        return False


def validate_weight(weight):
    """
    Validate recommendation weight (0-1).
    
    Args:
        weight: Weight to validate
        
    Returns:
        bool: True if valid
    """
    try:
        w = float(weight)
        return 0 <= w <= 1
    except (ValueError, TypeError):
        return False


def get_timestamp():
    """Get current ISO timestamp"""
    return datetime.utcnow().isoformat()


def format_meal_response(meal_data):
    """
    Format meal data for API response.
    
    Args:
        meal_data: Meal data dictionary
        
    Returns:
        Formatted meal data
    """
    return {
        'meal_id': int(meal_data.get('meal_id', 0)),
        'meal_name': str(meal_data.get('meal_name', 'Unknown')),
        'cuisine': str(meal_data.get('cuisine', 'Unknown')),
        'meal_type': str(meal_data.get('meal_type', 'Unknown')),
        'diet_type': str(meal_data.get('diet_type', 'Unknown')),
        'rating': float(meal_data.get('rating', 0.0)),
        'healthiness_score': float(meal_data.get('healthiness_score', 0.0)),
        'calories': int(meal_data.get('calories', 0))
    }
