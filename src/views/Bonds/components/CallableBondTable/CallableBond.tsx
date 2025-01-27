import React from 'react'
import styled from 'styled-components'
import { useCallableBondUser, useCallableBondFromBondId, useGetOracleData } from 'state/bonds/hooks'
import { Flex, Text, useMatchBreakpoints } from '@requiemswap/uikit'
import { getBalanceNumber } from 'utils/formatBalance'
import { BondAssetType, SerializedToken } from 'config/constants/types'
import { deserializeToken } from 'state/user/hooks/helpers'
import PoolLogo from 'components/Logo/PoolLogo'
import { useGetOracle, useOracleState } from 'state/oracles/hooks'
import { useNetworkState } from 'state/globalNetwork/hooks'
import Logo from 'components/Logo/Logo'
import { getTokenLogoURLFromSymbol } from 'utils/getTokenLogoURL'

export interface CallableBondProps {
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


const CallableBond: React.FunctionComponent<CallableBondProps> = ({ label, bondId, tokens }) => {
  const { chainId } = useNetworkState()
  const { stakedBalance } = useCallableBondUser(bondId, chainId)
  const bond = useCallableBondFromBondId(bondId, chainId)
  const rawStakedBalance = getBalanceNumber(stakedBalance)
  const { isDesktop, isMobile } = useMatchBreakpoints()
  const handleRenderBonding = (): JSX.Element => {
    if (rawStakedBalance) {
      return (
        <Text color="secondary" fontSize="12px" bold textTransform="uppercase">
          Bonding
        </Text>
      )
    }

    return null
  }

  const oracleData = useGetOracle(chainId, bond?.market?.underlying, bond?.market?.quote)
  const decimalMultiplier = 10 ** oracleData?.displayDecimals

  return (
    <Container>
      <TokenWrapper>
        <PoolLogo tokens={tokens.map(tok => deserializeToken(tok))} size={25} overlap='-3px' />
      </TokenWrapper>
      {!isMobile ? (<div style={{ marginLeft: 25 }}>
        {handleRenderBonding()}
        <Flex flexDirection="column" mr='3px'>
          <Text marginLeft='-5px' bold fontSize='1'>{`${oracleData?.token}-Linked`}</Text>
          <Flex flexDirection="row">
            <StyledLogo size='15px' srcs={[getTokenLogoURLFromSymbol(oracleData?.token)]} alt={`${oracleData?.token ?? 'token'} logo`} />
            <Text marginLeft='1px' bold fontSize='10px'>{`${oracleData && (Math.round(Number(oracleData?.value) / 10 ** oracleData?.decimals * decimalMultiplier) / decimalMultiplier).toLocaleString()}`}</Text>
          </Flex>
          <Text bold fontSize={isMobile ? '1' : '2'}>{label}</Text>
        </Flex>
      </div>) :
        (
          <Flex flexDirection="column" mr='3px' ml='3px'>
            <Text marginLeft='-5px' bold fontSize='12px'>{`${oracleData?.token}-Linked`}</Text>
            <Flex flexDirection="row">
              <StyledLogo size='15px' srcs={[getTokenLogoURLFromSymbol(oracleData?.token)]} alt={`${oracleData?.token ?? 'token'} logo`} />
              <Text marginLeft='1px' bold fontSize='10px'>{`${oracleData && (Math.round(Number(oracleData?.value) / 10 ** oracleData?.decimals * decimalMultiplier) / decimalMultiplier).toLocaleString()}`}</Text>
            </Flex>
          </Flex>
        )}
    </Container>
  )
}

export default CallableBond
