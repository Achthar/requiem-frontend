import React, { useMemo } from 'react'
import { CurrencyAmount, Percent, Pool } from '@requiemswap/sdk'
import { Text } from '@requiemswap/uikit'
import { CurrencyLogo } from 'components/Logo'
import Row from 'components/Row'
import Column from 'components/Column'
import { AutoColumn } from '../Layout/Column'
import { AutoRow } from '../Layout/Row'
import { ONE_BIPS, ZERO_PERCENT } from '../../config/constants'



function PoolPriceBar({
  pool,
  poolTokenPercentage,
  formattedAmounts
}: {
  pool: Pool
  poolTokenPercentage?: Percent
  formattedAmounts?: CurrencyAmount[]
}) {
  const amounts = useMemo(() =>
    pool?.getTokenAmounts()
    , [pool])

  const percentages = useMemo(() => {
    return formattedAmounts?.map((amnt, index) => amnt && new
      Percent(
        amnt?.raw ?? '0',
        amounts?.[index]?.raw ?? '1'))
  }, [amounts, formattedAmounts])

  return (
    <AutoColumn gap="md">
      <AutoRow justify="space-around" gap="4px">
        <AutoColumn justify="center">
          {amounts && (
            <Column>
              <Row justify="start" gap="7px">
                <Text fontSize="13px" bold>
                  Reserves
                </Text>
                <Text fontSize="10px" marginLeft="15px">
                  Share Added
                </Text>
              </Row>

              {pool && pool?.getTokenAmounts().map((amount, index) => {
                return (<Row justify="start" gap="7px" key={`row-${amount?.token?.symbol}`}>
                  <CurrencyLogo chainId={pool?.chainId} currency={amount.token} size='15px' style={{ marginRight: '4px' }} />
                  <Text fontSize="14px" >
                    {
                      amount.toSignificant(6)
                    }
                  </Text>
                  <Text fontSize="10px" marginLeft="15px">
                    {
                      percentages?.[index]?.equalTo(ZERO_PERCENT) ? '0' :
                        (percentages?.[index]?.lessThan(ONE_BIPS) ? '<0.01' : percentages?.[index]?.toFixed(2)) ?? '0'}
                    %
                  </Text>
                </Row>)
              })}
            </Column>
          )}
        </AutoColumn>
        <AutoColumn justify="center">
          <Text>
            {
              poolTokenPercentage?.equalTo(ZERO_PERCENT) ? '0' :
                (poolTokenPercentage?.lessThan(ONE_BIPS) ? '<0.01' : poolTokenPercentage?.toFixed(2)) ?? '0'}
            %
          </Text>
          <Text fontSize="12px" pt={1}>
            {`Total Share of ${pool?.liquidityToken.name} minted`}
          </Text>
        </AutoColumn>
      </AutoRow>
    </AutoColumn>
  )
}

export default PoolPriceBar
