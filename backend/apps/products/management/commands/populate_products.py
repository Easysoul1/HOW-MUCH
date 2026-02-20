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
                'description': 'Imported white rice',
                'category': created_categories['Grains & Cereals'],
                'sizes': ['5kg', '10kg', '25kg', '50kg']
            },
            {
                'name': 'Brown Beans',
                'sku': 'BEANS-BR-001',
                'description': 'Brown beans (Oloyin)',
                'category': created_categories['Grains & Cereals'],
                'sizes': ['5kg', '10kg', '25kg', '50kg']
            },
            {
                'name': 'White Beans',
                'sku': 'BEANS-WH-001',
                'description': 'White beans (Ewa Oloyin)',
                'category': created_categories['Grains & Cereals'],
                'sizes': ['5kg', '10kg', '25kg', '50kg']
            },
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
                'sizes': ['5kg', '10kg']
            },
            {
                'name': 'Tomatoes (Fresh)',
                'sku': 'TOMATO-FRESH-001',
                'description': 'Fresh tomatoes',
                'category': created_categories['Vegetables'],
                'sizes': ['1 basket', '1 derica', '2 derica']
            },
            {
                'name': 'Onions',
                'sku': 'ONION-001',
                'description': 'Fresh onions',
                'category': created_categories['Vegetables'],
                'sizes': ['1 bag', '5kg', '10kg']
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
