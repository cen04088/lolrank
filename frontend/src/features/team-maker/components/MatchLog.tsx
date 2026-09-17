import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '@/api/client'
import { matchesApi } from '@/api/endpoints'
import { queryKeys, useMatches } from '@/api/queries'
import type { MatchRecord, Team } from '@/api/types'
import { PixelButton } from '@/components/PixelButton'
import { ConfirmModal, PixelModal } from '@/components/PixelModal'
import { useToast } from '@/components/Toast'

interface MatchLogProps {
  code: string
  /** 10자리가 모두 찼는지 (기록 버튼 활성 조건) */
  boardFull: boolean
}

const PREVIEW_COUNT = 5

/**
 * 조합(경기) 기록. 현재 보드를 스냅샷으로 저장하고 승패를 남긴다.
 * 쌓인 기록은 나중에 밸런스 보정(레이팅)의 학습 데이터로 쓴다.
 */
export function MatchLog({ code, boardFull }: MatchLogProps) {
  const toast = useToast()
  const queryClient = useQueryClient()
  const matches = useMatches(code)
  const [recordOpen, setRecordOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState<MatchRecord | null>(null)

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.matches(code) })
    queryClient.invalidateQueries({ queryKey: queryKeys.changeLogs(code) })
    // 승패가 바뀌면 보정치와 TEAM POWER 도 바뀐다
    queryClient.invalidateQueries({ queryKey: queryKeys.ratings(code) })
    queryClient.invalidateQueries({ queryKey: queryKeys.teamBoard(code) })
  }

  const record = useMutation({
    mutationFn: (body: { winner: Team | null; note: string }) =>
      matchesApi.record(code, { winner: body.winner, note: body.note.trim() || null }),
    onSuccess: () => {
      toast.success('조합을 기록했습니다.')
      setRecordOpen(false)
      invalidate()
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : '기록에 실패했습니다.'),
  })

  const setWinner = useMutation({
    mutationFn: ({ id, winner }: { id: number; winner: Team | null }) => matchesApi.update(id, { winner }),
    onSuccess: invalidate,
    onError: (err) => toast.error(err instanceof ApiError ? err.message : '결과를 저장하지 못했습니다.'),
  })

  const remove = useMutation({
    mutationFn: (id: number) => matchesApi.remove(id),
    onSuccess: () => {
      setDeleting(null)
      toast.success('기록을 삭제했습니다.')
      invalidate()
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : '삭제하지 못했습니다.'),
  })

  const list = matches.data ?? []
  const shown = expanded ? list : list.slice(0, PREVIEW_COUNT)

  return (
    <section className="mlog" aria-label="경기 기록">
      <header className="mlog__head">
        <div>
          <span className="mlog__label font-pixel">MATCH LOG</span>
          <h3 className="mlog__title font-pixel-ko">
            조합 기록 <span className="mlog__count font-pixel">{list.length}</span>
          </h3>
        </div>
        <PixelButton
          variant="blue"
          size="sm"
          onClick={() => setRecordOpen(true)}
          disabled={!boardFull}
          title={boardFull ? undefined : '10자리가 모두 채워진 조합만 기록할 수 있습니다.'}
        >
          📜 이 조합 기록하기
        </PixelButton>
      </header>

      {matches.isPending && <p className="mlog__empty">기록을 불러오는 중...</p>}
      {matches.isError && <p className="mlog__empty">기록을 불러오지 못했습니다.</p>}
      {matches.isSuccess && list.length === 0 && (
        <p className="mlog__empty">아직 기록이 없어요. 팀이 다 짜이면 조합을 남겨두세요. 쌓인 기록은 밸런스 보정에 쓰입니다.</p>
      )}

      {shown.length > 0 && (
        <ul className="mlog__list">
          {shown.map((m) => (
            <MatchRow
              key={m.id}
              match={m}
              busy={setWinner.isPending && setWinner.variables?.id === m.id}
              onWinner={(winner) => setWinner.mutate({ id: m.id, winner })}
              onDelete={() => setDeleting(m)}
            />
          ))}
        </ul>
      )}

      {list.length > PREVIEW_COUNT && (
        <button type="button" className="mlog__more" onClick={() => setExpanded((v) => !v)}>
          {expanded ? '접기' : `지난 기록 ${list.length - PREVIEW_COUNT}개 더 보기`}
        </button>
      )}

      <RecordModal
        open={recordOpen}
        loading={record.isPending}
        onClose={() => setRecordOpen(false)}
        onSubmit={(winner, note) => record.mutate({ winner, note })}
      />

      <ConfirmModal
        open={deleting !== null}
        title="DELETE RECORD"
        message={deleting ? `${formatDate(deleting.playedAt)} 기록을 삭제합니다. 되돌릴 수 없습니다.` : ''}
        confirmLabel="삭제"
        danger
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting.id)}
        onCancel={() => setDeleting(null)}
      />
    </section>
  )
}

interface MatchRowProps {
  match: MatchRecord
  busy: boolean
  onWinner: (winner: Team | null) => void
  onDelete: () => void
}

function MatchRow({ match, busy, onWinner, onDelete }: MatchRowProps) {
  const names = (team: Team) =>
    match.slots
      .filter((s) => s.team === team)
      .map((s) => s.characterName)
      .join(' · ')

  return (
    <li className={`mrow ${match.winner ? `mrow--${match.winner.toLowerCase()}` : ''}`}>
      <div className="mrow__meta">
        <time className="mrow__date font-pixel" dateTime={match.playedAt}>
          {formatDate(match.playedAt)}
        </time>
        <span className="mrow__score font-pixel" title="기록 당시 전투력 합계">
          {match.blueScore} : {match.redScore}
        </span>
        {match.note && <span className="mrow__note">{match.note}</span>}
      </div>

      <div className="mrow__teams">
        <div className={`mrow__team mrow__team--blue ${match.winner === 'BLUE' ? 'mrow__team--win' : ''}`}>
          <span className="mrow__tag font-pixel">BLUE{match.winner === 'BLUE' ? ' WIN' : ''}</span>
          <span className="mrow__names">{names('BLUE')}</span>
        </div>
        <span className="mrow__vs font-pixel" aria-hidden>
          VS
        </span>
        <div className={`mrow__team mrow__team--red ${match.winner === 'RED' ? 'mrow__team--win' : ''}`}>
          <span className="mrow__tag font-pixel">RED{match.winner === 'RED' ? ' WIN' : ''}</span>
          <span className="mrow__names">{names('RED')}</span>
        </div>
      </div>

      <div className="mrow__actions">
        {match.winner === null ? (
          <>
            <span className="mrow__pending">결과 미정</span>
            <PixelButton variant="blue" size="sm" onClick={() => onWinner('BLUE')} disabled={busy}>
              BLUE 승
            </PixelButton>
            <PixelButton variant="red" size="sm" onClick={() => onWinner('RED')} disabled={busy}>
              RED 승
            </PixelButton>
          </>
        ) : (
          <PixelButton variant="ghost" size="sm" onClick={() => onWinner(null)} disabled={busy} title="결과를 미정으로 되돌립니다">
            결과 취소
          </PixelButton>
        )}
        <PixelButton variant="ghost" size="sm" onClick={onDelete} aria-label="기록 삭제">
          삭제
        </PixelButton>
      </div>
    </li>
  )
}

interface RecordModalProps {
  open: boolean
  loading: boolean
  onClose: () => void
  onSubmit: (winner: Team | null, note: string) => void
}

function RecordModal({ open, loading, onClose, onSubmit }: RecordModalProps) {
  const [winner, setWinner] = useState<Team | null>(null)
  const [note, setNote] = useState('')

  const choose = (value: Team | null) => setWinner(value)

  return (
    <PixelModal
      open={open}
      title="RECORD MATCH"
      onClose={onClose}
      width={480}
      footer={
        <>
          <PixelButton variant="ghost" onClick={onClose} disabled={loading}>
            취소
          </PixelButton>
          <PixelButton variant="gold" onClick={() => onSubmit(winner, note)} loading={loading}>
            기록 저장
          </PixelButton>
        </>
      }
    >
      <div className="mrec">
        <p className="mrec__desc">지금 보드의 10명 조합을 그대로 저장합니다. 승패는 지금 정하거나, 경기가 끝난 뒤 기록에서 채울 수 있어요.</p>

        <div className="px-field">
          <span className="px-label">결과</span>
          <div className="mrec__winner" role="radiogroup" aria-label="승리 팀">
            {(
              [
                ['BLUE', 'BLUE 승'],
                ['RED', 'RED 승'],
                [null, '아직 미정'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={label}
                type="button"
                role="radio"
                aria-checked={winner === value}
                className={`mrec__choice ${value ? `mrec__choice--${value.toLowerCase()}` : ''} ${winner === value ? 'mrec__choice--on' : ''}`}
                onClick={() => choose(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-field">
          <label className="px-label" htmlFor="match-note">
            메모 <span className="mrec__max">(선택, 최대 100자)</span>
          </label>
          <input
            id="match-note"
            className="px-input"
            maxLength={100}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="예: 3판 2선승 1세트"
          />
        </div>
      </div>
    </PixelModal>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
