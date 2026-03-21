/**
 * Truffle configuration for local Ganache development.
 *
 * How to use:
 * 1. Open Ganache GUI → New Workspace → link this file
 *    OR run CLI:  npx ganache --port 7545 --deterministic
 * 2. truffle compile
 * 3. truffle migrate --network development
 * 4. Copy the CertificateRegistry address into .env → BLOCKCHAIN_CONTRACT_ADDRESS
 * 5. Copy account[0] private key from Ganache into .env → BLOCKCHAIN_PRIVATE_KEY
 */
module.exports = {
  contracts_directory:       "./blockchain/contracts",
  contracts_build_directory: "./blockchain/build",
  migrations_directory:      "./blockchain/migrations",

  networks: {
    development: {
      host:       "127.0.0.1",
      port:       7545,        // Ganache GUI default port
      network_id: "*",         // Match any network id
      gas:        6721975,     // Ganache block gas limit
      gasPrice:   20000000000, // 20 gwei
    },
  },

  compilers: {
    solc: {
      version: "0.8.19",
      settings: {
        optimizer: {
          enabled: true,
          runs:    200,
        },
        evmVersion: "paris",
      },
    },
  },
};
