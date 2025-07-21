const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].[contenthash:8].min.js",
    chunkFilename: "[name].[contenthash:8].chunk.js",
    // Configurações para exposição global no navegador
    library: {
      name: "BtgTrackingSDK",
      type: "umd",
      export: "default",
    },
    globalObject: "typeof self !== 'undefined' ? self : this",
    clean: true,
    publicPath: "/",
    crossOriginLoading: "anonymous",
  },
  mode: "production",

  // Otimizações avançadas de performance
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: [
              "console.log",
              "console.info",
              "console.debug",
              "console.trace",
            ],
            passes: 2,
            unsafe: true,
            unsafe_comps: true,
            unsafe_math: true,
            unsafe_methods: true,
            unsafe_proto: true,
            unsafe_regexp: true,
            unsafe_undefined: true,
            // Preserva variáveis globais importantes para tracking
            keep_fnames: /^(BtgTracking|BtgSend|BtgTrackingSDK)$/,
          },
          mangle: {
            safari10: true,
            toplevel: true,
            // Preserva nomes das funções globais
            keep_fnames: /^(BtgTracking|BtgSend|BtgTrackingSDK)$/,
          },
          format: {
            comments: false,
          },
        },
        extractComments: false,
        parallel: true,
      }),
    ],

    // Code splitting otimizado
    splitChunks: {
      chunks: "all",
      minSize: 20000,
      maxSize: 244000,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
          priority: 10,
          reuseExistingChunk: true,
        },
        common: {
          name: "common",
          minChunks: 2,
          chunks: "all",
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },

    runtimeChunk: "single",
    concatenateModules: true,
    usedExports: true,
    sideEffects: false,

    // Otimização de módulos
    moduleIds: "deterministic",
    chunkIds: "deterministic",
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
            cacheCompression: false,
          },
        },
      },
    ],
  },

  plugins: [
    // Compressão Gzip
    new CompressionPlugin({
      algorithm: "gzip",
      test: /\.(js|css|html|svg)$/,
      threshold: 8192,
      minRatio: 0.8,
      deleteOriginalAssets: false,
    }),

    // Compressão Brotli (melhor que gzip)
    new CompressionPlugin({
      filename: "[path][base].br",
      algorithm: "brotliCompress",
      test: /\.(js|css|html|svg)$/,
      compressionOptions: {
        level: 11,
      },
      threshold: 8192,
      minRatio: 0.8,
      deleteOriginalAssets: false,
    }),
  ],

  resolve: {
    extensions: [".js", ".json"],
    modules: ["node_modules"],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    // Otimizações de resolução
    symlinks: false,
    cacheWithContext: false,
  },

  performance: {
    hints: "error",
    maxEntrypointSize: 200000,
    maxAssetSize: 200000,
  },

  devtool: false,

  cache: {
    type: "filesystem",
    buildDependencies: {
      config: [__filename],
    },
    compression: "gzip",
  },

  stats: {
    chunks: false,
    modules: false,
    children: false,
    colors: true,
    timings: true,
    assets: true,
    entrypoints: false,
    performance: true,
    warnings: true,
    errors: true,
  },

  // Configurações experimentais para melhor performance
  experiments: {
    topLevelAwait: true,
  },
};
