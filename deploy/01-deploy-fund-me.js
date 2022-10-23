const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
require("dotenv").config()
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let ethUsdPriceFeedAddress

    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    const args = ethUsdPriceFeedAddress
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [args],
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    // const fundMe = await deploy("FundMe", {
    //     from: deployer,
    //     args: [ethUsdPriceFeedAddress],
    //     log: true,
    // })

    // verify
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        //等待部署确认，default是1 waitConfirmations: network.config.blockConfirmations || 1,
        await verify(fundMe.address, [args])
    }
}

module.exports.tags = ["all", "fundme"]
