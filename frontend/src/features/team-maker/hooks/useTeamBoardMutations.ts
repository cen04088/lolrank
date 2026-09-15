import { useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { errorMessage } from '@/api/client'
import { teamBoardApi } from '@/api/endpoints'
import { queryKeys } from '@/api/queries'
import type { Slot, TeamBoard } from '@/api/types'
import { useToast } from '@/components/Toast'
import { toSlotRequests } from '../utils/board'

interface BoardMutationContext {
  previous?: TeamBoard
  ticket: number
}

/**
 * 팀 보드 관련 서버 반영. 드롭은 Optimistic 으로 즉시 반영하고 실패하면 롤백한다.
 * 연속 드롭 시 이전 요청의 응답이 최신 낙관적 상태를 덮어쓰지 않도록 ticket 으로 최신 요청만 반영한다.
 */
export function useTeamBoardMutations(code: string) {
  const queryClient = useQueryClient()
  const toast = useToast()
  const boardKey = queryKeys.teamBoard(code)
  const latestTicket = useRef(0)

  const setBoard = (board: TeamBoard) => queryClient.setQueryData(boardKey, board)
  const invalidateLogs = () => queryClient.invalidateQueries({ queryKey: queryKeys.changeLogs(code) })

  const updateBoard = useMutation<TeamBoard, unknown, Slot[], BoardMutationContext>({
    mutationFn: (slots) => teamBoardApi.update(code, toSlotRequests(slots)),
    onMutate: async (slots) => {
      await queryClient.cancelQueries({ queryKey: boardKey })
      const previous = queryClient.getQueryData<TeamBoard>(boardKey)
      if (previous) setBoard({ ...previous, slots })
      const ticket = ++latestTicket.current
      return { previous, ticket }
    },
    onSuccess: (board, _slots, context) => {
      if (context.ticket === latestTicket.current) setBoard(board)
    },
    onError: (error, _slots, context) => {
      if (context?.previous && context.ticket === latestTicket.current) setBoard(context.previous)
      toast.error(errorMessage(error, '팀 정보를 저장하지 못했습니다. 다시 시도해주세요.'))
    },
    onSettled: invalidateLogs,
  })

  const autoFill = useMutation<TeamBoard, unknown, void>({
    mutationFn: () => teamBoardApi.autoFill(code),
    onSuccess: (board) => {
      latestTicket.current++
      setBoard(board)
      toast.success(`자동 배정 완료! ${board.balance.message}`)
    },
    onError: (error) => toast.error(errorMessage(error, '자동 배정에 실패했습니다. 다시 시도해주세요.')),
    onSettled: invalidateLogs,
  })

  const updateParticipants = useMutation<TeamBoard, unknown, number[]>({
    mutationFn: (characterIds) => teamBoardApi.updateParticipants(code, characterIds),
    onSuccess: (board) => {
      latestTicket.current++
      setBoard(board)
      toast.success(`오늘의 참가자 ${board.participantIds.length}명을 저장했습니다.`)
    },
    onError: (error) => toast.error(errorMessage(error, '참가자를 저장하지 못했습니다.')),
    onSettled: invalidateLogs,
  })

  return { updateBoard, autoFill, updateParticipants }
}
