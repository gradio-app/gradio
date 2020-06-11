from argparse import ArgumentParser
import gradio
import numpy as np
import signal
import time

parser = ArgumentParser(description='Arguments for Building Interface')
parser.add_argument('-i', '--inputs', type=str, help="name of input interface")
parser.add_argument('-o', '--outputs', type=str, help="name of output interface")
parser.add_argument('-d', '--delay', type=int, help="delay in processing", default=0)
share_parser = parser.add_mutually_exclusive_group(required=False)
share_parser.add_argument('--share', dest='share', action='store_true')
share_parser.add_argument('--no-share', dest='share', action='store_false')
parser.set_defaults(share=False)
args = parser.parse_args()


def mdl(input):
  time.sleep(args.delay)
  return np.array(1) 


def launch_interface(args):
    io = gradio.Interface(inputs=args.inputs, outputs=args.outputs, model=mdl, model_type='pyfunc')
    httpd, _, _ = io.launch(share=args.share, validate=False)

    class ServiceExit(Exception):
        """
        Custom exception which is used to trigger the clean exit
        of all running threads and the main program.
        """
        pass

    def service_shutdown(signum, frame):
        print('Shutting server down due to signal {}'.format(signum))
        httpd.shutdown()
        raise ServiceExit

    signal.signal(signal.SIGTERM, service_shutdown)
    signal.signal(signal.SIGINT, service_shutdown)

    try:
        # Keep the main thread running, otherwise signals are ignored.
        while True:
            time.sleep(0.5)
    except ServiceExit:
        pass


if __name__ == "__main__":
    launch_interface(args)
