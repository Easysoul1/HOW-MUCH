from rest_framework import serializers
from .models import Category, UnitOfMeasurement, ProductSize, Product, ProductImage


class CategorySerializer(serializers.ModelSerializer):
    subcategories = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = (
            'id', 'name', 'slug', 'description', 'image',
            'parent', 'subcategories', 'is_active', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'slug', 'created_at', 'updated_at')
    
    def get_subcategories(self, obj):
        if obj.subcategories.exists():
            return CategorySerializer(obj.subcategories.all(), many=True).data
        return []


class UnitOfMeasurementSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnitOfMeasurement
        fields = ('id', 'name', 'abbreviation')


class ProductSizeSerializer(serializers.ModelSerializer):
    unit = UnitOfMeasurementSerializer(read_only=True)
    unit_id = serializers.PrimaryKeyRelatedField(
        queryset=UnitOfMeasurement.objects.all(),
        source='unit',
        write_only=True
    )
    display_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductSize
        fields = ('id', 'name', 'value', 'unit', 'unit_id', 'display_name')
    
    def get_display_name(self, obj):
        return str(obj)


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ('id', 'image', 'alt_text', 'is_primary', 'created_at')
        read_only_fields = ('id', 'created_at')


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product listings"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'sku', 'category', 'category_name',
            'image', 'is_active', 'is_featured'
        )


class ProductDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for product detail view"""
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True
    )
    available_sizes = ProductSizeSerializer(many=True, read_only=True)
    available_size_ids = serializers.PrimaryKeyRelatedField(
        queryset=ProductSize.objects.all(),
        source='available_sizes',
        many=True,
        write_only=True,
        required=False
    )
    images = ProductImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'sku', 'description',
            'category', 'category_id',
            'available_sizes', 'available_size_ids',
            'image', 'images',
            'is_active', 'is_featured',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'slug', 'created_at', 'updated_at')


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating products"""
    available_size_ids = serializers.PrimaryKeyRelatedField(
        queryset=ProductSize.objects.all(),
        source='available_sizes',
        many=True,
        required=False
    )
    
    class Meta:
        model = Product
        fields = (
            'name', 'sku', 'description', 'category',
            'available_size_ids', 'image',
            'is_active', 'is_featured'
        )
    
    def validate_sku(self, value):
        """Ensure SKU is unique"""
        if self.instance:
            # Update case
            if Product.objects.exclude(pk=self.instance.pk).filter(sku=value).exists():
                raise serializers.ValidationError("Product with this SKU already exists.")
        else:
            # Create case
            if Product.objects.filter(sku=value).exists():
                raise serializers.ValidationError("Product with this SKU already exists.")
        return value
