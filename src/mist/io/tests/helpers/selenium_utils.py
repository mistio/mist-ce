from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

try:
    from mist.io.tests.settings import selenium_hub, LOCAL, CHROMEDRIVER_PATH, PHANTOMJS_PATH, BROWSER_LOCAL, BROWSER_FLAVOR
except ImportError:
    pass


def choose_driver(flavor="firefox"):
    """
    Returns an instant of a remote selenium driver
    """

    if BROWSER_FLAVOR:
        flavor = BROWSER_FLAVOR

    if BROWSER_LOCAL:
        if flavor == "firefox":
            driver = webdriver.Firefox()
        elif flavor == "chrome":
            driver = webdriver.Chrome(executable_path=CHROMEDRIVER_PATH)
        elif flavor == "phantomjs":
            driver = webdriver.PhantomJS(executable_path=PHANTOMJS_PATH)
        else:
            raise Exception("%s is not supported!" % flavor)
    else:
        driver = webdriver.Remote(command_executor=selenium_hub, desired_capabilities=DesiredCapabilities.FIREFOX)

    return driver