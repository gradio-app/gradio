from selenium import webdriver
from selenium.webdriver.common.keys import Keys
import multiprocessing
import time
import requests

URL = "http://localhost:7860"
CHROME_PATH = r"C:\Users\aliab\Desktop\chromedriver.exe"

def interface_thread():
    from diff_texts import io

if __name__ == '__main__':
    i_thread = multiprocessing.Process(target=interface_thread)
    i_thread.start()
    for i in range(10):
        try:
            requests.get(URL)
            print("Interface connected.")
            break
        except:
            time.sleep(1)
    else:
        raise ConnectionError("Could not connect to interface.")
    driver = webdriver.Chrome(CHROME_PATH)
    driver.set_window_size(1200, 800)
    driver.get(URL)
    time.sleep(8)
    elem = driver.find_element_by_css_selector(".input_interface[interface_id='0'] .input_text")
    elem.clear()
    elem.send_keys("Want to see a magic trick?")
    elem = driver.find_element_by_css_selector(".input_interface[interface_id='1'] .input_text")
    elem.clear()
    elem.send_keys("Let's go see a magic trick!")
    elem = driver.find_element_by_css_selector(".submit")
    elem.click()
    time.sleep(3)
    elem = driver.find_element_by_css_selector(".output_interface[interface_id='2'] .output_text")
    assert elem.text == "LeWant's tgo see a magic trick?!"

    IMG_PATH = "diff_image.png"
    driver.save_screenshot(IMG_PATH) # Add tests to compare screenshot with golden screenshot.
    driver.close()
    i_thread.terminate()