import os

from gradio import encryptor, processing_utils
from gradio.media_data import BASE64_IMAGE

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


class TestKeyGenerator:
    def test_same_pass(self):
        key1 = encryptor.get_key("test")
        key2 = encryptor.get_key("test")
        assert key1 == key2

    def test_diff_pass(self):
        key1 = encryptor.get_key("test")
        key2 = encryptor.get_key("diff_test")
        assert key1 != key2


class TestEncryptorDecryptor:
    def test_same_pass(self):
        key = encryptor.get_key("test")
        data, _ = processing_utils.decode_base64_to_binary(BASE64_IMAGE)
        encrypted_data = encryptor.encrypt(key, data)
        decrypted_data = encryptor.decrypt(key, encrypted_data)
        assert data == decrypted_data
