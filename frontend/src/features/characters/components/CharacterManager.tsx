import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { errorMessage } from '@/api/client'
import { charactersApi } from '@/api/endpoints'
import { queryKeys, useCharacters } from '@/api/queries'
import type { Character } from '@/api/types'
import { EmptyState } from '@/components/EmptyState'
import { PixelButton } from '@/components/PixelButton'
import { PixelLoader } from '@/components/PixelLoader'
import { ConfirmModal } from '@/components/PixelModal'
import { useToast } from '@/components/Toast'
import { CharacterCard } from './CharacterCard'
import { CharacterFormModal } from './CharacterFormModal'
import './characters.css'

interface CharacterManagerProps {
  code: string
}

type FormState = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; character: Character }

export function CharacterManager({ code }: CharacterManagerProps) {
  const characters = useCharacters(code)
  const queryClient = useQueryClient()
  const toast = useToast()
  const [form, setForm] = useState<FormState>({ mode: 'closed' })
  const [deleting, setDeleting] = useState<Character | null>(null)

  const remove = useMutation({
    mutationFn: (character: Character) => charactersApi.remove(character.id),
    onSuccess: (_result, character) => {
      toast.success(`${character.name} 캐릭터를 삭제했습니다.`)
      setDeleting(null)
      queryClient.invalidateQueries({ queryKey: queryKeys.characters(code) })
      queryClient.invalidateQueries({ queryKey: queryKeys.teamBoard(code) })
      queryClient.invalidateQueries({ queryKey: queryKeys.changeLogs(code) })
    },
    onError: (error) => toast.error(errorMessage(error, '캐릭터를 삭제하지 못했습니다.')),
  })

  if (characters.isPending) return <PixelLoader label="LOADING ROSTER" />

  if (characters.isError) {
    return (
      <EmptyState
        icon="⚠"
        message="캐릭터 목록을 불러오지 못했습니다."
        action={
          <PixelButton variant="gold" onClick={() => characters.refetch()}>
            다시 시도
          </PixelButton>
        }
      />
    )
  }

  return (
    <div className="chars">
      <header className="chars__head">
        <div>
          <h1 className="chars__title font-pixel">ROSTER</h1>
          <p className="chars__sub">
            전체 캐릭터 <strong>{characters.data.length}</strong>명 · 누구나 만들고 수정할 수 있습니다.
          </p>
        </div>
        <PixelButton variant="gold" icon="+" onClick={() => setForm({ mode: 'create' })}>
          새 캐릭터
        </PixelButton>
      </header>

      {characters.data.length === 0 ? (
        <EmptyState
          icon="🏟"
          message="아직 등록된 선수가 없습니다!"
          hint="첫 캐릭터를 만들어 팀 메이커에 등장시켜 보세요."
          action={
            <PixelButton variant="gold" pixelFont onClick={() => setForm({ mode: 'create' })}>
              첫 캐릭터 만들기
            </PixelButton>
          }
        />
      ) : (
        <ul className="chars__grid">
          {characters.data.map((character) => (
            <li key={character.id}>
              <CharacterCard
                character={character}
                onEdit={() => setForm({ mode: 'edit', character })}
                onDelete={() => setDeleting(character)}
              />
            </li>
          ))}
        </ul>
      )}

      <CharacterFormModal
        code={code}
        open={form.mode !== 'closed'}
        character={form.mode === 'edit' ? form.character : undefined}
        onClose={() => setForm({ mode: 'closed' })}
      />

      <ConfirmModal
        open={deleting !== null}
        title="DELETE CHARACTER"
        message={
          deleting ? (
            <>
              <strong>{deleting.name}</strong> 캐릭터를 삭제할까요? 팀 보드와 계급도에서도 함께 사라지며 되돌릴 수
              없습니다.
            </>
          ) : (
            ''
          )
        }
        confirmLabel="삭제"
        danger
        loading={remove.isPending}
        onConfirm={() => deleting && remove.mutate(deleting)}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
