import BigNumber from 'bignumber.js'
import { DEFAULT_GAS_LIMIT, DEFAULT_TOKEN_DECIMAL } from 'config'
import getGasPrice from 'utils/getGasPrice'

const options = {
  gasLimit: DEFAULT_GAS_LIMIT,
}

export const stakeFarm = async (chainId, account, masterChefContract, pid, amount) => {
  const gasPrice = getGasPrice(chainId)
  const value = new BigNumber(amount).times(DEFAULT_TOKEN_DECIMAL).toString()
  // if (pid === 0) {
  //   const tx = await masterChefContract.enterStaking(value, { ...options, gasPrice })
  //   const receipt = await tx.wait()
  //   return receipt.status
  // }

  const tx = await masterChefContract.deposit(pid, value, account
    // , { ...options, gasPrice }
    )
  const receipt = await tx.wait()
  return receipt.status
}

export const unstakeFarm = async (chainId, account, masterChefContract, pid, amount) => {
  const gasPrice = getGasPrice(chainId)
  const value = new BigNumber(amount).times(DEFAULT_TOKEN_DECIMAL).toString()
  // if (pid === 0) {
  //   const tx = await masterChefContract.leaveStaking(value, { ...options, gasPrice })
  //   const receipt = await tx.wait()
  //   return receipt.status
  // }

  const tx = await masterChefContract.withdraw(pid, value, account, { ...options, gasPrice })
  const receipt = await tx.wait()
  return receipt.status
}

export const harvestFarm = async (chainId, account, masterChefContract, pid) => {
  const gasPrice = getGasPrice(chainId)
  // if (pid === 0) {
  //   const tx = await masterChefContract.leaveStaking('0', { ...options, gasPrice })
  //   const receipt = await tx.wait()
  //   return receipt.status
  // }

  const tx = await masterChefContract.harvest(pid, account) // , { ...options, gasPrice })
  const receipt = await tx.wait()
  return receipt.status
}
