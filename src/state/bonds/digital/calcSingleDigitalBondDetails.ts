/** eslint no-empty-interface: 0 */
import { createAsyncThunk } from '@reduxjs/toolkit'
import { deserializeToken } from 'state/user/hooks/helpers';
import { getContractForDigitalBondDepo } from 'utils/contractHelpers';
import { BigNumber } from 'ethers'
import { getAddress } from 'ethers/lib/utils';
import { addresses } from 'config/constants/contracts';
import multicall from 'utils/multicall';
import bondReserveAVAX from 'config/abi/avax/CallBondDepository.json'
import bondReserveOasis from 'config/abi/oasis/DigitalCallBondDepo.json'
import weightedPairABI from 'config/abi/avax/RequiemWeightedPair.json'
import weightedPairABIOasis from 'config/abi/oasis/RequiemWeightedPair.json'
import { getNonQuoteToken, getQuoteToken } from 'utils/bondUtils';
import { BondAssetType } from 'config/constants/types';
import { bnParser } from 'utils/helper';
import { ICalcCallBondDetailsAsyncThunk } from '../types';
import { priceFromData } from '../loadMarketPrice';
import { DigitalBond } from '../../types'

const E_EIGHTEEN = BigNumber.from('1000000000000000000')

export const calcSingleDigitalBondDetails = createAsyncThunk(
  "bonds/calcSingleDigitalBondDetails",
  async ({ bond, provider, chainId }: ICalcCallBondDetailsAsyncThunk): Promise<DigitalBond> => {

    const bondContract = getContractForDigitalBondDepo(chainId, provider);

    // cals for general bond data
    const calls = [
      // max payout
      {
        address: bondContract.address,
        name: 'markets',
        params: [bond.bondId]
      },
      // debt ratio
      {
        address: bondContract.address,
        name: 'debtRatio',
        params: [bond.bondId]
      },
      // terms
      {
        address: bondContract.address,
        name: 'terms',
        params: [bond.bondId]
      },
      // bond price in USD
      {
        address: bondContract.address,
        name: 'marketPrice',
        params: [bond.bondId]
      },
    ]

    const [market, debtRatio, terms, bondPrice] = await multicall(chainId, chainId === 43113 ? bondReserveAVAX : bondReserveOasis, calls)

    // calls from pair used for pricing
    const callsPair = [
      // max payout
      {
        address: market.asset,
        name: 'getReserves'
      },
      // debt ratio
      {
        address: market.asset,
        name: 'totalSupply',
      },
      {
        address: market.asset,
        name: 'balanceOf',
        params: [getAddress(addresses.treasury[chainId])]
      },
    ]

    const [reserves, supply, purchasedQuery] = await multicall(chainId, chainId === 43113 ? weightedPairABI : weightedPairABIOasis, callsPair)

    let price: string
    try {
      // calculate price
      price = bond.tokens && bond.quoteTokenIndex && bond.assetType === BondAssetType.PairLP ? priceFromData(
        deserializeToken(getNonQuoteToken(bond)),
        deserializeToken(getQuoteToken(bond)),
        BigNumber.from(bond.lpProperties.weightToken),
        BigNumber.from(bond.lpProperties.weightQuoteToken),
        reserves.vReserve0,
        reserves.vReserve1,
        BigNumber.from(bond.lpProperties.fee)
      ) : '0'
    } catch (error) {
      console.log("Error in pricing pair:", error)
      price = '`1'
    }
    const marketPrice = BigNumber.from(price)

    const bondDiscount = bnParser(marketPrice?.sub(bondPrice[0]) ?? BigNumber.from('0'), bondPrice[0])

    return {
      ...bond,
      publicLoaded: true,
      bondDiscount,
      debtRatio: debtRatio[0].toString(),
      lpData: {
        lpTotalSupply: supply?.[0]?.toString(),
        reserve0: reserves?.[0]?.toString(),
        reserve1: reserves?.[1]?.toString(),
        priceInQuote: price
      },
      bondTerms: {
        fixedTerm: Boolean(terms.fixedTerm.toString()),
        controlVariable: terms.controlVariable.toString(), // scaling variable for price
        vesting: terms.vesting.toString(), // in blocks
        maxDebt: terms.maxDebt.toString(),
        conclusion: terms.conclusion.toString(),
        thresholdPercentage: terms.thresholdPercentage.toString(),
        payoffPercentage: terms.payoffPercentage.toString()
      },
      market: {
        underlying: chainId === 43113 ? getAddress(market.underlying) : market.underlying,
        quote: chainId === 43113 ? "" : market?.quote ?? "USD",
        capacity: market.capacity.toString(),
        capacityInQuote: Boolean(market.capacityInQuote.toString()),
        totalDebt: market.totalDebt.toString(),
        maxPayout: market.maxPayout.toString(),
        sold: market.sold.toString(),
        purchased: market.purchased.toString(),
      },
      vestingTerm: Number(terms.vesting.toString()),
      bondPrice: bnParser(bondPrice[0], E_EIGHTEEN), // bondPrice.div(E_EIGHTEEN).toNumber(),
      marketPrice: marketPrice?.toString() ?? '1',
    };
  },
);