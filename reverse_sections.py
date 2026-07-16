import json

notebook_path = r'c:\Users\Lenovo\OneDrive\Desktop\DietPlanRecommendations_Changes\DietPlanRecommendations\Diet_Plan_Recommendation_System.ipynb'

# Read the notebook
with open(notebook_path, 'r', encoding='utf-8') as f:
    notebook = json.load(f)

# Reverse the cells order
notebook['cells'].reverse()

# Write back
with open(notebook_path, 'w', encoding='utf-8') as f:
    json.dump(notebook, f, indent=1)

print('✓ Notebook sections reversed successfully!')
print(f'Total cells: {len(notebook["cells"])}')
print('Section 9 is now at top, Section 1 is at bottom')
