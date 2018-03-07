const path = require('path');
var nodeExternals = require('webpack-node-externals');
const NodemonPlugin = require('nodemon-webpack-plugin')

module.exports = {
    entry: './src/index.js',
    devtool: 'inline-source-map',
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
        }]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: 'bundle.js',
        path: path.join(__dirname, 'dist')
    },
    node: {
        __dirname: false
    },
    target: 'node',
    externals: [nodeExternals()],
    plugins: [
        new NodemonPlugin(),
    ]
};