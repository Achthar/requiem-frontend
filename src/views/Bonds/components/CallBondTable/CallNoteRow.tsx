import React, { useMemo } from 'react'
import styled from 'styled-components'
import { ethers } from 'ethers'
import { ChevronDownIcon, useMatchBreakpoints, Text, Flex } from '@requiemswap/uikit'
import { CallBond, CallNote } from 'state/types'
import { prettifySeconds } from 'config'
import { timeConverter, timeConverterNoMinutes, timeConverterNoYear } from 'utils/time'
import { formatSerializedBigNumber } from 'utils/formatBalance'
import BigNumber from 'bignumber.js'
import { useOracleState } from 'state/oracles/hooks'
import { useGetOracleData } from 'state/bonds/hooks'
import { TokenImage } from 'components/TokenImage'
import { ABREQ } from 'config/constants/tokens'
import { calculateUserPay } from 'utils/bondUtils'
import RedemptionAction from './Actions/RedemptionAction'

interface CallNoteProps {
    isMobile: boolean
    userDataReady: boolean
    note: CallNote
    bond: CallBond
    reqPrice: number
    isFirst: boolean
    isLast: boolean
}

interface NoteHeaderProps {
    userDataReady: boolean
    isMobile: boolean
    notes: CallNote[]
    bond: CallBond
    reqPrice: number
}


const ContentCol = styled.div`
  flex-direction: column;
  display: flex;
  width: 100%;
  justify-content: flex-end;
  gap: 10px;
  padding-right: 8px;
  color: ${({ theme }) => theme.colors.primary};

  ${({ theme }) => theme.mediaQueries.sm} {
    padding-right: 0px;
  }
`

const DescriptionCol = styled.div`
  flex-direction: column;
  display: flex;
  width: 100%;
  justify-content: flex-end;
  gap: 10px;
  padding-right: 2px;
  color: ${({ theme }) => theme.colors.primary};

  ${({ theme }) => theme.mediaQueries.sm} {
    padding-right: 0px;
    margin-top: 1px;
  }
`

const DescriptionColHeader = styled.div`
  flex-direction: column;
  display: flex;
  width: 100%;
  justify-content: flex-end;
  gap: 10px;
  padding-right: 2px;
  padding-left: 20px;
  color: ${({ theme }) => theme.colors.primary};

  ${({ theme }) => theme.mediaQueries.sm} {
    padding-right: 0px;
    margin-top: 1px;
  }
`

const ContentRow = styled.div`
  flex-direction: row;
  display: flex;
  width: 100%;
  justify-content: flex-end;
  gap: 5px;
  padding-right: 2px;
  padding-left: 7px;
  color: ${({ theme }) => theme.colors.primary};

  ${({ theme }) => theme.mediaQueries.sm} {
    padding-right: 0px;
  }
`

const Container = styled.div<{ isFirst: boolean, isLast: boolean, isMobile: boolean }>`
  border-left: 2px solid   #737373 ;
  border-right: 2px solid   #737373 ;
  ${({ isLast }) => isLast ? 'border-bottom: 2px solid   #737373 ;' : ''}
  border-top-left-radius: ${({ isFirst }) => isFirst ? '16px' : '0px'};
  border-top-right-radius: ${({ isFirst }) => isFirst ? '16px' : '0px'};
  border-bottom-left-radius: ${({ isLast }) => isLast ? '16px' : '0px'};
  border-bottom-right-radius: ${({ isLast }) => isLast ? '16px' : '0px'};
  background:${({ theme }) => theme.colors.overlay};
  ${({ isLast }) => isLast ? '' : 'margin-bottom: 5px;'}
  ${({ isMobile }) => isMobile ? '' : 'padding-left: 20px;'}
  align-items:center;
  flex-direction: row;
  display: flex;
  width: 100%;
  justify-content: flex-end;
  gap: 10px;
  padding-right: 8px;
  color: ${({ theme }) => theme.colors.overlay};

  ${({ theme }) => theme.mediaQueries.sm} {
    padding-right: 0px;
  }
`

const HeaderContainer = styled.div`
  border-top: 2px solid   #737373 ;
  border-left: 2px solid   #737373 ;
  border-right: 2px solid   #737373 ;
  border-top-left-radius:  16px ;
  border-top-right-radius: 16px ;
  margin-bottom:5px;
  background: linear-gradient(${({ theme }) => theme.colors.backgroundAlt},${({ theme }) => theme.colors.overlay}) ;
  align-items:center;
  flex-direction: row;
  display: flex;
  width: 100%;
  justify-content: flex-end;
  gap: 10px;
  padding: 8px;
  color: ${({ theme }) => theme.colors.backgroundAlt};

  ${({ theme }) => theme.mediaQueries.sm} {
    padding-right: 0px;
  }
`





export const CallNoteHeaderRow: React.FC<NoteHeaderProps> = ({ notes, userDataReady, bond, isMobile, reqPrice }) => {


    const [totalPayout, avgVesting] = useMemo(() => {
        const now = Math.round((new Date()).getTime() / 1000);
        const payouts = notes.map((note) => Number(formatSerializedBigNumber(note.payout, isMobile ? 3 : 5, 18)))
        const vestingTimes = notes.map(note => Number(note.matured) - now)
        let sumPa = 0
        let sumMulti = 0
        for (let i = 0; i < notes.length; i++) {
            const payout = payouts[i]
            sumPa += payout
            sumMulti += payout * vestingTimes[i]

        }
        return [sumPa, sumMulti / sumPa]

    }, [notes, isMobile])


    if (isMobile) {
        return (
            <HeaderContainer>
                <ContentRow>
                    <DescriptionCol>
                        <Text>Total Payout</Text>
                        <Text>{(totalPayout * reqPrice).toLocaleString()}$</Text>
                    </DescriptionCol>
                    <DescriptionCol>
                        <Text>Average Maturity</Text>
                        <Text>{prettifySeconds(avgVesting, 'day')}</Text>
                    </DescriptionCol>
                </ContentRow>
            </HeaderContainer>
        )
    }


    return (
        <HeaderContainer>
            <DescriptionColHeader>
                <Text>Total Payout</Text>
                <Text>Average Maturity</Text>

            </DescriptionColHeader>
            <DescriptionCol>
                <Text>{totalPayout.toPrecision(4)} ABREQ / {(totalPayout * reqPrice).toLocaleString()}$</Text>
                <Text>{prettifySeconds(avgVesting, 'd')}</Text>
            </DescriptionCol>
        </HeaderContainer>
    )

}




const CallNoteRow: React.FC<CallNoteProps> = ({ isLast, isFirst, note, userDataReady, bond, isMobile, reqPrice }) => {
    const chainId = bond?.tokens[0]?.chainId
    const now = Math.floor(Date.now() / 1000);
    const vestingTime = () => {
        const maturity = Number(note.matured)
        return (maturity >= now) ? prettifySeconds(maturity - now, "day") : 'Matured';
    };

    const oracleState = useOracleState(chainId)

    const oracleData = useGetOracleData(chainId, bond?.market?.underlying, oracleState.oracles)

    const payout = useMemo(() => { return formatSerializedBigNumber(note.payout, isMobile ? 3 : 5, 18) }, [note.payout, isMobile])
    const created = useMemo(() => { return timeConverterNoYear(Number(note.created)) }, [note.created])
    const expiry = useMemo(() => { return timeConverterNoYear(Number(note.matured)) }, [note.matured])

    const [moneynessPerc, optPayout] = useMemo(() => {
        const { moneyness, pay } = calculateUserPay(note, bond, oracleData?.value)
        const payoff = moneyness > 0 ? Number(ethers.utils.formatEther(bond?.bondTerms?.payoffPercentage)) * Number(payout) : 0
        const factor = isMobile ? 1000 : 100
        return [Math.round(moneyness * 10000) / 100, String(Math.round(payoff * factor) / factor)]

    }, [note, bond, oracleData, isMobile, payout])

    if (isMobile) {
        return (
            <Container isLast={isLast} isFirst={false} isMobile={isMobile}>
                <Flex flexDirection='column'>
                    <Flex flexDirection='row' marginBottom='7px'>
                        <ContentRow>
                            <DescriptionCol>
                                <Text>Payout:</Text>
                                <Text>End: </Text>
                            </DescriptionCol>
                            <DescriptionCol>
                                <Text>{payout}</Text>
                                <Text>{vestingTime()}</Text>
                            </DescriptionCol>
                        </ContentRow>
                        <RedemptionAction {...bond} userDataReady={userDataReady} note={note} reqPrice={new BigNumber(reqPrice)} />
                    </Flex>
                    <Flex flexDirection='row' justifyContent='space-between' marginLeft='7px'>
                        <DescriptionCol>
                            <Text>Moneyness:</Text>
                            <Text>Option Payout:</Text>
                            <Text>Notional:</Text>

                        </DescriptionCol>
                        <DescriptionCol>
                            <Text color={moneynessPerc > 0 ? 'green' : 'red'}>{moneynessPerc.toLocaleString()}%</Text>
                            <Flex flexDirection='row'>  <TokenImage token={ABREQ[chainId]} chainId={chainId} width={22} height={22} marginTop='1px' /><Text marginLeft='3px'>{optPayout}</Text></Flex>
                            <Flex flexDirection='row'>  <TokenImage token={ABREQ[chainId]} chainId={chainId} width={22} height={22} marginTop='1px' /><Text marginLeft='3px'>{payout}</Text></Flex>

                        </DescriptionCol>

                    </Flex>
                </Flex>
            </Container>
        )
    }


    return (
        <Container isLast={isLast} isFirst={false} isMobile={isMobile}>
            <ContentRow>
                <DescriptionCol>
                    <Text>Created:</Text>
                    <Text>Expiry:</Text>
                    <Text>Claimable in:</Text>
                </DescriptionCol>
                <DescriptionCol>
                    <Text>{created}</Text>
                    <Text>{expiry}</Text>
                    <Text>{vestingTime()}</Text>
                </DescriptionCol>
            </ContentRow>
            <ContentRow>
                <DescriptionCol>
                    <Text>Moneyness:</Text>
                    <Text>Option Payout:</Text>
                    <Text>Notional Payout:</Text>

                </DescriptionCol>
                <DescriptionCol>
                    <Text color={moneynessPerc > 0 ? 'green' : 'red'}>{moneynessPerc.toLocaleString()}%</Text>
                    <Flex flexDirection='row'>  <TokenImage token={ABREQ[chainId]} chainId={chainId} width={22} height={22} marginTop='1px' /><Text marginLeft='3px'>{optPayout}</Text></Flex>
                    <Flex flexDirection='row'>  <TokenImage token={ABREQ[chainId]} chainId={chainId} width={22} height={22} marginTop='1px' /><Text marginLeft='3px'>{payout}</Text></Flex>

                </DescriptionCol>
            </ContentRow>
            <RedemptionAction {...bond} userDataReady={userDataReady} note={note} reqPrice={new BigNumber(reqPrice)} />
        </Container>
    )

}

export default CallNoteRow