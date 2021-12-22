import BigNumber from 'bignumber.js'
import masterchefABI from 'config/abi/masterchef.json'
import erc20 from 'config/abi/erc20.json'
import { getAddress, getMasterChefAddress } from 'utils/addressHelpers'
import { BIG_TEN, BIG_ZERO } from 'utils/bigNumber'
import multicall from 'utils/multicall'
import { SerializedBigNumber} from 'config/constants/types'
import { Bond } from 'state/types'


export type PublicBondData = {
  bond: string
  price: SerializedBigNumber
  roi: number
}

const fetchPublicBondData = async (chainId: number, bond: Bond): Promise<PublicBondData> => {
  const { bondToken} = bond
  // const lpAddress = getAddress(chainId, lpAddresses)
  // const calls = [
  //   // Balance of token in the LP contract
  //   {
  //     address: getAddress(chainId, token.address),
  //     name: 'balanceOf',
  //     params: [lpAddress],
  //   },
  //   // Balance of quote token on LP contract
  //   {
  //     address: getAddress(chainId, quoteToken.address),
  //     name: 'balanceOf',
  //     params: [lpAddress],
  //   },
  //   // Balance of LP tokens in the master chef contract
  //   {
  //     address: lpAddress,
  //     name: 'balanceOf',
  //     params: [getMasterChefAddress(chainId)],
  //   },
  //   // Total supply of LP tokens
  //   {
  //     address: lpAddress,
  //     name: 'totalSupply',
  //   },
  //   // Token decimals
  //   {
  //     address: getAddress(chainId, token.address),
  //     name: 'decimals',
  //   },
  //   // Quote token decimals
  //   {
  //     address: getAddress(chainId, quoteToken.address),
  //     name: 'decimals',
  //   },
  // ]

  // const [tokenBalanceLP, quoteTokenBalanceLP, lpTokenBalanceMC, lpTotalSupply, tokenDecimals, quoteTokenDecimals] =
  //   await multicall(chainId, erc20, calls)

  // // Ratio in % of LP tokens that are staked in the MC, vs the total number in circulation
  // const lpTokenRatio = new BigNumber(lpTokenBalanceMC).div(new BigNumber(lpTotalSupply))

  // // Raw amount of token in the LP, including those not staked
  // const tokenAmountTotal = new BigNumber(tokenBalanceLP).div(BIG_TEN.pow(tokenDecimals))
  // const quoteTokenAmountTotal = new BigNumber(quoteTokenBalanceLP).div(BIG_TEN.pow(quoteTokenDecimals))

  // // Amount of token in the LP that are staked in the MC (i.e amount of token * lp ratio)
  // const tokenAmountMc = tokenAmountTotal.times(lpTokenRatio)
  // const quoteTokenAmountMc = quoteTokenAmountTotal.times(lpTokenRatio)

  // // Total staked in LP, in quote token value
  // const lpTotalInQuoteToken = quoteTokenAmountMc.times(new BigNumber(2))

  // // Only make masterchef calls if farm has bondId
  // const [info, totalAllocPoint] =
  //   bondId || bondId === 0
  //     ? await multicall(chainId, masterchefABI, [
  //       {
  //         address: getMasterChefAddress(chainId),
  //         name: 'poolInfo',
  //         params: [bondId],
  //       },
  //       {
  //         address: getMasterChefAddress(chainId),
  //         name: 'totalAllocPoint',
  //       },
  //     ])
  //     : [null, null]

  // const allocPoint = info ? new BigNumber(info.allocPoint?._hex) : BIG_ZERO
  // const poolWeight = totalAllocPoint ? allocPoint.div(new BigNumber(totalAllocPoint)) : BIG_ZERO

  return {
    bond: 'REQT',
    price: '143.12',
    roi: 0.01243
  }
}

export default fetchPublicBondData