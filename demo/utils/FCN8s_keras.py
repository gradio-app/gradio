from keras.models import Sequential, Model
from keras.layers import *
from keras.activations import relu
from keras.initializers import RandomNormal
from keras.applications import *
import keras.backend as K

def FCN(num_output=21, input_shape=(500, 500, 3)):
    """Instantiate the FCN8s architecture with keras.
    # Arguments
        basenet: type of basene {'vgg16'}
        trainable_base: Bool whether the basenet weights are trainable
        num_output: number of classes
        input_shape: input image shape
        weights: pre-trained weights to load (None for training from scratch)
    # Returns
        A Keras model instance
    """
    ROW_AXIS = 1
    COL_AXIS = 2
    CHANNEL_AXIS = 3
    
    def _crop(target_layer, offset=(None, None), name=None):
        """Crop the bottom such that it has the same shape as target_layer."""
        """ Use _keras_shape to prevent undefined output shape in Conv2DTranspose"""
        def f(x):
            width = x._keras_shape[ROW_AXIS]
            height = x._keras_shape[COL_AXIS]
            target_width = target_layer._keras_shape[ROW_AXIS]
            target_height = target_layer._keras_shape[COL_AXIS]
            cropped = Cropping2D(cropping=((offset[0], width - offset[0] - target_width), (offset[1], height - offset[1] - target_height)), name='{}'.format(name))(x)
            return cropped
        return f
      
    input_tensor = Input(shape=input_shape)  
    pad1 = ZeroPadding2D(padding=(100, 100))(input_tensor)
    conv1_1 = Conv2D(filters=64, kernel_size=(3, 3), activation='relu',
                   padding='valid', name='conv1_1')(pad1)
    conv1_2 = Conv2D(filters=64, kernel_size=(3, 3), activation='relu',
                   padding='same', name='conv1_2')(conv1_1)
    pool1 = MaxPooling2D(pool_size=(2, 2), strides=(2, 2),
                       padding='same', name='pool1')(conv1_2)
    # Block 2
    conv2_1 = Conv2D(filters=128, kernel_size=(3, 3),
                   activation='relu',
                   padding='same', name='conv2_1')(pool1)
    conv2_2 = Conv2D(filters=128, kernel_size=(3, 3), activation='relu',
                   padding='same', name='conv2_2')(conv2_1)
    pool2 = MaxPooling2D(pool_size=(2, 2), strides=(2, 2),
                       padding='same', name='pool2')(conv2_2)
    # Block 3
    conv3_1 = Conv2D(filters=256, kernel_size=(3, 3), activation='relu',
                   padding='same', name='conv3_1')(pool2)
    conv3_2 = Conv2D(filters=256, kernel_size=(3, 3), activation='relu',
                   padding='same', name='conv3_2')(conv3_1)
    conv3_3 = Conv2D(filters=256, kernel_size=(3, 3), activation='relu',
                   padding='same', name='conv3_3')(conv3_2)
    pool3 = MaxPooling2D(pool_size=(2, 2), strides=(2, 2),
                       padding='same', name='pool3')(conv3_3)
    # Block 4
    conv4_1 = Conv2D(filters=512, kernel_size=(3, 3), activation='relu',
                   padding='same', name='conv4_1')(pool3)
    conv4_2 = Conv2D(filters=512, kernel_size=(3, 3), activation='relu',
                   padding='same', name='conv4_2')(conv4_1)
    conv4_3 = Conv2D(filters=512, kernel_size=(3, 3), activation='relu',
                   padding='same', name='conv4_3')(conv4_2)
    pool4 = MaxPooling2D(pool_size=(2, 2), strides=(2, 2),
                       padding='same', name='pool4')(conv4_3)
    # Block 5
    conv5_1 = Conv2D(filters=512, kernel_size=(3, 3), activation='relu',
                   padding='same', name='conv5_1')(pool4)
    conv5_2 = Conv2D(filters=512, kernel_size=(3, 3), activation='relu',
                   padding='same', name='conv5_2')(conv5_1)
    conv5_3 = Conv2D(filters=512, kernel_size=(3, 3), activation='relu',
                   padding='same', name='conv5_3')(conv5_2)
    pool5 = MaxPooling2D(pool_size=(2, 2), strides=(2, 2),
                       padding='same', name='pool5')(conv5_3)
    # fully conv
    fc6 = Conv2D(filters=4096, kernel_size=(7, 7),
               activation='relu', padding='valid',
               name='fc6')(pool5)
    drop6 = Dropout(0.5)(fc6)
    fc7 = Conv2D(filters=4096, kernel_size=(1, 1),
               activation='relu', padding='valid',
               name='fc7')(drop6)
    drop7 = Dropout(0.5)(fc7)
    
    #basenet = VGG16_basenet()
    # input
    #input_tensor = Input(shape=input_shape)
    # Get skip_layers=[drop7, pool4, pool3] from the base net: VGG16
    #skip_layers = VGG16_basenet(input_tensor)

    #drop7 = skip_layers[0]
    score_fr = Conv2D(filters=num_output, kernel_size=(1, 1), padding='valid', name='score_fr')(drop7)
    upscore2 = Conv2DTranspose(num_output, kernel_size=4, strides=2, use_bias=False, name='upscore2')(score_fr)
    
    # scale pool4 skip for compatibility
    #pool4 = skip_layers[1]
    scale_pool4 = Lambda(lambda x: x * 0.01, name='scale_pool4')(pool4)
    score_pool4 = Conv2D(filters=num_output, kernel_size=(1, 1),
                         padding='valid', name='score_pool4')(scale_pool4)
    score_pool4c = _crop(upscore2, offset=(5, 5),
                         name='score_pool4c')(score_pool4)
    fuse_pool4 = add([upscore2, score_pool4c])
    upscore_pool4 = Conv2DTranspose(filters=num_output, kernel_size=(4, 4),
                                    strides=(2, 2), padding='valid',
                                    use_bias=False,
                                    data_format=K.image_data_format(),
                                    name='upscore_pool4')(fuse_pool4)
    # scale pool3 skip for compatibility
    #pool3 = skip_layers[2]
    scale_pool3 = Lambda(lambda x: x * 0.0001, name='scale_pool3')(pool3)
    score_pool3 = Conv2D(filters=num_output, kernel_size=(1, 1),
                         padding='valid', name='score_pool3')(scale_pool3)
    score_pool3c = _crop(upscore_pool4, offset=(9, 9),
                         name='score_pool3c')(score_pool3)
    fuse_pool3 = add([upscore_pool4, score_pool3c])
    # score
    upscore8 = Conv2DTranspose(filters=num_output, kernel_size=(16, 16),
                               strides=(8, 8), padding='valid',
                               use_bias=False,
                               data_format=K.image_data_format(),
                               name='upscore8')(fuse_pool3)
    score = _crop(input_tensor, offset=(31, 31), name='score')(upscore8)

    # model
    model = Model(input_tensor, score, name='fcn_vgg16')
    
    return model