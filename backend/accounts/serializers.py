from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password

from constants import *
from .models import CUser, PasswordReset
from .utils import generate_email_verification_token
from notifications.tasks import (send_confirm_email_notification_task)

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CUser
        fields = ["full_name", "email", "email_verified", "contact_number"]
        read_only_fields = ['email_verified']

    def validate_username(self, value):
        if CUser.objects.filter(username=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("This username is already taken.")

        return value

    def validate_email(self, value):
        if "+" in value:
            raise serializers.ValidationError("Invalid email.")

        if CUser.objects.filter(username=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("This email is already taken.")

        return value


class SignUpSerializer(serializers.ModelSerializer):
    class Meta:
        model = CUser
        fields = ["full_name", "email", "username", "password"]


    def create(self, validated_data):
        user = CUser.objects.create_user(**validated_data)
        # Generate JWT token for email verification
        email_verification_token = generate_email_verification_token(user)

        # Send confirmation email with the JWT token
        confirmation_link = f"{PROJECT_WEBSITE_NAME_HTTPS}/email/confirm/{email_verification_token}"
        send_confirm_email_notification_task(user.email, confirmation_link)

        return user


class SignInSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField(write_only=True)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate_new_password(self, value):
        validate_password(value)
        return value

    def save(self):
        user = self.context['request'].user
        new_password = self.validated_data['new_password']
        user.set_password(new_password)
        user.save()
        return user


class RequestPasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True)

    def validate_token(self, value):
        try:
            password_reset = PasswordReset.objects.get(token=value)
            if password_reset.is_expired():
                password_reset.delete()
                raise serializers.ValidationError("Password reset link has expired")
        except PasswordReset.DoesNotExist:
            raise serializers.ValidationError("Invalid token")

        # Add the password_reset instance to the serializer context
        self.context['password_reset'] = password_reset
        return value

    def validate_new_password(self, value):
        validate_password(value)
        return value

    def save(self):
        # Retrieve the password_reset instance from the context
        password_reset = self.context['password_reset']

        # Retrieve the user associated with the password reset request
        user = password_reset.email  # Since `email` is a ForeignKey to `CUser`
        new_password = self.validated_data['new_password']

        # Set the new password for the user
        user.set_password(new_password)
        user.save()

        # Delete the password reset record to prevent reuse
        password_reset.delete()
        return user

