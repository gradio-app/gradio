from argparse import ArgumentParser
import gradio

parser = ArgumentParser(description='Arguments for Building Interface')
parser.add_argument('-i', '--inputs', type=str, help="name of input interface")
parser.add_argument('-o', '--outputs', type=str, help="name of output interface")
args = parser.parse_args()


def launch_interface(args):
    io = gradio.Interface(inputs=args.inputs, outputs=args.outputs, model=lambda x:x, model_type='function')
    io.launch()


if __name__ == "__main__":
    launch_interface(args)
