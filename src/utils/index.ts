import { Contract } from '@ethersproject/contracts'
import { getAddress } from '@ethersproject/address'
import { AddressZero } from '@ethersproject/constants'
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { BigNumber } from '@ethersproject/bignumber'
import { abi as IUniswapV2Router02ABI } from '@uniswap/v2-periphery/build/IUniswapV2Router02.json'
import IRequiemRouter02 from 'config/abi/polygon/IRequiemRouter02.json'
import IRequiemRouter02AVAX from 'config/abi/avax/IRequiemRouter02.json'
import StablesRouter from 'config/abi/avax/RequiemStableSwap.json'
import Aggregator from 'config/abi/avax/RequiemAggregator.json'
import { JSBI, Percent, Token, CurrencyAmount, Currency, ETHER, NETWORK_CCY, STABLE_POOL_ADDRESS } from '@requiemswap/sdk'
import { ROUTER_ADDRESS, AGGREGATOR_ADDRESS } from '../config/constants'
import { BASE_EXPLORER_URLS, ChainId } from '../config'
import { TokenAddressMap } from '../state/lists/hooks'

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

export function getNetworkExplorerLink(
  data: string | number,
  type: 'transaction' | 'token' | 'address' | 'block' | 'countdown',
  chainId: ChainId = ChainId.AVAX_TESTNET,
): string {
  switch (type) {
    case 'transaction': {
      return `${BASE_EXPLORER_URLS[chainId]}/tx/${data}`
    }
    case 'token': {
      return `${BASE_EXPLORER_URLS[chainId]}/token/${data}`
    }
    case 'block': {
      return `${BASE_EXPLORER_URLS[chainId]}/block/${data}`
    }
    case 'countdown': {
      return `${BASE_EXPLORER_URLS[chainId]}/block/countdown/${data}`
    }
    default: {
      return `${BASE_EXPLORER_URLS[chainId]}/address/${data}`
    }
  }
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}

// add 10%
export function calculateGasMargin(value: BigNumber): BigNumber {
  return value.mul(BigNumber.from(10000).add(BigNumber.from(1000))).div(BigNumber.from(10000))
}

// converts a basis points value to a sdk percent
export function basisPointsToPercent(num: number): Percent {
  return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000))
}

export function calculateSlippageAmount(value: CurrencyAmount, slippage: number): [JSBI, JSBI] {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`)
  }
  return [
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000)),
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)), JSBI.BigInt(10000)),
  ]
}

// account is not optional
export function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked()
}

// account is optional
export function getProviderOrSigner(library: Web3Provider, account?: string): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library
}

// account is optional
export function getContract(address: string, ABI: any, library: Web3Provider, account?: string): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account) as any)
}

// account is optional
export function getRouterContract(chainId: number, library: Web3Provider, account?: string): Contract {
  const ABI = chainId === 43113 ? IRequiemRouter02AVAX : chainId === 8001 ? IRequiemRouter02 : IUniswapV2Router02ABI
  return getContract(ROUTER_ADDRESS[chainId], ABI, library, account)
}

export function getAggregatorContract(chainId: number, library: Web3Provider, account?: string): Contract {
  const ABI = chainId === 43113 ? Aggregator : Aggregator
  return getContract(AGGREGATOR_ADDRESS[chainId ?? 43113], ABI, library, account)
}

export function getStableRouterContract(chainId: number, library: Web3Provider, account?: string): Contract {
  const ABI = StablesRouter
  console.log("getStableRouterContract")
  return getContract(STABLE_POOL_ADDRESS[chainId], ABI, library, account)
}


export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export function isTokenOnList(chainId: number, defaultTokens: TokenAddressMap, currency?: Currency): boolean {
  if (currency === NETWORK_CCY[chainId]) return true
  return Boolean(currency instanceof Token && defaultTokens[currency.chainId]?.[currency.address])
}
