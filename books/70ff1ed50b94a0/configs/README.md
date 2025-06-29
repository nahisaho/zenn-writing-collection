# YAML Configuration Files

This directory contains YAML configuration examples extracted from the Microsoft Entra ID SSO implementation guide. These configurations cover various aspects of SSO setup, from basic authentication to advanced user provisioning.

## Configuration Files Overview

### Basic Authentication Setup
- **`saml-basic-config.yaml`** - Basic SAML 2.0 configuration settings
- **`openid-connect-config.yaml`** - OpenID Connect application configuration
- **`oidc-flow-config.yaml`** - Authentication flow selection guidelines

### Environment Setup
- **`tenant-creation-config.yaml`** - Microsoft Entra ID tenant creation settings
- **`test-user-config.yaml`** - Test user and group configurations
- **`environment-variables-config.yaml`** - Environment variables template

### Application Configurations
- **`spring-boot-oauth2-config.yaml`** - Spring Boot OAuth2 client setup
- **`spring-boot-https-config.yaml`** - HTTPS configuration for local development
- **`dotnet-core-config.yaml`** - .NET Core Microsoft Identity configuration

### SAML-Specific Settings
- **`saml-application-config.yaml`** - SAML application registration in Entra ID
- **`attribute-mapping-config.yaml`** - Claims and attribute mapping configuration
- **`certificate-management-config.yaml`** - Certificate lifecycle management

### Token Management
- **`refresh-token-config.yaml`** - Refresh token management and security
- **`logging-config.yaml`** - Logging configuration for debugging

### User Provisioning
- **`scim-provisioning-config.yaml`** - SCIM 2.0 provisioning configuration
- **`jit-provisioning-config.yaml`** - Just-In-Time provisioning settings

## Usage Instructions

1. **Copy the relevant configuration files** to your project
2. **Replace placeholder values** with your actual Microsoft Entra ID settings
3. **Customize the configurations** based on your specific requirements
4. **Validate the settings** in a development environment before production use

## Security Considerations

- Never commit actual secrets or credentials to version control
- Use environment variables or secure key management systems for sensitive data
- Regularly rotate certificates and secrets
- Review and update configurations based on security best practices

## Configuration Hierarchy

```
Basic Setup → Environment → Application → Security → Advanced Features
     ↓             ↓            ↓           ↓            ↓
SAML/OIDC     Tenant       Spring/.NET   Tokens     Provisioning
  Config      Setup         Config      Management     (SCIM/JIT)
```

## Related Documentation

These configurations are referenced in the following chapters:
- Chapter 1: Microsoft Entra ID とシングルサインオン（SSO）の基礎
- Chapter 2: 開発環境の構築
- Chapter 3: SAML 2.0 による SSO 実装
- Chapter 4: OpenID Connect による SSO 実装
- Chapter 6: ユーザープロビジョニングと同期