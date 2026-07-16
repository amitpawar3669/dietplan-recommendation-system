"""
Model service module for the Diet Plan Recommendation System.
Handles loading, caching, and using trained recommendation models.
"""

import numpy as np
import pandas as pd
import pickle
import os
import random
from sklearn.preprocessing import StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
from logger import get_logger

logger = get_logger()


class RecommendationModel:
    """Wrapper for the hybrid recommendation system model"""
    
    def __init__(self):
        self.df_features = None
        self.content_similarity_matrix = None
        self.user_meal_ratings = None
        self.meal_correlation_matrix = None
        self.label_encoders = {}
        self.is_loaded = False
    
    def load_or_create(self, data_path=None):
        """
        Load trained models from disk or create them if they don't exist.
        
        Args:
            data_path: Path to the data directory
            
        Returns:
            bool: True if models loaded/created successfully, False otherwise
        """
        try:
            logger.info("Loading recommendation models...")
            
            if data_path and os.path.exists(data_path):
                # Try to load pre-trained models
                if self._load_from_disk(data_path):
                    logger.info("Models loaded from disk successfully")
                    return True
            
            # If no saved models, create them in-memory
            logger.info("Creating models in-memory (no saved models found)")
            self._initialize_demo_models()
            self.is_loaded = True
            return True
            
        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")
            return False
    
    def _load_from_disk(self, data_path):
        """Load models from disk"""
        try:
            features_file = os.path.join(data_path, 'df_features.pkl')
            content_sim_file = os.path.join(data_path, 'content_similarity_matrix.pkl')
            meal_corr_file = os.path.join(data_path, 'meal_correlation_matrix.pkl')
            user_ratings_file = os.path.join(data_path, 'user_meal_ratings.pkl')
            
            # Check if all required files exist
            if not all(os.path.exists(f) for f in [features_file, content_sim_file, meal_corr_file, user_ratings_file]):
                logger.warning("Not all model files found on disk")
                return False
            
            # Load all files
            with open(features_file, 'rb') as f:
                self.df_features = pickle.load(f)
            with open(content_sim_file, 'rb') as f:
                self.content_similarity_matrix = pickle.load(f)
            with open(meal_corr_file, 'rb') as f:
                self.meal_correlation_matrix = pickle.load(f)
            with open(user_ratings_file, 'rb') as f:
                self.user_meal_ratings = pickle.load(f)
            
            logger.info(f"Loaded {len(self.df_features)} meals, {len(self.user_meal_ratings)} users")
            self.is_loaded = True
            return True
            
        except Exception as e:
            logger.error(f"Error loading models from disk: {str(e)}")
            return False
    
    def _initialize_demo_models(self):
        """Initialize demo models for testing (using sample data)"""
        try:
            # Create sample meals dataframe
            num_meals = 1750
            num_users = 50
            
            # Meal name templates based on cuisine and type
            meal_templates = {
                'American': {
                    'Breakfast': ['Scrambled Eggs with Toast', 'Pancakes with Bacon', 'Oatmeal Breakfast Bowl', 'Egg Scramble', 'French Toast'],
                    'Lunch': ['Grilled Chicken Salad', 'Turkey Club Sandwich', 'Beef Burger', 'Chicken Caesar Wrap', 'Tuna Melt'],
                    'Dinner': ['Grilled Steak with Vegetables', 'Roasted Chicken Breast', 'Baked Salmon Fillet', 'Meatloaf with Sides', 'BBQ Ribs'],
                    'Snack': ['Apple with Peanut Butter', 'Protein Bar', 'Greek Yogurt', 'Almonds Mix', 'Cheese and Crackers']
                },
                'Chinese': {
                    'Breakfast': ['Congee with Vegetables', 'Steamed Buns', 'Egg Fried Rice', 'Dim Sum Platter', 'Chinese Omelette'],
                    'Lunch': ['Kung Pao Chicken', 'Mongolian Beef', 'Shrimp Fried Rice', 'Sweet and Sour Pork', 'Chicken Lo Mein'],
                    'Dinner': ['Peking Duck', 'Mapo Tofu', 'Steamed Whole Fish', 'Kung Pao Shrimp', 'Chen Szechuan Noodles'],
                    'Snack': ['Chinese Almond Cookies', 'Dried Fruits Mix', 'Rice Crackers', 'Sesame Balls', 'Preserved Plums']
                },
                'Indian': {
                    'Breakfast': ['Masala Dosa', 'Idli with Chutney', 'Poha', 'Upma', 'Paratha Bread'],
                    'Lunch': ['Chicken Tikka Masala', 'Paneer Butter Curry', 'Tandoori Chicken', 'Biryani Rice', 'Chana Masala'],
                    'Dinner': ['Butter Chicken', 'Lamb Rogan Josh', 'Tandoori Fish', 'Dal Makhani', 'Vegetable Korma'],
                    'Snack': ['Samosa', 'Pakora', 'Chai with Biscuits', 'Roasted Chickpeas', 'Bombay Mix']
                },
                'Italian': {
                    'Breakfast': ['Cappuccino with Croissant', 'Frittata', 'Polenta Breakfast', 'Italian Yogurt', 'Ricotta Toast'],
                    'Lunch': ['Pasta Carbonara', 'Chicken Piccata', 'Minestrone Soup', 'Risotto Milanese', 'Fish Fillet'],
                    'Dinner': ['Osso Buco', 'Veal Parmigiana', 'Seafood Pasta', 'Lasagna Bolognese', 'Fettuccine Alfredo'],
                    'Snack': ['Focaccia Bread', 'Mozzarella Sticks', 'Olives and Cheese', 'Breadsticks', 'Italian Almonds']
                },
                'Mediterranean': {
                    'Breakfast': ['Greek Yogurt Parfait', 'Feta Cheese Omelet', 'Olive Tapenade Toast', 'Mediterranean Bowl', 'Herbed Eggs'],
                    'Lunch': ['Grilled Chicken Souvlaki', 'Falafel Wrap', 'Greek Salad', 'Grilled Fish', 'Chickpea Salad'],
                    'Dinner': ['Grilled Lamb Chops', 'Baked Sea Bass', 'Moussaka', 'Grilled Vegetables Platter', 'Olive Oil Fish'],
                    'Snack': ['Hummus with Vegetables', 'Feta and Olives', 'Sea Salt Almonds', 'Greek Nuts Mix', 'Pita with Olive Oil']
                }
            }
            
            # Create meal features
            np.random.seed(42)
            meals = []
            meal_types = ['Breakfast', 'Lunch', 'Dinner', 'Snack']
            cuisines = ['American', 'Chinese', 'Indian', 'Italian', 'Mediterranean']
            
            # Define non-vegetarian keywords
            non_veg_keywords = ['chicken', 'beef', 'meat', 'pork', 'fish', 'shrimp', 'turkey', 'duck', 'lamb', 'steak', 'salmon', 'tuna', 'bacon', 'seafood']
            
            for i in range(num_meals):
                cuisine = np.random.choice(cuisines)
                meal_type = np.random.choice(meal_types)
                meal_name = np.random.choice(meal_templates[cuisine][meal_type])
                
                # Determine diet type based on meal name
                meal_name_lower = meal_name.lower()
                is_non_veg = any(keyword in meal_name_lower for keyword in non_veg_keywords)
                
                if is_non_veg:
                    # Non-vegetarian meals
                    diet_type = 'Balanced'
                else:
                    # For vegetarian-suitable meals, randomly choose between Vegetarian and Vegan
                    diet_type = np.random.choice(['Vegetarian', 'Vegan'], p=[0.6, 0.4])
                
                meals.append({
                    'meal_id': i + 1,
                    'meal_name': f"{meal_name} ({cuisine})",
                    'cuisine': cuisine,
                    'meal_type': meal_type,
                    'diet_type': diet_type,
                    'calories': int(np.random.randint(100, 1000)),
                    'protein_g': int(np.random.uniform(5, 50)),
                    'carbs_g': int(np.random.uniform(10, 100)),
                    'fat_g': int(np.random.uniform(5, 50)),
                    'fiber_g': int(np.random.uniform(1, 20)),
                    'rating': round(np.random.uniform(2.5, 5.0), 1),
                    'healthiness_score': int(np.random.uniform(20, 100)),
                })
            
            self.df_features = pd.DataFrame(meals)
            
            # Create similarity matrices with better structure
            # For demo, create random similarity with diagonal dominance
            np.random.seed(42)
            base_similarity = np.random.uniform(0.3, 0.8, (num_meals, num_meals))
            # Make it symmetric
            self.content_similarity_matrix = (base_similarity + base_similarity.T) / 2
            # Add high values on diagonal
            np.fill_diagonal(self.content_similarity_matrix, 1.0)
            
            # Normalize rows to 0-1 range
            self.content_similarity_matrix = (self.content_similarity_matrix - self.content_similarity_matrix.min(axis=1, keepdims=True)) / (self.content_similarity_matrix.max(axis=1, keepdims=True) - self.content_similarity_matrix.min(axis=1, keepdims=True) + 1e-8)
            
            # Meal correlation is similar but different
            base_corr = np.random.uniform(0.2, 0.7, (num_meals, num_meals))
            self.meal_correlation_matrix = (base_corr + base_corr.T) / 2
            np.fill_diagonal(self.meal_correlation_matrix, 1.0)
            self.meal_correlation_matrix = (self.meal_correlation_matrix - self.meal_correlation_matrix.min(axis=1, keepdims=True)) / (self.meal_correlation_matrix.max(axis=1, keepdims=True) - self.meal_correlation_matrix.min(axis=1, keepdims=True) + 1e-8)
            
            # Create user-meal ratings (mostly 0, with some ratings for diversity)
            self.user_meal_ratings = np.random.choice(
                [0, 0, 0, 0, 0, 1, 2, 3, 4, 5],  # 50% zero ratings, rest random
                size=(num_users, num_meals)
            ).astype(float)
            
            logger.info(f"Demo models initialized: {num_meals} meals, {num_users} users")
            self.is_loaded = True
            
        except Exception as e:
            logger.error(f"Error initializing demo models: {str(e)}")
            self.is_loaded = False
    
    def get_hybrid_recommendations(self, user_id, context_preferences=None,
                                   content_weight=0.5, collab_weight=0.5,
                                   context_weight=0.0, top_n=5):
        """
        Generate hybrid recommendations combining content-based and collaborative filtering.
        Distributes meals across Breakfast, Lunch, Dinner, Snack based on user preferences.
        
        Args:
            user_id: User identifier
            context_preferences: Dict with meal preferences (meals_per_day, snacks_per_day, diet_type, cuisine, etc.)
            content_weight: Weight for content-based filtering (0-1)
            collab_weight: Weight for collaborative filtering (0-1)
            context_weight: Weight for contextual filtering (0-1)
            top_n: Number of recommendations to return
            
        Returns:
            list: List of recommended meals with scores, organized by meal type
        """
        if not self.is_loaded:
            logger.error("Models not loaded")
            raise ValueError("Models not loaded. Cannot generate recommendations.")
        
        if user_id >= len(self.user_meal_ratings):
            logger.warning(f"Invalid user_id: {user_id}. Using modulo to map to available users.")
            user_id = user_id % len(self.user_meal_ratings)
        
        try:
            # Extract meal distribution preferences
            meals_per_day = int(context_preferences.get('meals_per_day', 3)) if context_preferences else 3
            snacks_per_day = int(context_preferences.get('snacks_per_day', 0)) if context_preferences else 0
            plan_type = str(context_preferences.get('plan_type', 'daily')).strip().lower() if context_preferences else 'daily'
            weekly_meal_types = context_preferences.get('weekly_meal_types', []) if context_preferences else []

            def normalize_value(value):
                return str(value).strip().lower()

            def canonical_diet(value):
                normalized = normalize_value(value)
                if normalized in ['non_vegetarian', 'non-vegetarian', 'non vegetarian']:
                    return 'non-vegetarian'
                return normalized

            def detect_diet_related_columns(df):
                by_name = []
                for col in df.columns:
                    col_name = str(col).strip().lower()
                    if any(token in col_name for token in ['diet', 'veg', 'vegetarian', 'vegan', 'food_type', 'meal_category']):
                        by_name.append(col)

                keyword_pattern = r'veg|vegetarian|vegan|non|meat|chicken|fish|seafood|egg'
                by_value = []
                for col in df.columns:
                    series = df[col]
                    if not pd.api.types.is_string_dtype(series) and not pd.api.types.is_object_dtype(series):
                        continue
                    sample = series.dropna().astype(str).head(2000)
                    if sample.str.contains(keyword_pattern, case=False, regex=True).any():
                        by_value.append(col)

                ordered = []
                for col in ['diet_type']:
                    if col in df.columns and col not in ordered:
                        ordered.append(col)
                for col in by_name + by_value:
                    if col not in ordered:
                        ordered.append(col)

                return ordered

            def row_values_for_columns(row, columns):
                values = []
                for col in columns:
                    if col in row.index:
                        values.append(normalize_value(row[col]))
                return values

            def is_forbidden_for_vegan(values):
                forbidden = ['non', 'meat', 'chicken', 'fish', 'seafood', 'egg']
                return any(any(token in value for token in forbidden) for value in values)

            def is_forbidden_for_vegetarian(values):
                forbidden = ['non-veg', 'non veg', 'nonvegetarian', 'non-vegetarian', 'meat', 'chicken', 'fish', 'seafood']
                return any(any(token in value for token in forbidden) for value in values)

            def dedupe_by_slot(meals):
                deduped = []
                seen_by_slot = {}
                for meal in meals:
                    slot = normalize_value(meal.get('meal_type', 'snack'))
                    slot_seen = seen_by_slot.setdefault(slot, set())
                    key = meal.get('meal_id') or meal.get('meal_name') or meal.get('name')
                    if key in slot_seen:
                        continue
                    slot_seen.add(key)
                    deduped.append(meal)
                return deduped

            def dedupe_payload_list(meals):
                seen = set()
                unique = []
                for meal in meals:
                    key = meal.get('meal_id') or meal.get('meal_name') or meal.get('name')
                    if key in seen:
                        continue
                    seen.add(key)
                    unique.append(meal)
                return unique

            def canonical_meal_type(value):
                normalized = normalize_value(value)
                mapping = {
                    'breakfast': 'breakfast',
                    'lunch': 'lunch',
                    'dinner': 'dinner',
                    'snack': 'snack',
                    'snacks': 'snack',
                    'post-workout': 'snack',
                    'post workout': 'snack',
                    'evening meal': 'dinner',
                    'late dinner': 'dinner'
                }
                return mapping.get(normalized, 'snack')

            def build_day_slots():
                if plan_type == 'weekly' and isinstance(weekly_meal_types, list) and len(weekly_meal_types) > 0:
                    selected = [str(item).strip() for item in weekly_meal_types if str(item).strip()]
                    return selected

                slots = []
                if meals_per_day >= 1:
                    slots.append('Breakfast')
                if meals_per_day >= 2:
                    slots.append('Lunch')
                if meals_per_day >= 3:
                    slots.append('Dinner')
                if meals_per_day >= 4:
                    slots.append('Post-Workout')
                if meals_per_day >= 5:
                    slots.append('Evening Meal')
                if meals_per_day >= 6:
                    slots.append('Late Dinner')

                for i in range(max(snacks_per_day, 0)):
                    slots.append(f'Snack {i + 1}')

                return slots if slots else ['Breakfast', 'Lunch', 'Dinner']

            requested_diet = None
            if context_preferences:
                raw_diet = context_preferences.get('diet_type') or context_preferences.get('diet_preference')
                if raw_diet:
                    normalized_diet = canonical_diet(raw_diet)
                    if normalized_diet in ['vegan', 'vegetarian', 'non-vegetarian', 'non_vegetarian']:
                        requested_diet = 'non-vegetarian' if normalized_diet == 'non_vegetarian' else normalized_diet

            requested_cuisine = None
            if context_preferences:
                raw_cuisine = context_preferences.get('cuisine')
                if raw_cuisine and normalize_value(raw_cuisine) not in ['any', 'all', 'others']:
                    requested_cuisine = normalize_value(raw_cuisine)
            
            # Calculate total meals needed
            total_meals_needed = meals_per_day + snacks_per_day
            # Ensure top_n is sufficient to fill meal slots
            if total_meals_needed > top_n:
                top_n = total_meals_needed
            
            num_meals = len(self.df_features)

            # Hard diet pre-filter must run before any scoring/ranking.
            original_df = self.df_features.copy()
            filtered_df = original_df
            diet_columns = detect_diet_related_columns(original_df)

            logger.info(f"Starting diet filter: requested_diet={requested_diet}, total meals={len(original_df)}")

            if requested_diet in ['vegan', 'vegetarian']:
                keep_mask = []
                filtered_count = 0
                for _, row in original_df.iterrows():
                    values = row_values_for_columns(row, diet_columns)
                    primary = normalize_value(row['diet_type']) if 'diet_type' in row.index else ''

                    if requested_diet == 'vegan':
                        # STRICT: Only include meals explicitly labeled as Vegan
                        if primary == 'vegan':
                            keep_mask.append(True)
                            filtered_count += 1
                        else:
                            keep_mask.append(False)
                    else:  # vegetarian
                        # STRICT: Only include meals explicitly labeled as Vegetarian or Vegan
                        if primary in ['vegetarian', 'vegan']:
                            keep_mask.append(True)
                            filtered_count += 1
                        else:
                            keep_mask.append(False)

                filtered_df = original_df[keep_mask]
                logger.info(f"Diet filter result: {filtered_count} {requested_diet} meals kept out of {len(original_df)} total")
                
                # Debug: log some sample meals that were kept
                if len(filtered_df) > 0:
                    sample_meals = filtered_df.head(3)[['meal_name', 'diet_type']].to_dict('records')
                    logger.info(f"Sample filtered meals: {sample_meals}")

            logger.info(
                f"Diet filter applied: {len(filtered_df)} candidates remain from {len(original_df)} "
                f"for diet={requested_diet or 'any'}"
            )

            if requested_diet in ['vegan', 'vegetarian'] and len(filtered_df) == 0:
                raise ValueError(f"No meals available after strict diet filtering for diet={requested_diet}")

            candidate_indices = filtered_df.index.to_list()

            hybrid_scores = np.zeros(num_meals)
            
            # Content-based scoring
            if content_weight > 0:
                user_ratings_vector = self.user_meal_ratings[user_id]
                top_rated_idx = np.argmax(user_ratings_vector)
                content_scores = self.content_similarity_matrix[top_rated_idx]
                hybrid_scores += content_scores * content_weight
            
            # Collaborative filtering scoring
            if collab_weight > 0:
                highly_rated = np.where(self.user_meal_ratings[user_id] > 3.5)[0]
                if len(highly_rated) > 0:
                    collab_scores = np.zeros(num_meals)
                    for meal_idx in highly_rated:
                        similarities = self.meal_correlation_matrix[meal_idx]
                        similarities = np.nan_to_num(similarities, nan=0.0)
                        collab_scores += similarities * self.user_meal_ratings[user_id, meal_idx]
                    collab_scores = collab_scores / len(highly_rated)
                    hybrid_scores += collab_scores * collab_weight
            
            # Contextual scoring
            if context_weight > 0 and context_preferences:
                context_scores = np.zeros(num_meals)
                for i, meal in self.df_features.iterrows():
                    score = 0
                    if 'meal_type' in context_preferences and normalize_value(meal['meal_type']) == normalize_value(context_preferences['meal_type']):
                        score += 1.0
                    if requested_diet and normalize_value(meal['diet_type']) == requested_diet:
                        score += 1.0
                    if requested_cuisine and normalize_value(meal['cuisine']) == requested_cuisine:
                        score += 0.5
                    if 'min_healthiness' in context_preferences and meal['healthiness_score'] >= context_preferences['min_healthiness']:
                        score += 0.5
                    context_scores[i] = score
                
                if context_scores.max() > 0:
                    context_scores = context_scores / context_scores.max()
                hybrid_scores += context_scores * context_weight
            
            # Popularity boost
            popularity_scores = self.df_features['rating'].values / self.df_features['rating'].max()
            hybrid_scores += popularity_scores * 0.2

            # Cuisine is a soft preference: boost instead of hard exclusion.
            if requested_cuisine:
                for idx in candidate_indices:
                    meal_cuisine = normalize_value(self.df_features.iloc[idx]['cuisine'])
                    if meal_cuisine == requested_cuisine:
                        hybrid_scores[idx] += 0.2
            
            # Exclude already-rated meals
            for i, rating in enumerate(self.user_meal_ratings[user_id]):
                if rating > 0:
                    hybrid_scores[i] = -1
            
            # Rank only candidate indices (diet-hard-filtered set).
            candidate_scores = np.array([hybrid_scores[idx] for idx in candidate_indices])
            ranked_positions = np.argsort(candidate_scores)[::-1]
            ranked_candidates = [candidate_indices[pos] for pos in ranked_positions if candidate_scores[pos] >= 0]
            valid_indices = np.array(ranked_candidates, dtype=int)

            def build_meal_payload(idx, meal):
                meal_cuisine = normalize_value(meal['cuisine'])
                return {
                    'meal_id': int(meal['meal_id']),
                    'meal_name': str(meal['meal_name']),
                    'name': str(meal['meal_name']),
                    'cuisine': str(meal['cuisine']),
                    'cuisine_match': bool(requested_cuisine and meal_cuisine == requested_cuisine),
                    'meal_type': str(meal['meal_type']),
                    'diet_type': str(meal['diet_type']),
                    'rating': float(meal['rating']),
                    'healthiness_score': int(meal['healthiness_score']),
                    'calories': int(meal['calories']),
                    'protein': int(meal['protein_g']),
                    'carbs': int(meal['carbs_g']),
                    'fat': int(meal['fat_g']),
                    'fiber': int(meal['fiber_g']),
                    'score': float(hybrid_scores[idx])
                }

            # Weekly plan: return API-first weekly structure.
            if plan_type == 'weekly':
                days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                day_slots = build_day_slots()

                pools_by_type = {'breakfast': [], 'lunch': [], 'dinner': [], 'snack': []}
                all_payloads = []
                for idx in valid_indices[:max(top_n, len(valid_indices))]:
                    meal = self.df_features.iloc[idx]
                    payload = build_meal_payload(idx, meal)
                    all_payloads.append(payload)
                    pools_by_type[canonical_meal_type(meal['meal_type'])].append(payload)

                if len(all_payloads) == 0:
                    logger.warning("Weekly plan request had no valid ranked meals")
                    return {'weekly_plan': [], 'recommendations': []}

                for _, pool in pools_by_type.items():
                    random.shuffle(pool)

                used_meal_ids = set()

                def pick_for_slot(slot_name):
                    slot_bucket = canonical_meal_type(slot_name)
                    primary_pool = pools_by_type.get(slot_bucket, [])

                    for meal_payload in primary_pool:
                        if meal_payload['meal_id'] not in used_meal_ids:
                            used_meal_ids.add(meal_payload['meal_id'])
                            return meal_payload

                    for meal_payload in all_payloads:
                        if meal_payload['meal_id'] not in used_meal_ids:
                            used_meal_ids.add(meal_payload['meal_id'])
                            return meal_payload

                    return random.choice(primary_pool if len(primary_pool) > 0 else all_payloads)

                weekly_plan = []
                placed_meals = []
                for day in days:
                    meals_dict = {}
                    snacks = []
                    for slot in day_slots:
                        picked = pick_for_slot(slot)
                        placed_meals.append(picked)
                        normalized_slot = normalize_value(slot)
                        if normalized_slot.startswith('snack') or canonical_meal_type(slot) == 'snack':
                            snacks.append(picked)
                        elif canonical_meal_type(slot) == 'breakfast' and 'breakfast' not in meals_dict:
                            meals_dict['breakfast'] = picked
                        elif canonical_meal_type(slot) == 'lunch' and 'lunch' not in meals_dict:
                            meals_dict['lunch'] = picked
                        elif canonical_meal_type(slot) == 'dinner' and 'dinner' not in meals_dict:
                            meals_dict['dinner'] = picked
                        else:
                            snacks.append(picked)

                    meals_dict.setdefault('breakfast', pick_for_slot('Breakfast'))
                    meals_dict.setdefault('lunch', pick_for_slot('Lunch'))
                    meals_dict.setdefault('dinner', pick_for_slot('Dinner'))
                    meals_dict['snacks'] = dedupe_payload_list(snacks)

                    weekly_plan.append({'day': day, 'meals': meals_dict})

                if requested_cuisine:
                    placed_count = len(placed_meals)
                    matched_count = sum(1 for m in placed_meals if m.get('cuisine_match'))
                    ratio = (matched_count / placed_count) if placed_count else 0

                    if ratio < 0.6:
                        cuisine_payloads = [m for m in all_payloads if m.get('cuisine_match')]
                        replacement_iter = iter(cuisine_payloads)

                        for day_entry in weekly_plan:
                            meals_dict = day_entry['meals']
                            for key in ['breakfast', 'lunch', 'dinner']:
                                meal_payload = meals_dict.get(key)
                                if meal_payload and not meal_payload.get('cuisine_match'):
                                    replacement = next(replacement_iter, None)
                                    if replacement:
                                        meals_dict[key] = replacement

                            snack_items = meals_dict.get('snacks', [])
                            for i, snack in enumerate(snack_items):
                                if not snack.get('cuisine_match'):
                                    replacement = next(replacement_iter, None)
                                    if replacement:
                                        snack_items[i] = replacement
                            meals_dict['snacks'] = snack_items

                        flat_after_backfill = []
                        for day_entry in weekly_plan:
                            meals_dict = day_entry['meals']
                            flat_after_backfill.extend([
                                meals_dict.get('breakfast'),
                                meals_dict.get('lunch'),
                                meals_dict.get('dinner')
                            ])
                            flat_after_backfill.extend(meals_dict.get('snacks', []))

                        flat_after_backfill = [m for m in flat_after_backfill if m]
                        matched_after_backfill = sum(1 for m in flat_after_backfill if m.get('cuisine_match'))
                        logger.info(
                            f"Cuisine fallback applied (target={requested_cuisine}) "
                            f"match_ratio={matched_after_backfill}/{len(flat_after_backfill)}"
                        )

                # SAFETY CHECK: Validate all meals match the requested diet
                if requested_diet in ['vegan', 'vegetarian']:
                    for day_entry in weekly_plan:
                        meals_dict = day_entry['meals']
                        for key in ['breakfast', 'lunch', 'dinner']:
                            meal = meals_dict.get(key)
                            if meal:
                                meal_diet = normalize_value(meal.get('diet_type', ''))
                                if requested_diet == 'vegan' and meal_diet != 'vegan':
                                    logger.error(f"VALIDATION FAILED: {meal.get('meal_name')} has diet_type={meal_diet}, expected vegan")
                                    raise ValueError(f"Non-vegan meal '{meal.get('meal_name')}' returned for vegan diet request")
                                if requested_diet == 'vegetarian' and meal_diet not in ['vegetarian', 'vegan']:
                                    logger.error(f"VALIDATION FAILED: {meal.get('meal_name')} has diet_type={meal_diet}, expected vegetarian/vegan")
                                    raise ValueError(f"Non-vegetarian meal '{meal.get('meal_name')}' returned for vegetarian diet request")
                        
                        for snack in meals_dict.get('snacks', []):
                            meal_diet = normalize_value(snack.get('diet_type', ''))
                            if requested_diet == 'vegan' and meal_diet != 'vegan':
                                logger.error(f"VALIDATION FAILED: {snack.get('meal_name')} has diet_type={meal_diet}, expected vegan")
                                raise ValueError(f"Non-vegan meal '{snack.get('meal_name')}' returned for vegan diet request")
                            if requested_diet == 'vegetarian' and meal_diet not in ['vegetarian', 'vegan']:
                                logger.error(f"VALIDATION FAILED: {snack.get('meal_name')} has diet_type={meal_diet}, expected vegetarian/vegan")
                                raise ValueError(f"Non-vegetarian meal '{snack.get('meal_name')}' returned for vegetarian diet request")

                logger.info(
                    f"Generated weekly plan for user {user_id} "
                    f"(days={len(weekly_plan)}, slots_per_day={len(day_slots)})"
                )
                return {
                    'weekly_plan': weekly_plan,
                    'recommendations': dedupe_payload_list(all_payloads[:top_n])
                }
            
            # Distribute meals by type
            meal_type_order = ['Breakfast', 'Lunch', 'Dinner']
            meals_by_type = {'Breakfast': [], 'Lunch': [], 'Dinner': [], 'Snack': []}
            recommendations = []
            
            # First, collect meals by type
            for idx in valid_indices:
                meal = self.df_features.iloc[idx]
                meal_type = str(meal['meal_type'])
                if meal_type in meals_by_type:
                    meals_by_type[meal_type].append((idx, meal))
            
            # Distribute main meals (Breakfast, Lunch, Dinner)
            meals_per_main_type = meals_per_day // 3
            extra_meals = meals_per_day % 3
            
            for i, meal_type in enumerate(meal_type_order):
                # Calculate how many meals of this type needed
                meals_needed = meals_per_main_type + (1 if i < extra_meals else 0)
                
                # Add meals of this type
                for idx, meal in meals_by_type[meal_type][:meals_needed]:
                    recommendations.append(build_meal_payload(idx, meal))
            
            # Add snacks if needed
            if snacks_per_day > 0:
                for idx, meal in meals_by_type['Snack'][:snacks_per_day]:
                    recommendations.append(build_meal_payload(idx, meal))

            # Fill any missing slots with the next best meals regardless of type.
            if len(recommendations) < total_meals_needed:
                selected_ids = {meal['meal_id'] for meal in recommendations}
                for idx in valid_indices:
                    if len(recommendations) >= total_meals_needed:
                        break
                    meal = self.df_features.iloc[idx]
                    meal_id = int(meal['meal_id'])
                    if meal_id in selected_ids:
                        continue
                    recommendations.append(build_meal_payload(idx, meal))
                    selected_ids.add(meal_id)

                    recommendations = dedupe_by_slot(recommendations)
            
            logger.info(f"Generated {len(recommendations)} recommendations for user {user_id} ({meals_per_day} meals + {snacks_per_day} snacks)")
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {str(e)}")
            raise
    
    def get_content_based_recommendations(self, meal_id, top_n=5):
        """
        Get content-based recommendations for a meal.
        
        Args:
            meal_id: Meal ID to get recommendations for
            top_n: Number of recommendations
            
        Returns:
            list: Similar meals
        """
        if not self.is_loaded:
            raise ValueError("Models not loaded")
        
        try:
            # Find meal index
            meal_idx = self.df_features[self.df_features['meal_id'] == meal_id].index
            if len(meal_idx) == 0:
                logger.warning(f"Meal ID {meal_id} not found")
                return []
            
            meal_idx = meal_idx[0]
            
            # Get similarity scores
            sim_scores = self.content_similarity_matrix[meal_idx]
            
            # Get top N similar meals (excluding the meal itself)
            top_similar_indices = np.argsort(sim_scores)[::-1][1:top_n+1]
            
            recommendations = []
            for idx in top_similar_indices:
                meal = self.df_features.iloc[idx]
                recommendations.append({
                    'meal_id': int(meal['meal_id']),
                    'meal_name': str(meal['meal_name']),
                    'cuisine': str(meal['cuisine']),
                    'similarity_score': float(sim_scores[idx])
                })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error getting content-based recommendations: {str(e)}")
            raise


# Global model instance
_model_instance = None


def get_model():
    """Get or create the global model instance"""
    global _model_instance
    if _model_instance is None:
        _model_instance = RecommendationModel()
        _model_instance.load_or_create()
    return _model_instance


def initialize_model(data_path=None):
    """Initialize the model with optional data path"""
    global _model_instance
    _model_instance = RecommendationModel()
    return _model_instance.load_or_create(data_path)
