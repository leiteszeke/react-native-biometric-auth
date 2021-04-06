const NodeRSA = require("node-rsa");

const publicKey =
  "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtp+HG9W1Fh4OReVg/3rraJWo1JuViNa/URmnKiUxUErdUMQ5MBQW/kfxRo31yjy8KXXPNjn5c6qPnUdmfCVfRySUIEBXO2PZe87grjuG8uCNIdzKH9l8Zo/qawseH/q5SU3v9KEorx4XwSKmSV4dQNVVu15rOGV/XXeATLlWd7maYqcPugUkqnoC3HRsZM807OKJFITcBn7H5HMKGBFadoDNZB3HyVlXphSFgPSQnqhbVdtdtkgPW2IKB/S50WcOdVfspE/6PkDndBHhDpYS8pCRAaiTO00bzQvKpBKvvzkkXTYriOh8B9c+80+1yBUnftiE9EsgNq5ZAMviuI9zQQIDAQAB";
const payload = "my payload";
const signature =
  "R0qoB/pl65++iUoGq4ro9Cl/woHt+49K3CFKwfmiBMuDLGhR+8B4laXgacNq9/4IO7i3UVUkwEeRZgIPZxzZzOjlkVWaU+9yku4xtVIoqD08u2CLYNeu7zTU7bGnUq3xjhodhx+aV1HwM5BVpY9e5IjWquaEue/v2SYHh5fnTfTs03Ta5gHPwfy/7+jVl60h+ZaRgwFE8vUxICA8aHr0LlLaqRDanuB9Mf86MptDHxphKF+hnkBQoziRnlzXvoQJCRBT0wDcP6TOA4Rti0B36+tMxIQLCQBNOyEzoPmDlluoTiMKJH73c9A4gwxC620A33i2lMhKh0JFuvQEbYLW5w==";

const publicKeyBuffer = Buffer.from(publicKey, "base64");
const key = new NodeRSA();
const signer = key.importKey(publicKeyBuffer, "public-der");
const signatureVerified = signer.verify(
  Buffer.from(payload),
  signature,
  "utf8",
  "base64"
);

console.log(signatureVerified);
