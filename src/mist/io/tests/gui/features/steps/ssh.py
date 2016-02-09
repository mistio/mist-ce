import re

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import NoSuchElementException

from mist.io.tests.gui.features.steps.general import *


def is_ssh_connection_up(lines):
    errors = ['disconnected', 'timeout', 'timed out', 'closure', 'broken']
    for line in lines:
        for error in errors:
            if error in line.lower():
                return False
    return True


def update_lines(terminal, lines):
    """
    Scans through the terminal lines to find new ones and update any line that
    has changed(for example when a command is given and enter is pressed).
    """
    starting_lines = len(lines)
    line_has_been_updated = False
    all_lines = terminal.find_elements_by_tag_name('div')
    safety_counter = max_safety_count = 5
    for i in range(0, len(all_lines)):
        line = safe_get_element_text(all_lines[i]).rstrip().lstrip()
        if line:
            if i < starting_lines and lines[i] != line:
                lines[i] = line
                line_has_been_updated = True
            elif i >= starting_lines:
                lines.append(line)
        safety_counter = safety_counter - 1 if not line else max_safety_count
        if safety_counter == 0:
            break
    return starting_lines < len(lines) or line_has_been_updated


def check_ls_output(lines, filename=None):
    """
    Checks the output of the ls command and if a filename is provided whether
    or not the file is included in the output of the ls command
    """
    command_output_end_line = len(lines)
    command_output_start_line = 0
    # find where the ls output starts and ends
    for i in range(len(lines)-1, 0, -1):
        if re.search("total\s\d+", lines[i]) and \
                re.search(":.*\$.*.*ls.*", lines[i-1]) and \
                command_output_start_line < i:
            command_output_start_line = i
            break
        if re.search(":.*\$.*", lines[i]) and command_output_end_line > i:
            command_output_end_line = i - 1
    if command_output_start_line == 0:
        assert False, "Could not find the output of the ls command. Contents" \
                      " of the terminal are: %s" % lines
    if not filename:
        return True
    for i in range(command_output_end_line, command_output_start_line, -1):
        if filename in lines[i]:
            return True
    assert False, "File with name %s is not listed in the output of the ls " \
                  "command. Contents of the terminal are: %s" & lines


def check_ssh_connection_with_timeout(context,
                                      connection_timeout=200,
                                      filename=None):
    end_time = time() + 10
    terminal = None
    while time() < end_time:
        try:
            terminal = context.browser.find_element_by_class_name('terminal')
            sleep(1)
            break
        except NoSuchElementException:
            sleep(1)
    assert terminal, "Terminal has not opened 10 seconds after pressing the " \
                     "button. Aborting!"

    connection_max_time = time() + connection_timeout
    lines = []

    # waiting for input to become available
    while time() < connection_max_time:
        if update_lines(terminal, lines):
            assert is_ssh_connection_up(lines), "Error while using shell"
            if re.search(":(.*)\$\s?$", lines[-1]):
                break
        assert time() + 1 < connection_max_time, "Shell hasn't connected after"\
                                                 " %s seconds. Aborting!"\
                                                 % connection_timeout
        sleep(1)

    terminal.send_keys("ls -l\n")
    # remove the last line so that it can be updated since the command has
    # been added
    lines = lines[:-1]
    command_end_time = time() + 20
    # waiting for command output to be returned
    while time() < command_end_time:
        # if the command output has finished being printed
        if update_lines(terminal, lines):
            assert is_ssh_connection_up(lines), "Connection is broken"
            # If it looks like the execution of the command has finished
            if re.search(":(.*)\$\s?$", lines[-1]):
                try:
                    # look if the result has returned
                    check_ls_output(lines, filename)
                    return
                except AssertionError as e:
                    if time() > command_end_time:
                        raise e
        sleep(1)
    assert False, "Command output took too long"


@step(u'I test the ssh connection')
def check_ssh_connection(context):
    """
    This step will press the shell button and wait for the connection to be
    established and then will try to execute a command in the server and
    get some output.
    """
    check_ssh_connection_with_timeout(context)


@step(u'I test the ssh connection for max {seconds} seconds')
def check_ssh_connection_for_max_seconds(context, seconds):
    """
    This step will press the shell button and wait for the connection to be
    established and then will try to execute a command in the server and
    get some output.
    """
    check_ssh_connection_with_timeout(context, connection_timeout=int(seconds))


@step(u'I test the ssh connection looking for file "{filename}"')
def check_ssh_connection_for_file(context, filename):
    """
    This step will press the shell button and wait for the connection to be
    established and then will try to execute a command in the server and
    check if the script touch ~/kati succeeded by compare the file modification time.
    """
    check_ssh_connection_with_timeout(context, filename=filename)


@step('I test the ssh connection {times} times for max {seconds} seconds each'
      ' time')
def multi_ssh_test(context, times, seconds):
    multi_ssh_test_for_file(context, times, seconds, None)


@step('I test the ssh connection {times} times for max {seconds} seconds each'
      ' time looking for file "{filename}"')
def multi_ssh_test_for_file(context, times, seconds, filename):
    assert int(times) > 0, "You should test ssh a positive number of times"
    for i in range(int(times)):
        assertion_error = None
        context.execute_steps(u'Then I click the button "Shell"')
        try:
            check_ssh_connection_with_timeout(context, int(seconds), filename)
        except AssertionError as e:
            assertion_error = e
            if i == int(times) - 1:
                assert False, "Connection has not been established. Last error " \
                              "encountered was:\n%s" % repr(assertion_error)
        sleep(2)
        clicketi_click(context, context.browser.find_element_by_id('shell-back'))
        WebDriverWait(context.browser, 4).until(EC.invisibility_of_element_located((By.CLASS_NAME, 'terminal')))
        if not assertion_error:
            return
