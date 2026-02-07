const path = require('path');

module.exports = {
  entry: './src/index.tsx', // adjust this if your entry file is somewhere else
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
      'tslib': require.resolve('tslib'), // <-- Add this line
    },
    extensions: ['.web.js', '.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
  devServer: {
    static: './dist',
  },
};