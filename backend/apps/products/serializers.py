from rest_framework import serializers
from .models import Category, UnitOfMeasurement, ProductSize, Product, ProductImage, SizeRequest


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
    label = serializers.CharField(required=False)
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = ProductSize
        fields = ('id', 'label', 'value', 'unit', 'unit_id', 'display_name')

    def get_display_name(self, obj):
        return str(obj)


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ('id', 'product', 'image', 'alt_text', 'is_primary', 'created_at')
        read_only_fields = ('id', 'created_at')


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for product listings"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    suggested_by_email = serializers.EmailField(source='suggested_by.email', read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'sku', 'category', 'category_name',
            'image', 'status', 'is_active', 'is_featured',
            'suggested_by_email', 'created_at',
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
    suggested_by = serializers.StringRelatedField(read_only=True)
    reviewed_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'sku', 'description',
            'category', 'category_id',
            'available_sizes', 'available_size_ids',
            'image', 'images',
            'status', 'suggested_by', 'reviewed_by', 'reviewed_at', 'rejection_reason',
            'is_active', 'is_featured',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'slug', 'sku', 'suggested_by', 'reviewed_by', 'reviewed_at', 'created_at', 'updated_at')


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating products"""
    sku = serializers.CharField(required=False, allow_blank=True)
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
        """Ensure SKU is unique when provided."""
        if not value:
            return value
        qs = Product.objects.filter(sku=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Product with this SKU already exists.")
        return value


class SizeRequestSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)
    unit_label = serializers.CharField(source='unit.abbreviation', read_only=True)
    requested_by_email = serializers.EmailField(source='requested_by.email', read_only=True)
    size_label = serializers.SerializerMethodField()

    class Meta:
        model = SizeRequest
        fields = (
            'id', 'product', 'product_name', 'product_slug',
            'value', 'unit', 'unit_label', 'size_label',
            'note', 'status', 'requested_by_email',
            'rejection_reason', 'created_at',
        )
        read_only_fields = ('id', 'status', 'requested_by_email', 'rejection_reason', 'created_at')

    def get_size_label(self, obj):
        val = float(obj.value)
        formatted = str(int(val)) if val == int(val) else str(val)
        return f"{formatted}{obj.unit.abbreviation}"
