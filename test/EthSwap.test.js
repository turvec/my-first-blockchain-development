const { assert } = require('chai');

const EthSwap = artifacts.require("EthSwap");
const Token = artifacts.require("Token");

require('chai').use(require('chai-as-promised')).should()

contract('EthSwap', (accounts) => {
    let token, ethSwap

    before(async () => {
        token = await Token.new()
        ethSwap = await EthSwap.new()
        //Tranfer all turv token to ethSwap (1 million)
        await token.transfer(ethSwap.address, '1000000000000000000000000')
    })

    describe('Token deploymnet', async () => {
        it('correct token name', async () => {
            const name = await token.name()
            assert.equal(name, 'Turv Token')
        })
    })
    
    describe('EthSwap deployment', async () => {
        it('contract has a name', async () => {
            const name = await ethSwap.name()
            assert.equal(name, 'EthSwap Instant Exchange')
        })

        it('contract has token', async () => {
            const balance = await token.balanceOf(ethSwap.address)
            assert.equal(balance.toString(), '1000000000000000000000000')
        })
    })

} )