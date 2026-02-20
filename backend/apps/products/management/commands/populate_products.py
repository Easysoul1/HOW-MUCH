from django.core.management.base import BaseCommand
from apps.products.models import Category, UnitOfMeasurement, ProductSize, Product


class Command(BaseCommand):
    help = 'Populate database with initial Nigerian grocery products'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creating initial data...')
        
        # Create Units of Measurement
        units_data = [
            {'name': 'Kilogram', 'abbreviation': 'kg'},
            {'name': 'Gram', 'abbreviation': 'g'},
            {'name': 'Litre', 'abbreviation': 'L'},
            {'name': 'Millilitre', 'abbreviation': 'mL'},
            {'name': 'Piece', 'abbreviation': 'pc'},
            {'name': 'Tuber', 'abbreviation': 'tuber'},
            {'name': 'Basket', 'abbreviation': 'basket'},
            {'name': 'Bag', 'abbreviation': 'bag'},
            {'name': 'Derica', 'abbreviation': 'derica'},
            {'name': 'Mudu', 'abbreviation': 'mudu'},
        ]
        
        for unit_data in units_data:
            unit, created = UnitOfMeasurement.objects.get_or_create(**unit_data)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created unit: {unit}'))
        
        # Get common units
        kg = UnitOfMeasurement.objects.get(abbreviation='kg')
        tuber = UnitOfMeasurement.objects.get(abbreviation='tuber')
        bag = UnitOfMeasurement.objects.get(abbreviation='bag')
        derica = UnitOfMeasurement.objects.get(abbreviation='derica')
        
        # Create Product Sizes
        sizes_data = [
            # Rice/Beans sizes
            {'name': '5kg', 'value': 5, 'unit': kg},
            {'name': '10kg', 'value': 10, 'unit': kg},
            {'name': '25kg', 'value': 25, 'unit': kg},
            {'name': '50kg', 'value': 50, 'unit': kg},
            # Yam sizes
            {'name': '1 tuber', 'value': 1, 'unit': tuber},
            {'name': '5 tubers', 'value': 5, 'unit': tuber},
            {'name': '10 tubers', 'value': 10, 'unit': tuber},
            # Bag sizes
            {'name': '1 bag', 'value': 1, 'unit': bag},
            # Derica sizes
            {'name': '1 derica', 'value': 1, 'unit': derica},
            {'name': '2 derica', 'value': 2, 'unit': derica},
        ]
        
        created_sizes = {}
        for size_data in sizes_data:
            size, created = ProductSize.objects.get_or_create(**size_data)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created size: {size}'))
            created_sizes[size_data['name']] = size
        
        # Create Categories
        categories_data = [
            {'name': 'Grains & Cereals', 'description': 'Rice, beans, maize, wheat, etc.'},
            {'name': 'Tubers', 'description': 'Yam, cassava, potatoes, etc.'},
            {'name': 'Vegetables', 'description': 'Tomatoes, peppers, onions, etc.'},
            {'name': 'Fruits', 'description': 'Bananas, oranges, pineapples, etc.'},
            {'name': 'Proteins', 'description': 'Fish, meat, chicken, eggs, etc.'},
            {'name': 'Cooking Essentials', 'description': 'Oil, salt, seasoning, etc.'},
            {'name': 'Beverages', 'description': 'Water, soft drinks, juices, etc.'},
        ]
        
        created_categories = {}
        for cat_data in categories_data:
            category, created = Category.objects.get_or_create(
                name=cat_data['name'],
                defaults={'description': cat_data['description']}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created category: {category}'))
            created_categories[cat_data['name']] = category
        
        # Create Sample Products
        products_data = [
            # GRAINS & CEREALS
            {
                'name': 'White Rice (Local)',
                'sku': 'RICE-WH-LOCAL-001',
                'description': 'Locally produced white rice',
                'category': created_categories['Grains & Cereals'],
                'sizes': ['5kg', '10kg', '25kg', '50kg']
            },
            {
                'name': 'White Rice (Foreign)',
                'sku': 'RICE-WH-FOREIGN-001',
                'description': 'Imported white rice - Royal Stallion, Cap Rice, Mama Gold',
                'category': created_categories['Grains & Cereals'],
                'sizes': ['5kg', '10kg', '25kg', '50kg']
            },
            {
                'name': 'Basmati Rice',
                'sku': 'RICE-BASMATI-001',
                'description': 'Imported Basmati rice',
                'category': created_categories['Grains & Cereals'],
                'sizes': ['5kg', '10kg', '25kg']
            },
            {
                'name': 'Brown Beans (Oloyin)',
                'sku': 'BEANS-BR-001',
                'description': 'Brown beans - Honey beans',
                'category': created_categories['Grains & Cereals'],
                'sizes': ['1 derica', '2 derica', '5kg', '10kg', '25kg', '50kg']
            },
            {
                'name': 'White Beans',
                'sku': 'BEANS-WH-001',
                'description': 'White beans (Ewa Oloyin)',
                'category': created_categories['Grains & Cereals'],
                'sizes': ['1 derica', '2 derica', '5kg', '10kg', '25kg']
            },
            {
                'name': 'Garri (White)',
                'sku': 'GARRI-WH-001',
                'description': 'White garri - Ijebu garri',
                'category': created_categories['Grains & Cereals'],
                'sizes': ['1 derica', '2 derica', '5kg', '10kg']
            },
            {
                'name': 'Garri (Yellow)',
                'sku': 'GARRI-YL-001',
                'description': 'Yellow garri',
                'category': created_categories['Grains & Cereals'],
                'sizes': ['1 derica', '2 derica', '5kg', '10kg']
            },
            {
                'name': 'Maize (Corn)',
                'sku': 'MAIZE-001',
                'description': 'Dry yellow maize',
                'category': created_categories['Grains & Cereals'],
                'sizes': ['1 derica', '2 derica', '10kg', '25kg', '50kg']
            },
            {
                'name': 'Guinea Corn (Dawa)',
                'sku': 'GUINEA-CORN-001',
                'description': 'Guinea corn - Sorghum',
                'category': created_categories['Grains & Cereals'],
                'sizes': ['1 derica', '5kg', '10kg']
            },
            {
                'name': 'Millet',
                'sku': 'MILLET-001',
                'description': 'Millet grains',
                'category': created_categories['Grains & Cereals'],
                'sizes': ['1 derica', '5kg', '10kg']
            },
            
            # TUBERS
            {
                'name': 'Yam',
                'sku': 'YAM-001',
                'description': 'Fresh yam tubers',
                'category': created_categories['Tubers'],
                'sizes': ['1 tuber', '5 tubers', '10 tubers']
            },
            {
                'name': 'Sweet Potato',
                'sku': 'POTATO-SWEET-001',
                'description': 'Fresh sweet potatoes',
                'category': created_categories['Tubers'],
                'sizes': ['5kg', '10kg', '25kg']
            },
            {
                'name': 'Irish Potato',
                'sku': 'POTATO-IRISH-001',
                'description': 'Irish potatoes',
                'category': created_categories['Tubers'],
                'sizes': ['5kg', '10kg', '25kg', '50kg']
            },
            {
                'name': 'Cassava',
                'sku': 'CASSAVA-001',
                'description': 'Fresh cassava tubers',
                'category': created_categories['Tubers'],
                'sizes': ['1 tuber', '5 tubers', '10 tubers']
            },
            
            # VEGETABLES
            {
                'name': 'Tomatoes (Fresh)',
                'sku': 'TOMATO-FRESH-001',
                'description': 'Fresh tomatoes',
                'category': created_categories['Vegetables'],
                'sizes': ['1 basket', '1 derica', '2 derica']
            },
            {
                'name': 'Pepper (Tatase)',
                'sku': 'PEPPER-TATASE-001',
                'description': 'Fresh red bell peppers',
                'category': created_categories['Vegetables'],
                'sizes': ['1 basket', '1 derica', '2 derica']
            },
            {
                'name': 'Pepper (Rodo/Shombo)',
                'sku': 'PEPPER-RODO-001',
                'description': 'Fresh scotch bonnet peppers',
                'category': created_categories['Vegetables'],
                'sizes': ['1 basket', '1 derica', '2 derica']
            },
            {
                'name': 'Onions (Bulb)',
                'sku': 'ONION-001',
                'description': 'Fresh onions - Big onions',
                'category': created_categories['Vegetables'],
                'sizes': ['1 bag', '5kg', '10kg', '25kg']
            },
            {
                'name': 'Ugu (Pumpkin Leaves)',
                'sku': 'UGU-001',
                'description': 'Fresh ugu leaves',
                'category': created_categories['Vegetables'],
                'sizes': ['1 basket']
            },
            {
                'name': 'Waterleaf',
                'sku': 'WATERLEAF-001',
                'description': 'Fresh waterleaf',
                'category': created_categories['Vegetables'],
                'sizes': ['1 basket']
            },
            {
                'name': 'Bitter Leaf',
                'sku': 'BITTERLEAF-001',
                'description': 'Fresh bitter leaf',
                'category': created_categories['Vegetables'],
                'sizes': ['1 basket']
            },
            {
                'name': 'Okra (Fresh)',
                'sku': 'OKRA-001',
                'description': 'Fresh okra',
                'category': created_categories['Vegetables'],
                'sizes': ['1 basket', '1 derica']
            },
            
            # FRUITS
            {
                'name': 'Plantain (Ripe)',
                'sku': 'PLANTAIN-RIPE-001',
                'description': 'Ripe plantain',
                'category': created_categories['Fruits'],
                'sizes': ['1 basket']
            },
            {
                'name': 'Plantain (Unripe)',
                'sku': 'PLANTAIN-UNRIPE-001',
                'description': 'Unripe plantain',
                'category': created_categories['Fruits'],
                'sizes': ['1 basket']
            },
            {
                'name': 'Banana',
                'sku': 'BANANA-001',
                'description': 'Fresh bananas',
                'category': created_categories['Fruits'],
                'sizes': ['1 basket']
            },
            {
                'name': 'Orange',
                'sku': 'ORANGE-001',
                'description': 'Fresh oranges',
                'category': created_categories['Fruits'],
                'sizes': ['1 basket', '10kg']
            },
            {
                'name': 'Watermelon',
                'sku': 'WATERMELON-001',
                'description': 'Fresh watermelon',
                'category': created_categories['Fruits'],
                'sizes': ['1 basket']
            },
            {
                'name': 'Pineapple',
                'sku': 'PINEAPPLE-001',
                'description': 'Fresh pineapple',
                'category': created_categories['Fruits'],
                'sizes': ['1 basket']
            },
            
            # PROTEINS
            {
                'name': 'Frozen Chicken',
                'sku': 'CHICKEN-FROZEN-001',
                'description': 'Frozen whole chicken',
                'category': created_categories['Proteins'],
                'sizes': ['5kg', '10kg']
            },
            {
                'name': 'Fresh Fish (Titus)',
                'sku': 'FISH-TITUS-001',
                'description': 'Frozen titus/mackerel',
                'category': created_categories['Proteins'],
                'sizes': ['1 basket', '5kg', '10kg']
            },
            {
                'name': 'Dry Fish (Panla)',
                'sku': 'FISH-PANLA-001',
                'description': 'Dried hake fish',
                'category': created_categories['Proteins'],
                'sizes': ['5kg', '10kg']
            },
            {
                'name': 'Stockfish',
                'sku': 'FISH-STOCK-001',
                'description': 'Dried stockfish (Okporoko)',
                'category': created_categories['Proteins'],
                'sizes': ['5kg']
            },
            {
                'name': 'Crayfish',
                'sku': 'CRAYFISH-001',
                'description': 'Dried crayfish',
                'category': created_categories['Proteins'],
                'sizes': ['1 derica', '5kg']
            },
            {
                'name': 'Eggs (Crate)',
                'sku': 'EGGS-001',
                'description': 'Fresh eggs - 30 pieces per crate',
                'category': created_categories['Proteins'],
                'sizes': ['1 basket']
            },
            
            # COOKING ESSENTIALS
            {
                'name': 'Palm Oil',
                'sku': 'OIL-PALM-001',
                'description': 'Red palm oil',
                'category': created_categories['Cooking Essentials'],
                'sizes': ['5kg', '10kg', '25kg']
            },
            {
                'name': 'Groundnut Oil',
                'sku': 'OIL-GROUNDNUT-001',
                'description': 'Groundnut/peanut oil',
                'category': created_categories['Cooking Essentials'],
                'sizes': ['5kg', '10kg', '25kg']
            },
            {
                'name': 'Vegetable Oil',
                'sku': 'OIL-VEG-001',
                'description': 'Vegetable oil - Devon Kings, Power Oil',
                'category': created_categories['Cooking Essentials'],
                'sizes': ['5kg', '10kg', '25kg']
            },
            {
                'name': 'Salt',
                'sku': 'SALT-001',
                'description': 'Table salt',
                'category': created_categories['Cooking Essentials'],
                'sizes': ['1 derica', '5kg', '10kg']
            },
            {
                'name': 'Maggi (Seasoning)',
                'sku': 'MAGGI-001',
                'description': 'Maggi seasoning cubes',
                'category': created_categories['Cooking Essentials'],
                'sizes': ['1 basket']
            },
            {
                'name': 'Curry Powder',
                'sku': 'CURRY-001',
                'description': 'Curry powder',
                'category': created_categories['Cooking Essentials'],
                'sizes': ['1 basket']
            },
            {
                'name': 'Thyme',
                'sku': 'THYME-001',
                'description': 'Dried thyme',
                'category': created_categories['Cooking Essentials'],
                'sizes': ['1 basket']
            },
        ]
        
        for product_data in products_data:
            sizes = product_data.pop('sizes')
            product, created = Product.objects.get_or_create(
                sku=product_data['sku'],
                defaults=product_data
            )
            
            if created:
                # Add sizes
                for size_name in sizes:
                    if size_name in created_sizes:
                        product.available_sizes.add(created_sizes[size_name])
                
                self.stdout.write(self.style.SUCCESS(f'Created product: {product}'))
        
        self.stdout.write(self.style.SUCCESS('Successfully populated initial data!'))
