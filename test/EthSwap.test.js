const { assert } = require('chai');

const EthSwap = artifacts.require("EthSwap");
const Token = artifacts.require("Token");

require('chai').use(require('chai-as-promised')).should()

function tokens(n) {
    return web3.utils.toWei(n, 'ether');
}

contract('EthSwap', ([deployer , investor]) => {
    let token, ethSwap

    before(async () => {
        token = await Token.new()
        ethSwap = await EthSwap.new(token.address)
        //Tranfer all turv token to ethSwap (1 million)
        await token.transfer(ethSwap.address, tokens('1000000'))
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
            assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    describe('buy tokens', async () => {
        let result
        before(async () => {
            result = await ethSwap.buyTokens({from: investor, value: web3.utils.toWei('1', 'ether')})
        })
        it('allow buy', async () => {

            let investor_balance = await token.balanceOf(investor)
            assert.equal(investor_balance.toString(), tokens('100'))

            let ethSwap_balance
            ethSwap_balance = await token.balanceOf(ethSwap.address)
            assert.equal(ethSwap_balance.toString(), tokens('999900'))

            ethSwap_balance = await web3.eth.getBalance(ethSwap.address)
            assert.equal(ethSwap_balance.toString(), web3.utils.toWei('1', 'ether'))

            const event = result.logs[0].args
            assert.equal(event.account,investor)
            assert.equal(event.token,token.address)
            assert.equal(event.amount.toString(),tokens('100').toString())
            assert.equal(event.rate.toString(),'100')
            
        })
    })

    describe('sell tokens', async () => {
        let result
        before(async () => {
            await token.approve(ethSwap.address, tokens('100'), {from: investor} )
            result = await ethSwap.sellTokens(tokens('100'), {from: investor})
        })
        it('allows to  sell', async () => {
            let investor_balance = await token.balanceOf(investor)
            assert.equal(investor_balance.toString(), tokens('0'))

            let ethSwap_balance
            ethSwap_balance = await token.balanceOf(ethSwap.address)
            assert.equal(ethSwap_balance.toString(), tokens('1000000'))

            ethSwap_balance = await web3.eth.getBalance(ethSwap.address)
            assert.equal(ethSwap_balance.toString(), web3.utils.toWei('0', 'ether'))

            const event = result.logs[0].args
            assert.equal(event.account,investor)
            assert.equal(event.token,token.address)
            assert.equal(event.amount.toString(),tokens('100').toString())
            assert.equal(event.rate.toString(),'100')

            await ethSwap.sellTokens(tokens('500'), {from: investor}).should.be.rejected;
        })
    })

} )