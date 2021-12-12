import { CurrencyAmount, Fraction, JSBI, Percent, TokenAmount, TradeV4, WeightedPair } from '@requiemswap/sdk'
import { wrappedCurrency, wrappedCurrencyAmount } from 'utils/wrappedCurrency'
import {
  BLOCKED_PRICE_IMPACT_NON_EXPERT,
  ALLOWED_PRICE_IMPACT_HIGH,
  ALLOWED_PRICE_IMPACT_LOW,
  ALLOWED_PRICE_IMPACT_MEDIUM,
} from '../config/constants'

import { Field } from '../state/swapV3/actions'
import { basisPointsToPercent } from './index'

const BASE_FEE = new Percent(JSBI.BigInt(25), JSBI.BigInt(10000))
const ONE_HUNDRED_PERCENT = new Percent(JSBI.BigInt(10000), JSBI.BigInt(10000))
const INPUT_FRACTION_AFTER_FEE = ONE_HUNDRED_PERCENT.subtract(BASE_FEE)

// computes price breakdown for the trade
export function computeTradeV3PriceBreakdown(trade?: TradeV4 | null): {
  priceImpactWithoutFee: Percent | undefined
  realizedLPFee: CurrencyAmount | undefined | null
} {
  // for each hop in our trade, take away the x*y=k price impact from 0.3% fees
  // e.g. for 3 tokens/2 hops: 1 - ((1 - .03) * (1-.03))
  const realizedLPFee = !trade
    ? undefined
    : ONE_HUNDRED_PERCENT.subtract(
      trade.route.pools.reduce<Fraction>(
        (currentFee: Fraction): Fraction => currentFee.multiply(INPUT_FRACTION_AFTER_FEE),
        ONE_HUNDRED_PERCENT,
      ),
    )

  let priceImpactWithoutFeeFraction;
  if (
    trade &&
    trade.route &&
    trade.route.pools[trade.route.pools.length - 1] instanceof WeightedPair  &&
     !JSBI.equal((trade.route.pools[trade.route.pools.length - 1] as WeightedPair).weight0, JSBI.BigInt(50))
  ) {
    const weightedPair = trade.route.pools[trade.route.pools.length - 1] as WeightedPair
    const outToken = wrappedCurrency(trade.route.output, trade.route.chainId)
    const reserveOut = weightedPair.reserveOf(outToken)
    priceImpactWithoutFeeFraction = reserveOut.subtract(wrappedCurrencyAmount(trade.outputAmount, trade.route.chainId)).divide(reserveOut.raw)
  }
  else {
    // remove lp fees from price impact
    priceImpactWithoutFeeFraction = trade && realizedLPFee ? trade.priceImpact.subtract(realizedLPFee) : undefined
  }
  // the x*y=k impact
  const priceImpactWithoutFeePercent = priceImpactWithoutFeeFraction
    ? new Percent(priceImpactWithoutFeeFraction?.numerator, priceImpactWithoutFeeFraction?.denominator)
    : undefined

  // the amount of the input that accrues to LPs
  const realizedLPFeeAmount =
    realizedLPFee &&
    trade &&
    (trade.inputAmount instanceof TokenAmount
      ? new TokenAmount(trade.inputAmount.token, realizedLPFee.multiply(trade.inputAmount.raw).quotient)
      : CurrencyAmount.networkCCYAmount(trade.route.chainId, realizedLPFee.multiply(trade.inputAmount.raw).quotient))

  return { priceImpactWithoutFee: priceImpactWithoutFeePercent, realizedLPFee: realizedLPFeeAmount }
}

// computes the minimum amount out and maximum amount in for a trade given a user specified allowed slippage in bips
export function computeSlippageAdjustedAmountsV3(
  trade: TradeV4 | undefined,
  allowedSlippage: number,
): { [field in Field]?: CurrencyAmount } {
  const pct = basisPointsToPercent(allowedSlippage)
  return {
    [Field.INPUT]: trade?.maximumAmountIn(pct),
    [Field.OUTPUT]: trade?.minimumAmountOut(pct),
  }
}

export function warningSeverity(priceImpact: Percent | undefined): 0 | 1 | 2 | 3 | 4 {
  if (!priceImpact?.lessThan(BLOCKED_PRICE_IMPACT_NON_EXPERT)) return 4
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_HIGH)) return 3
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_MEDIUM)) return 2
  if (!priceImpact?.lessThan(ALLOWED_PRICE_IMPACT_LOW)) return 1
  return 0
}

export function formatExecutionPriceV3(trade?: TradeV4, inverted?: boolean): string {
  if (!trade) {
    return ''
  }
  return inverted
    ? `${trade.executionPrice.invert().toSignificant(6)} ${trade.inputAmount.currency.symbol} / ${trade.outputAmount.currency.symbol
    }`
    : `${trade.executionPrice.toSignificant(6)} ${trade.outputAmount.currency.symbol} / ${trade.inputAmount.currency.symbol
    }`
}
