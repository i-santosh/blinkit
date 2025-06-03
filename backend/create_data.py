import os
import sys
import django
import random

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from products.models import Category, Product

def create_categories():
    """Create categories in bulk"""
    categories = [
        "Fruits & Vegetables",
        "Dairy & Breakfast", 
        "Snacks & Munchies",
        "Atta, Rice & Dal",
        "Bakery & Biscuits",
        "Beverages",
        "Cleaning Essentials",
        "Personal Care",
        "Home & Kitchen",
        "Baby Care",
        "Pet Care",
        "Meat & Seafood"
    ]
    
    created_categories = []
    
    for category_name in categories:
        category, created = Category.objects.get_or_create(
            name=category_name,
            defaults={'description': f'Products in the {category_name} category'}
        )
        
        if created:
            print(f"Created category: {category_name}")
        else:
            print(f"Category already exists: {category_name}")
            
        created_categories.append(category)
        
    return created_categories

def create_products(categories):
    """Create products in bulk for each category"""
    products_by_category = {
        "Fruits & Vegetables": [
            {"name": "Fresh Apples", "price": 149.00, "description": "Sweet and juicy red apples, perfect for snacking or baking."},
            {"name": "Bananas", "price": 59.00, "description": "Ripe yellow bananas, rich in potassium and natural sweetness."},
            {"name": "Tomatoes", "price": 39.00, "description": "Plump, ripe tomatoes ideal for salads and cooking."},
            {"name": "Onions", "price": 29.00, "description": "Essential cooking ingredient with strong flavor."},
            {"name": "Potatoes", "price": 49.00, "description": "Versatile root vegetable for various dishes."},
            {"name": "Carrots", "price": 39.00, "description": "Crunchy orange root vegetable, rich in vitamin A."},
            {"name": "Spinach", "price": 29.00, "description": "Leafy green vegetable packed with iron."},
            {"name": "Cucumber", "price": 39.00, "description": "Refreshing vegetable with high water content."},
        ],
        "Dairy & Breakfast": [
            {"name": "Milk", "price": 69.00, "description": "Fresh cow's milk, essential for daily nutrition."},
            {"name": "Eggs", "price": 89.00, "description": "Farm-fresh eggs, rich in protein."},
            {"name": "Bread", "price": 45.00, "description": "Soft, white bread, perfect for sandwiches and toast."},
            {"name": "Butter", "price": 69.00, "description": "Creamy, unsalted butter for cooking and spreading."},
            {"name": "Cheese", "price": 129.00, "description": "Tasty cheddar cheese, perfect for sandwiches and snacks."},
            {"name": "Yogurt", "price": 49.00, "description": "Creamy yogurt with active cultures, good for digestion."},
            {"name": "Cereal", "price": 199.00, "description": "Whole grain breakfast cereal, nutritious start to the day."},
            {"name": "Jam", "price": 129.00, "description": "Sweet fruit jam, perfect for bread and toast."},
        ],
        "Snacks & Munchies": [
            {"name": "Potato Chips", "price": 59.00, "description": "Crispy, salted potato chips for snacking."},
            {"name": "Popcorn", "price": 79.00, "description": "Light and fluffy popcorn, perfect for movie nights."},
            {"name": "Cookies", "price": 69.00, "description": "Sweet, crunchy cookies for a delightful treat."},
            {"name": "Nuts Mix", "price": 199.00, "description": "Assorted nuts, rich in healthy fats and protein."},
            {"name": "Chocolate Bar", "price": 99.00, "description": "Smooth milk chocolate for a sweet indulgence."},
            {"name": "Trail Mix", "price": 159.00, "description": "Blend of nuts, seeds, and dried fruits for energy."},
            {"name": "Pretzel Sticks", "price": 89.00, "description": "Crunchy, salted pretzel sticks for snacking."},
            {"name": "Granola Bars", "price": 129.00, "description": "Nutritious bars with oats, nuts, and honey."},
        ],
        "Atta, Rice & Dal": [
            {"name": "Whole Wheat Flour", "price": 199.00, "description": "Stone-ground whole wheat flour for chapatis and bread."},
            {"name": "Basmati Rice", "price": 249.00, "description": "Fragrant, long-grain basmati rice for perfect fluffy texture."},
            {"name": "Yellow Dal", "price": 159.00, "description": "Split yellow lentils, a staple for Indian cooking."},
            {"name": "Brown Rice", "price": 179.00, "description": "Nutritious whole grain rice with fiber and minerals."},
            {"name": "Red Lentils", "price": 139.00, "description": "Quick-cooking red lentils for soups and stews."},
            {"name": "Quinoa", "price": 299.00, "description": "Protein-rich ancient grain, perfect for health-conscious meals."},
            {"name": "Chickpeas", "price": 129.00, "description": "Versatile legume for curries, salads, and hummus."},
            {"name": "Black Beans", "price": 149.00, "description": "Protein-packed black beans for various dishes."},
        ],
        "Bakery & Biscuits": [
            {"name": "Chocolate Cookies", "price": 99.00, "description": "Rich, chocolate cookies with chocolate chips."},
            {"name": "Multi-grain Bread", "price": 69.00, "description": "Nutritious bread made with multiple whole grains."},
            {"name": "Vanilla Cake", "price": 299.00, "description": "Moist vanilla cake with creamy frosting."},
            {"name": "Croissants", "price": 159.00, "description": "Buttery, flaky French pastries."},
            {"name": "Garlic Bread", "price": 129.00, "description": "Bread infused with garlic and herbs."},
            {"name": "Biscotti", "price": 179.00, "description": "Crunchy Italian cookies, perfect with coffee."},
            {"name": "Muffins", "price": 99.00, "description": "Soft, sweet muffins in various flavors."},
            {"name": "Bagels", "price": 149.00, "description": "Dense, chewy bread rolls, great for sandwiches."},
        ],
        "Beverages": [
            {"name": "Mineral Water", "price": 29.00, "description": "Pure, refreshing mineral water in a convenient bottle."},
            {"name": "Orange Juice", "price": 99.00, "description": "100% pure orange juice, rich in vitamin C."},
            {"name": "Cola", "price": 69.00, "description": "Classic cola beverage for refreshment."},
            {"name": "Green Tea", "price": 159.00, "description": "Antioxidant-rich green tea for health and wellness."},
            {"name": "Coffee", "price": 299.00, "description": "Premium ground coffee for a perfect brew."},
            {"name": "Mango Smoothie", "price": 129.00, "description": "Tropical mango-flavored smoothie."},
            {"name": "Lemonade", "price": 79.00, "description": "Sweet and tangy lemonade for hot days."},
            {"name": "Energy Drink", "price": 99.00, "description": "Energizing beverage with caffeine and vitamins."},
        ],
        "Cleaning Essentials": [
            {"name": "Dish Soap", "price": 99.00, "description": "Effective dish soap that cuts through grease and food residue."},
            {"name": "Laundry Detergent", "price": 299.00, "description": "Powerful detergent for clean, fresh-smelling clothes."},
            {"name": "All-Purpose Cleaner", "price": 159.00, "description": "Versatile cleaner for multiple surfaces."},
            {"name": "Glass Cleaner", "price": 129.00, "description": "Streak-free formula for sparkling glass and mirrors."},
            {"name": "Floor Cleaner", "price": 149.00, "description": "Effective floor cleaner for various floor types."},
            {"name": "Toilet Cleaner", "price": 119.00, "description": "Powerful formula to clean and disinfect toilets."},
            {"name": "Sponges", "price": 69.00, "description": "Durable sponges for cleaning dishes and surfaces."},
            {"name": "Garbage Bags", "price": 99.00, "description": "Strong, leak-proof garbage bags for waste disposal."},
        ],
        "Personal Care": [
            {"name": "Shampoo", "price": 199.00, "description": "Gentle cleansing shampoo for all hair types."},
            {"name": "Toothpaste", "price": 99.00, "description": "Fluoride toothpaste for cavity protection."},
            {"name": "Soap", "price": 69.00, "description": "Moisturizing soap for gentle skin cleansing."},
            {"name": "Hand Sanitizer", "price": 129.00, "description": "Effective hand sanitizer with 70% alcohol."},
            {"name": "Deodorant", "price": 159.00, "description": "Long-lasting deodorant for 24-hour freshness."},
            {"name": "Facial Cleanser", "price": 249.00, "description": "Gentle facial cleanser for all skin types."},
            {"name": "Body Lotion", "price": 179.00, "description": "Moisturizing body lotion for soft, smooth skin."},
            {"name": "Sunscreen", "price": 299.00, "description": "Broad-spectrum SPF 50 sunscreen for skin protection."},
        ],
        "Home & Kitchen": [
            {"name": "Kitchen Towels", "price": 129.00, "description": "Absorbent kitchen towels for various uses."},
            {"name": "Aluminium Foil", "price": 149.00, "description": "Durable aluminium foil for cooking and food storage."},
            {"name": "Plastic Wrap", "price": 99.00, "description": "Cling film for food preservation."},
            {"name": "Paper Plates", "price": 79.00, "description": "Disposable paper plates for convenience."},
            {"name": "Cooking Pot", "price": 499.00, "description": "Durable stainless steel pot for cooking."},
            {"name": "Frying Pan", "price": 599.00, "description": "Non-stick frying pan for easy cooking."},
            {"name": "Kitchen Knife", "price": 299.00, "description": "Sharp, stainless steel kitchen knife."},
            {"name": "Cutting Board", "price": 199.00, "description": "Durable plastic cutting board for food preparation."},
        ],
        "Baby Care": [
            {"name": "Diapers", "price": 399.00, "description": "Soft, absorbent diapers for babies."},
            {"name": "Baby Wipes", "price": 149.00, "description": "Gentle, hypoallergenic baby wipes."},
            {"name": "Baby Shampoo", "price": 199.00, "description": "Tear-free baby shampoo for gentle cleansing."},
            {"name": "Baby Lotion", "price": 179.00, "description": "Moisturizing lotion for baby's delicate skin."},
            {"name": "Baby Powder", "price": 149.00, "description": "Gentle powder to keep baby dry and comfortable."},
            {"name": "Baby Food", "price": 129.00, "description": "Nutritious, ready-to-eat baby food."},
            {"name": "Baby Bottle", "price": 199.00, "description": "BPA-free baby bottle for feeding."},
            {"name": "Baby Soap", "price": 99.00, "description": "Mild, gentle soap for baby's sensitive skin."},
        ],
        "Pet Care": [
            {"name": "Dog Food", "price": 499.00, "description": "Nutritious dry food for adult dogs."},
            {"name": "Cat Food", "price": 399.00, "description": "Premium cat food with balanced nutrition."},
            {"name": "Pet Shampoo", "price": 249.00, "description": "Gentle shampoo for pets with all coat types."},
            {"name": "Pet Toys", "price": 199.00, "description": "Durable toys for pet entertainment."},
            {"name": "Cat Litter", "price": 299.00, "description": "Odor-controlling cat litter for indoor cats."},
            {"name": "Pet Brush", "price": 149.00, "description": "Grooming brush for pets to remove loose fur."},
            {"name": "Pet Treats", "price": 169.00, "description": "Tasty treats for pet training and rewards."},
            {"name": "Pet Bed", "price": 599.00, "description": "Comfortable bed for pets to rest and sleep."},
        ],
        "Meat & Seafood": [
            {"name": "Chicken Breast", "price": 249.00, "description": "Boneless, skinless chicken breast, high in protein."},
            {"name": "Ground Beef", "price": 299.00, "description": "Fresh ground beef for burgers and other recipes."},
            {"name": "Salmon Fillet", "price": 499.00, "description": "Fresh salmon fillet, rich in omega-3 fatty acids."},
            {"name": "Prawns", "price": 399.00, "description": "Fresh prawns, perfect for curries and stir-fries."},
            {"name": "Lamb Chops", "price": 599.00, "description": "Tender lamb chops for grilling or roasting."},
            {"name": "Fish Fillets", "price": 349.00, "description": "White fish fillets, great for pan-frying."},
            {"name": "Pork Ribs", "price": 449.00, "description": "Meaty pork ribs for barbecuing or slow cooking."},
            {"name": "Crab", "price": 699.00, "description": "Fresh crab meat, sweet and delicate."},
        ],
    }
    
    # List of possible tags for products
    tags = ['new_arrivals', 'trending', 'top_rated']
    
    # Counter for created products
    created_count = 0
    
    # Create products for each category
    for category in categories:
        if category.name in products_by_category:
            products_data = products_by_category[category.name]
            
            for product_data in products_data:
                product, created = Product.objects.get_or_create(
                    name=product_data["name"],
                    defaults={
                        'description': product_data["description"],
                        'price': product_data["price"],
                        'category': category,
                        'tag': random.choice(tags)
                    }
                )
                
                if created:
                    created_count += 1
                    print(f"Created product: {product_data['name']} in category {category.name}")
                else:
                    print(f"Product already exists: {product_data['name']}")
    
    print(f"\nCreated {created_count} new products in total.")

if __name__ == "__main__":
    print("Creating categories and products...")
    categories = create_categories()
    create_products(categories)
    print("Done!") 