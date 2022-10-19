import gradio as gr 

with gr.Blocks() as demo:
    cheetahs = [
        "https://upload.wikimedia.org/wikipedia/commons/0/09/TheCheethcat.jpg",
        "https://nationalzoo.si.edu/sites/default/files/animals/cheetah-003.jpg",
        "https://img.etimg.com/thumb/msid-50159822,width-650,imgsize-129520,,resizemode-4,quality-100/.jpg",
        "https://nationalzoo.si.edu/sites/default/files/animals/cheetah-002.jpg",
        "https://images.theconversation.com/files/375893/original/file-20201218-13-a8h8uq.jpg?ixlib=rb-1.1.0&rect=16%2C407%2C5515%2C2924&q=45&auto=format&w=496&fit=clip",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeSdQE5kHykTdB970YGSW3AsF6MHHZzY4QiQ&usqp=CAU",
        "https://www.lifegate.com/app/uploads/ghepardo-primo-piano.jpg",
        "https://i.natgeofe.com/n/60004bcc-cd85-4401-8bfa-6f96551557db/cheetah-extinction-3_3x4.jpg",
        "https://qph.cf2.quoracdn.net/main-qimg-0bbf31c18a22178cb7a8dd53640a3d05-lq"
    ]
    gr.Gallery(value=cheetahs)

demo.launch()