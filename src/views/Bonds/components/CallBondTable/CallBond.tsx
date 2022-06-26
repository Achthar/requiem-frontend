import React from 'react'
import styled from 'styled-components'
import { useBondUser, useCallBondFromBondId, useCallBondUser, useGetOracleData } from 'state/bonds/hooks'
import { useTranslation } from 'contexts/Localization'
import { Flex, Text, useMatchBreakpoints } from '@requiemswap/uikit'
import { getBalanceNumber } from 'utils/formatBalance'
import { BondAssetType, SerializedToken } from 'config/constants/types'
import { deserializeToken, serializeToken } from 'state/user/hooks/helpers'
import PoolLogo from 'components/Logo/PoolLogo'
import { useOracleState } from 'state/oracles/hooks'
import { useNetworkState } from 'state/globalNetwork/hooks'
import { CurrencyLogo } from 'components/Logo'
import Logo from 'components/Logo/Logo'
import { getTokenLogoURLFromSymbol } from 'utils/getTokenLogoURL'

export interface CallBondProps {
  label: string
  bondId: number
  bondType: BondAssetType
  tokens: SerializedToken[]
}

const Container = styled.div`
  padding-left: 16px;
  display: flex;
  align-items: center;

  ${({ theme }) => theme.mediaQueries.sm} {
    padding-left: 26px;
  }
`

const TokenWrapper = styled.div`
  padding-right: 8px;
  width: 48px;

  ${({ theme }) => theme.mediaQueries.sm} {
    width: 40px;
  }
`


const StyledLogo = styled(Logo) <{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
`


const CallBond: React.FunctionComponent<CallBondProps> = ({ label, bondId, tokens }) => {
  const { chainId } = useNetworkState()
  const { stakedBalance } = useCallBondUser(bondId)
  const bond = useCallBondFromBondId(bondId)
  const { t } = useTranslation()
  const rawStakedBalance = getBalanceNumber(stakedBalance)
  const { isDesktop, isMobile } = useMatchBreakpoints()
  const handleRenderBonding = (): JSX.Element => {
    if (rawStakedBalance) {
      return (
        <Text color="secondary" fontSize="12px" bold textTransform="uppercase">
          {t('Bonding')}
        </Text>
      )
    }

    return null
  }
  const oracleState = useOracleState(chainId)

  const oracleData = useGetOracleData(chainId, bond, oracleState.oracles)


  return (
    <Container>
      <TokenWrapper>
        <PoolLogo tokens={tokens.map(tok => deserializeToken(tok))} size={25} overlap='-3px' />
      </TokenWrapper>
      <div style={{ marginLeft: 25 }}>
        {handleRenderBonding()}
        <Flex flexDirection="column" mr='3px'>
          <Text marginLeft='-5px' bold fontSize={isMobile ? '0.6' : '1'}>{`${oracleData?.token}-Linked`}</Text>
          <Flex flexDirection="row">
            <StyledLogo size='15px' srcs={[getTokenLogoURLFromSymbol(oracleData?.token)]} alt={`${oracleData?.token ?? 'token'} logo`} />
            <Text marginLeft='1px' bold fontSize={isMobile ? '7px' : '10px'}>{`${oracleData && (Math.round(Number(oracleData?.value) / 10 ** oracleData?.decimals * 100) / 100).toLocaleString()}`}</Text>
          </Flex>
          <Text bold fontSize={isMobile ? '1' : '2'}>{label}</Text>
        </Flex>
      </div>
    </Container>
  )
}

export default CallBond
