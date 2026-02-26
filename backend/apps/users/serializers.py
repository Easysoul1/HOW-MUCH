from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'user_type', 'phone_number', 'address', 'city', 'state',
            'latitude', 'longitude', 'is_verified', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'username', 'user_type', 'is_verified', 'created_at', 'updated_at')


# Types that can be self-registered via the public API
ALLOWED_REGISTRATION_TYPES = {'CUSTOMER', 'VENDOR', 'CROWDSOURCER'}


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = (
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'user_type', 'phone_number',
            'address', 'city', 'state', 'latitude', 'longitude'
        )

    def validate_user_type(self, value):
        if value not in ALLOWED_REGISTRATION_TYPES:
            raise serializers.ValidationError(
                "Invalid user type. Registration is only open to customers, vendors, and crowdsourcers."
            )
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            user_type=validated_data.get('user_type', 'CUSTOMER'),
            phone_number=validated_data.get('phone_number', ''),
            address=validated_data.get('address', ''),
            city=validated_data.get('city', ''),
            state=validated_data.get('state', ''),
            latitude=validated_data.get('latitude'),
            longitude=validated_data.get('longitude'),
        )
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change"""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(
        required=True, write_only=True, validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError(
                {"new_password": "Password fields didn't match."}
            )
        return attrs
