/* eslint-disable @typescript-eslint/no-var-requires */

/**
 * This webpack config establishes a proxy server to enable a local build of library-registry-admin
 * to connect to a remote Library Registry back-end. Requests for webpack assets are served from
 * memory; other requests are proxied to the specified Library Registry.
 *
 * Usage:
 *   npm run dev-server -- --env=backend=https://registry-tpp-qa.palaceproject.io
 * or
 *   npx webpack serve --config webpack.dev-server.config --env=backend=https://registry-tpp-qa.palaceproject.io
 *
 * This makes the library-registry webapp available at http://localhost:8080/admin.
 */

const {
  createProxyMiddleware,
  responseInterceptor,
} = require("http-proxy-middleware");

const { merge } = require("webpack-merge");
const { URL } = require("url");
const dev = require("./webpack.dev.config.js");

/**
 * The public path to local webpack assets. This is chosen to have low chance of collision with any
 * path on the back-end. This should start and end with slashes.
 */
const devAssetsPublicPath = "/webpack-dev-assets/";

/**
 * Build the webpack configuration.
 * See https://webpack.js.org/configuration/configuration-types/#exporting-a-function
 *
 * @param {object} env The environment.
 * @returns The webpack configuration.
 */
module.exports = (env) => {
  const { backend } = env;

  if (!backend) {
    console.error("Please specify the URL of a Library Registry back-end.");

    console.error(
      "Example: npm run dev-server -- --env=backend=https://registry-tpp-qa.palaceproject.io"
    );

    throw "No back-end URL was specified.";
  }

  console.info(`Using Library Registry back-end: ${backend}`);

  const backendUrl = new URL(backend);

  /**
   * Rewrite a location header (as received in a 3xx response). This changes back-end URLs to
   * point to the local server instead.
   *
   * @param res The response.
   * @param req The request.
   */
  const rewriteLocationHeader = (res, req) => {
    const location = res.getHeader("location");

    if (!location) {
      return;
    }

    const locationUrl = new URL(location);

    if (locationUrl.host !== backendUrl.host) {
      return;
    }

    const requestHost = req.headers.host;

    if (!requestHost) {
      return;
    }

    locationUrl.protocol = "http";
    locationUrl.host = requestHost;

    res.setHeader("location", locationUrl.href);
  };

  /**
   * Rewrites an HTML response. This changes jsdelivr CDN URLs in the page to point to the webpack
   * assets on the local server instead. This is a simple find-and-replace.
   *
   * @param responseBuffer A buffer containing the response body.
   * @param req The request.
   * @returns
   */
  const rewriteHTML = (responseBuffer, req) => {
    const requestHost = req.headers.host;

    if (!requestHost) {
      return responseBuffer;
    }

    const page = responseBuffer.toString("utf8");
    const packageName = process.env.npm_package_name;
    const cdnUrlPattern = `"https://cdn.jsdelivr.net/npm/${packageName}(@.*?)?/dist/(.*?)"`;

    return page.replace(
      new RegExp(cdnUrlPattern, "g"),
      `"http://${requestHost}${devAssetsPublicPath}$2"`
    );
  };

  const proxyMiddleware = createProxyMiddleware({
    changeOrigin: true,
    onProxyRes: responseInterceptor(
      async (responseBuffer, proxyRes, req, res) => {
        rewriteLocationHeader(res, req);

        const contentType = res.getHeader("content-type");

        if (contentType && contentType.startsWith("text/html")) {
          return rewriteHTML(responseBuffer, req);
        }

        return responseBuffer;
      }
    ),
    proxyTimeout: 5000,
    secure: false,
    selfHandleResponse: true,
    target: backend,
    timeout: 5000,
  });

  const config = merge(dev, {
    devServer: {
      onAfterSetupMiddleware: (devServer) => {
        devServer.app.use("/", proxyMiddleware);
      },
    },
    output: {
      publicPath: devAssetsPublicPath,
    },
  });

  return config;
};
