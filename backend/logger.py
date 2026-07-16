"""
Logging configuration and setup for the application.
Handles all logging operations including file and console logging.
"""

import logging
import logging.handlers
import os
from datetime import datetime


def setup_logging(app=None, log_dir='logs'):
    """
    Configure logging for the application.
    
    Args:
        app: Flask application instance (optional)
        log_dir: Directory to store log files
        
    Returns:
        logger: Configured logger instance
    """
    
    # Create logs directory if it doesn't exist
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
    
    # Create logger
    logger = logging.getLogger('diet_recommendation_system')
    logger.setLevel(logging.DEBUG)
    
    # Remove existing handlers to avoid duplicates
    logger.handlers = []
    
    # Create formatters
    detailed_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    simple_formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # File handler for all logs
    all_logs_file = os.path.join(log_dir, f'app_{datetime.now().strftime("%Y%m%d")}.log')
    file_handler = logging.handlers.RotatingFileHandler(
        all_logs_file,
        maxBytes=10485760,  # 10MB
        backupCount=5
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(detailed_formatter)
    logger.addHandler(file_handler)
    
    # File handler for errors only
    error_logs_file = os.path.join(log_dir, f'errors_{datetime.now().strftime("%Y%m%d")}.log')
    error_handler = logging.handlers.RotatingFileHandler(
        error_logs_file,
        maxBytes=10485760,  # 10MB
        backupCount=5
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(detailed_formatter)
    logger.addHandler(error_handler)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(simple_formatter)
    logger.addHandler(console_handler)
    
    logger.info("Logging configured successfully")
    
    if app:
        app.logger = logger
    
    return logger


def get_logger():
    """Get or create the application logger"""
    logger = logging.getLogger('diet_recommendation_system')
    if not logger.handlers:
        setup_logging()
    return logger
