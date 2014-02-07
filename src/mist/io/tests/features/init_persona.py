import pickle
from shutil import copyfile
import os
import random

def main():

    try:
        files_dir = "src/mist/io/tests/features/"
        files = os.listdir(files_dir)
        if not "test_config.py" in files:
            copyfile(files_dir+"test_config.py.dist", files_dir+"test_config.py")

        if "persona.pickle" in files:
            os.remove("persona.pickle")
    except:
        pass

    from test_config import CREDENTIALS, MISTCREDS, TESTNAMES

    PERSONAS = {
        'NinjaTester': dict(
            creds=CREDENTIALS,
            mistcreds=MISTCREDS,
            machine_name=TESTNAMES['machine_name']+str(random.randint(1, 10000)),
            image_machine=TESTNAMES['image_machine']+str(random.randint(1, 10000)),
            key_name=TESTNAMES['key']+str(random.randint(1, 10000))
        ),
        'MonitorTester': dict(
            creds=CREDENTIALS,
            mistcreds=MISTCREDS,
            machine_name=TESTNAMES['machine_name']+str(random.randint(1, 10000)),
            image_machine=TESTNAMES['image_machine']+str(random.randint(1, 10000)),
            key_name=TESTNAMES['key']+str(random.randint(1, 10000))
        ),
        'ShellTester': dict(
            creds=CREDENTIALS,
            mistcreds=MISTCREDS,
            machine_name=TESTNAMES['machine_name']+str(random.randint(1, 10000)),
            image_machine=TESTNAMES['image_machine']+str(random.randint(1, 10000)),
            key_name=TESTNAMES['key']+str(random.randint(1, 10000))
        )
    }

    pickle_file = "src/mist/io/tests/features/persona.pickle"

    pickle.dump(PERSONAS, open(pickle_file, "wb"))

if __name__ == '__main__':
    main()