# Start Docker service
!service docker start

# Download and start Anbox Docker container
!docker pull anbox/anbox
!docker run -d --privileged --name android-emulator -p 5037:5037 -p 5555:5555 anbox/anbox

# Wait for the emulator to be fully initialized
import time
time.sleep(30)  # Allow the container to initialize

# Connect ADB to the emulator
!adb connect localhost:5555

# Install TextNow or any other VoIP app
!adb install https://download-link-to-textnow.apk  # Replace with a valid APK download link

# Start Appium server
!npm install -g appium
!appium &

# Automation script to send SMS using Appium
from appium import webdriver
import random

# Configurations
APPIUM_SERVER_URL = "http://localhost:4723/wd/hub"
SMS_RECIPIENTS = ["+1234567890", "+0987654321"]  # Replace with valid phone numbers
SMS_MESSAGE = "Hello! This is a test SMS from an automated system."

DESIRED_CAPS = {
    "platformName": "Android",
    "deviceName": "Android Emulator",
    "appPackage": "com.enflick.android.TextNow",  # Replace with the app's package name
    "appActivity": "com.textnow.activity.LauncherActivity",  # Replace with the app's activity
    "noReset": True
}

def send_sms(driver, recipient, message):
    try:
        # Open the new message screen
        driver.find_element_by_accessibility_id("New Message").click()
        time.sleep(2)

        # Input the recipient's number
        recipient_field = driver.find_element_by_id("com.enflick.android.TextNow:id/recipient")
        recipient_field.send_keys(recipient)
        time.sleep(1)

        # Input the message body
        message_field = driver.find_element_by_id("com.enflick.android.TextNow:id/message_body")
        message_field.send_keys(message)
        time.sleep(1)

        # Click send
        send_button = driver.find_element_by_id("com.enflick.android.TextNow:id/send_button")
        send_button.click()
        time.sleep(2)

        print(f"SMS sent to {recipient}.")
    except Exception as e:
        print(f"Failed to send SMS to {recipient}: {e}")

def main():
    # Connect to the Appium server
    driver = webdriver.Remote(APPIUM_SERVER_URL, DESIRED_CAPS)

    try:
        for recipient in SMS_RECIPIENTS:
            send_sms(driver, recipient, SMS_MESSAGE)
            time.sleep(random.randint(5, 10))  # Random delay to avoid detection
    finally:
        driver.quit()

# Run the automation
main()
