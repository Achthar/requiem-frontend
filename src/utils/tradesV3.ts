import { TradeV4, Percent, currencyEquals } from '@requiemswap/sdk'
import { ZERO_PERCENT, ONE_HUNDRED_PERCENT } from '../config/constants/index'

// returns whether tradeB is better than tradeA by at least a threshold percentage amount
export function isTradeV3Better(
  tradeA: TradeV4 | undefined | null,
  tradeB: TradeV4 | undefined | null,
  minimumDelta: Percent = ZERO_PERCENT,
): boolean | undefined {
  if (tradeA && !tradeB) return false
  if (tradeB && !tradeA) return true
  if (!tradeA || !tradeB) return undefined

  if (
    tradeA.tradeType !== tradeB.tradeType ||
    !currencyEquals(tradeA.inputAmount.currency, tradeB.inputAmount.currency) ||
    !currencyEquals(tradeB.outputAmount.currency, tradeB.outputAmount.currency)
  ) {
    throw new Error('Trades are not comparable')
  }

  if (minimumDelta.equalTo(ZERO_PERCENT)) {
    return tradeA.executionPrice.lessThan(tradeB.executionPrice)
  }
  return tradeA.executionPrice.raw.multiply(minimumDelta.add(ONE_HUNDRED_PERCENT)).lessThan(tradeB.executionPrice)
}

export default isTradeV3Better