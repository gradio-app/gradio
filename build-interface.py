from argparse import ArgumentParser
import gradio
import numpy as np

parser = ArgumentParser(description='Arguments for Building Interface')
parser.add_argument('-i', '--inputs', type=str, help="name of input interface")
parser.add_argument('-o', '--outputs', type=str, help="name of output interface")
share_parser = parser.add_mutually_exclusive_group(required=False)
share_parser.add_argument('--share', dest='share', action='store_true')
share_parser.add_argument('--no-share', dest='share', action='store_false')
parser.set_defaults(share=False)
args = parser.parse_args()


def launch_interface(args):
    io = gradio.Interface(inputs=args.inputs, outputs=args.outputs, model=lambda x:np.array(1), model_type='function')
    io.launch(share=args.share)
    # input_interface = gradio.inputs.registry[args.inputs.lower()]()
    # output_interface = gradio.outputs.registry[args.outputs.lower()]()
    # temp_dir = tempfile.mkdtemp()
    # gradio.networking.build_template(temp_dir, input_interface, output_interface)
    # print('Open this path in your browser to access the input interface: {}'.format(
    #     os.path.join(temp_dir, INDEX_FILE_NAME)))


if __name__ == "__main__":
    launch_interface(args)
