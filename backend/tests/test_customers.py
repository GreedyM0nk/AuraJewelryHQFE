import pytest
from pydantic import ValidationError

from app.schemas.customer import CustomerCreate


class TestCustomerCreateNameValidation:
    """Test CustomerCreate name field validation."""

    def test_valid_name(self):
        """Test that valid names are accepted."""
        customer = CustomerCreate(
            name='John Doe',
            email='john@example.com'
        )
        assert customer.name == 'John Doe'

    def test_name_with_leading_trailing_whitespace_stripped(self):
        """Test that leading/trailing whitespace is stripped."""
        customer = CustomerCreate(
            name='  Alice Smith  ',
            email='alice@example.com'
        )
        assert customer.name == 'Alice Smith'

    def test_name_too_short_one_char(self):
        """Test that single character name is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            CustomerCreate(
                name='A',
                email='test@example.com'
            )
        assert 'Name must be at least 2 characters' in str(exc_info.value)

    def test_name_too_short_empty_string(self):
        """Test that empty string is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            CustomerCreate(
                name='',
                email='test@example.com'
            )
        assert 'Name must be at least 2 characters' in str(exc_info.value)

    def test_name_too_short_whitespace_only(self):
        """Test that whitespace-only string is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            CustomerCreate(
                name='   ',
                email='test@example.com'
            )
        assert 'Name must be at least 2 characters' in str(exc_info.value)

    def test_name_maximum_length_valid(self):
        """Test that exactly 200 character name is accepted."""
        long_name = 'A' * 200
        customer = CustomerCreate(
            name=long_name,
            email='test@example.com'
        )
        assert customer.name == long_name

    def test_name_exceeds_maximum_length(self):
        """Test that names exceeding 200 characters are rejected."""
        long_name = 'A' * 201
        with pytest.raises(ValidationError) as exc_info:
            CustomerCreate(
                name=long_name,
                email='test@example.com'
            )
        assert 'Name must not exceed 200 characters' in str(exc_info.value)

    def test_name_with_xss_script_tag(self):
        """Test that HTML/script tags are detected and rejected."""
        with pytest.raises(ValidationError) as exc_info:
            CustomerCreate(
                name='John <script>alert("xss")</script> Doe',
                email='test@example.com'
            )
        assert 'Name contains invalid characters' in str(exc_info.value)

    def test_name_with_html_tags(self):
        """Test that HTML tags are detected and rejected."""
        with pytest.raises(ValidationError) as exc_info:
            CustomerCreate(
                name='Jane <b>Bold</b> Smith',
                email='test@example.com'
            )
        assert 'Name contains invalid characters' in str(exc_info.value)

    def test_name_with_img_tag(self):
        """Test that img tags with onerror are detected and rejected."""
        with pytest.raises(ValidationError) as exc_info:
            CustomerCreate(
                name='Test <img src=x onerror=alert(1)>',
                email='test@example.com'
            )
        assert 'Name contains invalid characters' in str(exc_info.value)

    def test_name_with_iframe_tag(self):
        """Test that iframe tags are detected and rejected."""
        with pytest.raises(ValidationError) as exc_info:
            CustomerCreate(
                name='User <iframe src="evil.com"></iframe>',
                email='test@example.com'
            )
        assert 'Name contains invalid characters' in str(exc_info.value)

    def test_name_with_onclick_attribute(self):
        """Test that event handlers are detected and rejected."""
        with pytest.raises(ValidationError) as exc_info:
            CustomerCreate(
                name='John <span onclick="alert(1)">text</span>',
                email='test@example.com'
            )
        assert 'Name contains invalid characters' in str(exc_info.value)

    def test_name_with_legitimate_punctuation(self):
        """Test that legitimate punctuation is allowed."""
        customer = CustomerCreate(
            name="O'Brien-Smith",
            email='test@example.com'
        )
        assert customer.name == "O'Brien-Smith"

    def test_name_with_numbers(self):
        """Test that numbers are allowed in names."""
        customer = CustomerCreate(
            name='Test User 123',
            email='test@example.com'
        )
        assert customer.name == 'Test User 123'

    def test_name_with_unicode_characters(self):
        """Test that unicode characters are allowed."""
        customer = CustomerCreate(
            name='José García',
            email='test@example.com'
        )
        assert customer.name == 'José García'


class TestCustomerCreatePhoneValidation:
    """Test CustomerCreate phone field validation."""

    def test_phone_optional_none(self):
        """Test that phone can be None (optional field)."""
        customer = CustomerCreate(
            name='John Doe',
            email='john@example.com',
            phone=None
        )
        assert customer.phone is None

    def test_phone_optional_not_provided(self):
        """Test that phone can be omitted."""
        customer = CustomerCreate(
            name='John Doe',
            email='john@example.com'
        )
        assert customer.phone is None

    def test_valid_phone_with_plus_country_code(self):
        """Test that phone with + country code is valid."""
        customer = CustomerCreate(
            name='John Doe',
            email='john@example.com',
            phone='+1-555-1234567'
        )
        assert customer.phone == '+1-555-1234567'

    def test_valid_phone_with_spaces(self):
        """Test that phone with spaces is valid."""
        customer = CustomerCreate(
            name='John Doe',
            email='john@example.com',
            phone='555 123 4567'
        )
        assert customer.phone == '555 123 4567'

    def test_valid_phone_with_dashes(self):
        """Test that phone with dashes is valid."""
        customer = CustomerCreate(
            name='John Doe',
            email='john@example.com',
            phone='555-123-4567'
        )
        assert customer.phone == '555-123-4567'

    def test_valid_phone_with_parentheses(self):
        """Test that phone with parentheses is valid."""
        customer = CustomerCreate(
            name='John Doe',
            email='john@example.com',
            phone='(555) 123-4567'
        )
        assert customer.phone == '(555) 123-4567'

    def test_valid_phone_minimum_length(self):
        """Test that 7-character phone is accepted."""
        customer = CustomerCreate(
            name='John Doe',
            email='john@example.com',
            phone='1234567'
        )
        assert customer.phone == '1234567'

    def test_phone_exceeds_maximum_length(self):
        """Test that phone exceeding 20 characters is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            CustomerCreate(
                name='John Doe',
                email='john@example.com',
                phone='123456789012345678901'  # 21 characters
            )
        assert 'Phone number must not exceed 20 characters' in str(exc_info.value)

    def test_phone_with_leading_trailing_whitespace_stripped(self):
        """Test that phone whitespace is stripped."""
        customer = CustomerCreate(
            name='John Doe',
            email='john@example.com',
            phone='  555-1234567  '
        )
        assert customer.phone == '555-1234567'

    def test_phone_invalid_too_short(self):
        """Test that phone shorter than 7 characters is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            CustomerCreate(
                name='John Doe',
                email='john@example.com',
                phone='123456'  # 6 characters
            )
        assert 'Invalid phone number format' in str(exc_info.value)

    def test_phone_invalid_contains_letters(self):
        """Test that phone with letters (non-digits) is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            CustomerCreate(
                name='John Doe',
                email='john@example.com',
                phone='555-CALL-NOW'
            )
        assert 'Invalid phone number format' in str(exc_info.value)

    def test_phone_invalid_special_characters(self):
        """Test that phone with invalid special characters is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            CustomerCreate(
                name='John Doe',
                email='john@example.com',
                phone='555@123#4567'
            )
        assert 'Invalid phone number format' in str(exc_info.value)

    def test_phone_valid_all_digits(self):
        """Test that all-digit phone is valid."""
        customer = CustomerCreate(
            name='John Doe',
            email='john@example.com',
            phone='5551234567'
        )
        assert customer.phone == '5551234567'


class TestCustomerCreateCountryValidation:
    """Test CustomerCreate country field validation."""

    def test_country_default_value(self):
        """Test that country defaults to 'Unknown'."""
        customer = CustomerCreate(
            name='John Doe',
            email='john@example.com'
        )
        assert customer.country == 'Unknown'

    def test_valid_country(self):
        """Test that valid country name is accepted."""
        customer = CustomerCreate(
            name='John Doe',
            email='john@example.com',
            country='India'
        )
        assert customer.country == 'India'

    def test_country_minimum_length(self):
        """Test that 2-character country is accepted."""
        customer = CustomerCreate(
            name='John Doe',
            email='john@example.com',
            country='US'
        )
        assert customer.country == 'US'

    def test_country_too_short(self):
        """Test that single character country is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            CustomerCreate(
                name='John Doe',
                email='john@example.com',
                country='U'
            )
        assert 'Country must be at least 2 characters' in str(exc_info.value)

    def test_country_empty_string(self):
        """Test that empty string country is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            CustomerCreate(
                name='John Doe',
                email='john@example.com',
                country=''
            )
        assert 'Country must be at least 2 characters' in str(exc_info.value)

    def test_country_whitespace_only(self):
        """Test that whitespace-only country is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            CustomerCreate(
                name='John Doe',
                email='john@example.com',
                country='   '
            )
        assert 'Country must be at least 2 characters' in str(exc_info.value)

    def test_country_maximum_length(self):
        """Test that exactly 100 character country is accepted."""
        long_country = 'A' * 100
        customer = CustomerCreate(
            name='John Doe',
            email='john@example.com',
            country=long_country
        )
        assert customer.country == long_country

    def test_country_exceeds_maximum_length(self):
        """Test that country exceeding 100 characters is rejected."""
        long_country = 'A' * 101
        with pytest.raises(ValidationError) as exc_info:
            CustomerCreate(
                name='John Doe',
                email='john@example.com',
                country=long_country
            )
        assert 'Country name too long' in str(exc_info.value)

    def test_country_with_leading_trailing_whitespace_stripped(self):
        """Test that country whitespace is stripped."""
        customer = CustomerCreate(
            name='John Doe',
            email='john@example.com',
            country='  United States  '
        )
        assert customer.country == 'United States'


class TestCustomerCreateIntegration:
    """Integration tests for CustomerCreate with multiple validations."""

    def test_valid_complete_customer(self):
        """Test that a completely valid customer is accepted."""
        customer = CustomerCreate(
            name='John Michael Doe',
            email='john.doe@example.com',
            phone='+91-9876543210',
            country='India'
        )
        assert customer.name == 'John Michael Doe'
        assert customer.email == 'john.doe@example.com'
        assert customer.phone == '+91-9876543210'
        assert customer.country == 'India'

    def test_invalid_name_and_phone(self):
        """Test that multiple validation errors are caught."""
        with pytest.raises(ValidationError) as exc_info:
            CustomerCreate(
                name='<script>alert(1)</script>',
                email='test@example.com',
                phone='invalid'
            )
        errors = exc_info.value.errors()
        assert len(errors) >= 1  # At least one validation error

    def test_sanitization_preserves_legitimate_text(self):
        """Test that bleach sanitization doesn't remove legitimate content."""
        customer = CustomerCreate(
            name="Mary O'Connor-Smith Jr.",
            email='mary@example.com'
        )
        assert customer.name == "Mary O'Connor-Smith Jr."

    def test_html_entity_detection(self):
        """Test that HTML-like content is properly sanitized."""
        # bleach.clean strips tags but leaves text, so "Test &lt;" becomes "Test &lt;"
        # A name with actual HTML markup would be rejected
        with pytest.raises(ValidationError):
            CustomerCreate(
                name='Test <svg onload="alert(1)">name</svg>',
                email='test@example.com'
            )

    def test_minimal_valid_customer(self):
        """Test that minimal required fields create valid customer."""
        customer = CustomerCreate(
            name='Jo',
            email='test@example.com'
        )
        assert customer.name == 'Jo'
        assert customer.email == 'test@example.com'
        assert customer.phone is None
        assert customer.country == 'Unknown'
