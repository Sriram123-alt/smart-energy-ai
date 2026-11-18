import keras
from keras import layers, ops
import tensorflow as tf

@keras.utils.register_keras_serializable(package="SmartEnergyGNN")
class GraphConvLayer(layers.Layer):
    """
    Custom Graph Convolution Layer:
    Performs Z = activation( A_norm @ X @ W + b )
    where A_norm is the normalized adjacency matrix D^{-1/2} A D^{-1/2}
    """
    def __init__(self, units, activation="relu", **kwargs):
        super(GraphConvLayer, self).__init__(**kwargs)
        self.units = units
        self.activation = layers.Activation(activation)

    def build(self, input_shape):
        # input_shape is a tuple: [X_shape (N, F), A_shape (N, N)]
        feature_dim = input_shape[0][-1]
        self.w = self.add_weight(
            shape=(feature_dim, self.units),
            initializer="glorot_uniform",
            trainable=True,
            name="w_graph_conv"
        )
        self.b = self.add_weight(
            shape=(self.units,),
            initializer="zeros",
            trainable=True,
            name="b_graph_conv"
        )
        super(GraphConvLayer, self).build(input_shape)

    def call(self, inputs):
        X, A_norm = inputs
        # X: (N, F), W: (F, units) -> XW: (N, units)
        XW = tf.matmul(X, self.w)
        # A_norm: (N, N) @ XW: (N, units) -> AXW: (N, units)
        AXW = tf.matmul(A_norm, XW) + self.b
        return self.activation(AXW)

    def get_config(self):
        config = super(GraphConvLayer, self).get_config()
        config.update({"units": self.units})
        return config


def build_gnn_model(input_feature_dim: int, num_nodes: int):
    """
    Builds a Graph Neural Network (GNN) model for appliance interaction & load predictions.
    
    Inputs:
    - node_features (X): (num_nodes, input_feature_dim)
    - norm_adj (A_norm): (num_nodes, num_nodes)
    
    Outputs:
    - predictions: (num_nodes, 2) -> [Next-day Energy kWh, Peak kW]
    """
    x_in = layers.Input(shape=(input_feature_dim,), name="node_features")
    a_in = layers.Input(shape=(num_nodes,), name="norm_adj")

    # Layer 1: Graph Convolution 32 units + Layer Normalization
    h1 = GraphConvLayer(units=32, activation="relu", name="gcn_1")([x_in, a_in])
    h1 = layers.LayerNormalization(name="ln_1")(h1)
    h1 = layers.Dropout(0.1, name="drop_1")(h1)

    # Layer 2: Graph Convolution 16 units + Layer Normalization
    h2 = GraphConvLayer(units=16, activation="relu", name="gcn_2")([h1, a_in])
    h2 = layers.LayerNormalization(name="ln_2")(h2)

    # Dense Output Head for appliance energy & peak kW forecast (sigmoid for [0, 1] scaled bounds)
    output = layers.Dense(2, activation="sigmoid", name="appliance_predictions")(h2)

    model = keras.Model(inputs=[x_in, a_in], outputs=output, name="GNN_Appliance_Grid_Model")
    model.compile(optimizer=keras.optimizers.Adam(learning_rate=0.005), loss="mse", metrics=["mae"])
    
    return model
