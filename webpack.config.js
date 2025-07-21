const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
  entry: "./btgTracking.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash].min.js",
    chunkFilename: "[name].[contenthash].chunk.js",
    // Configurações para exposição global no navegador
    library: {
      name: "BtgTracking",
      type: "umd",
      umdNamedDefine: true,
    },
    globalObject: "this",
    clean: true,
    publicPath: "/",
  },
  mode: "production",

  // Otimizações de performance
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ["console.log", "console.info", "console.debug"],
            // Preserva variáveis globais importantes para tracking
            keep_fnames: /^(BtgTracking|BtgSend)$/,
          },
          mangle: {
            safari10: true,
            // Preserva nomes das funções globais
            keep_fnames: /^(BtgTracking|BtgSend)$/,
          },
          format: {
            comments: false,
          },
        },
        extractComments: false,
        parallel: true,
      }),
    ],

    // Code splitting
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
          priority: 10,
        },
        common: {
          name: "common",
          minChunks: 2,
          chunks: "all",
          priority: 5,
        },
      },
    },

    // Runtime chunk separado
    runtimeChunk: "single",

    // Module concatenation
    concatenateModules: true,

    // Tree shaking
    usedExports: true,
    sideEffects: false,
  },

  // Configurações de módulos
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  targets: {
                    browsers: ["> 1%", "last 2 versions", "not dead"],
                  },
                  modules: false,
                  useBuiltIns: "usage",
                  corejs: 3,
                },
              ],
            ],
            plugins: [
              "@babel/plugin-syntax-dynamic-import",
              "@babel/plugin-proposal-class-properties",
            ],
          },
        },
      },
    ],
  },

  // Plugins para otimização
  plugins: [
    new CompressionPlugin({
      algorithm: "gzip",
      test: /\.(js|css|html|svg)$/,
      threshold: 8192,
      minRatio: 0.8,
    }),
  ],

  // Configurações de resolução
  resolve: {
    extensions: [".js", ".json"],
    modules: ["node_modules"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  // Configurações de performance
  performance: {
    hints: "warning",
    maxEntrypointSize: 250000,
    maxAssetSize: 250000,
  },

  // Configurações de desenvolvimento
  devtool: false, // Remove source maps em produção

  // Configurações de cache
  cache: {
    type: "filesystem",
    buildDependencies: {
      config: [__filename],
    },
  },

  // Configurações de stats
  stats: {
    chunks: false,
    modules: false,
    children: false,
    colors: true,
    timings: true,
    assets: true,
    entrypoints: false,
  },
};
