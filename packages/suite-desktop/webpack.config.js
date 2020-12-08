/**
 * TODO
 * - Build JS
 * - Import and optimize static resources
 */
const path = require('path');

const { NODE_ENV } = process.env;
const environment = NODE_ENV || 'development';
const isDev = environment === 'development';

module.exports = {
    mode: environment,
    devtool: isDev ? 'source-map' : false,
    entry: {
        app: path.join(__dirname, 'src-ui', 'App.tsx'),
    },
    output: {
        path: path.join(__dirname, 'www'),
        publicPath: '/', // TODO: prefix?
        filename: 'js/[name].[hash:8].js',
        chunkFilename: 'js/[id].[hash:8].js',
    },
    module: {
        // Handlers for JS(X) (+ TypeScript)
    },
    plugins: [
        new CleanWebpackPlugin(),
        new webpack.DefinePlugin({
            VERSION: JSON.stringify(pkg.version),
        }),
        new HtmlWebpackPlugin({
            minify: !isDev,
            // favicon: path.resolve('app/static/favicon.ico'),
            template: path.join(__dirname, 'src-ui', 'static', 'index.html'),
            templateParameters: {
                APP_NAME: pkg.fullname,
            },
        }),
    ],
};
