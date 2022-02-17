const EthSwap = artifacts.require("EthSwap");

const Token = artifacts.require("Token");

module.exports = async function(deployer) {
  //Deploy turv token
  await deployer.deploy(Token);

  const token = await Token.deployed()

  //Deploy ethswap
  await deployer.deploy(EthSwap, token.address);

  const ethSwap = await EthSwap.deployed()

  //Tranfer all turv token to ethSwap (1 million)
  await token.transfer(ethSwap.address, '1000000000000000000000000')
};
