import merge from 'lodash/merge'
import teamsList from 'config/constants/teams'
import { Team } from 'config/constants/types'
import { multicallv2 } from 'utils/multicall'
import { TeamsById } from 'state/types'
import profileABI from 'config/abi/pancakeProfile.json'
import { getPancakeProfileAddress } from 'utils/addressHelpers'

// const profileContract = getProfileContract()

export const getTeam = async (chainId:number, teamId: number): Promise<Team> => {
  try {
    const staticTeamInfo = teamsList.find((staticTeam) => staticTeam.id === teamId)

    return merge({}, staticTeamInfo, {

    })
  } catch (error: any) {
    return null
  }
}

/**
 * Gets on-chain data and merges it with the existing static list of teams
 */
export const getTeams = async (chainId:number): Promise<TeamsById> => {
  try {
    const teamsById = teamsList.reduce((accum, team) => {
      return {
        ...accum,
        [team.id]: team,
      }
    }, {})
    const nbTeams = null

    const calls = []
    for (let i = 1; i <= nbTeams; i++) {
      calls.push({
        address: getPancakeProfileAddress(chainId),
        name: 'getTeamProfile',
        params: [i],
      })
    }
    const teamData = await multicallv2(chainId,profileABI, calls)

    const onChainTeamData = teamData.reduce((accum, team, index) => {
      const { 0: teamName, 2: numberUsers, 3: numberPoints, 4: isJoinable } = team

      return {
        ...accum,
        [index + 1]: {
          name: teamName,
          users: numberUsers.toNumber(),
          points: numberPoints.toNumber(),
          isJoinable,
        },
      }
    }, {})

    return merge({}, teamsById, onChainTeamData)
  } catch (error: any) {
    return null
  }
}
