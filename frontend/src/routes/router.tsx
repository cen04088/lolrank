import { createBrowserRouter } from 'react-router-dom'
import { HomePage } from '@/pages/HomePage'
import { RoomLayout } from '@/pages/RoomLayout'
import { TeamMakerPage } from '@/pages/TeamMakerPage'
import { HierarchyPage } from '@/pages/HierarchyPage'
import { CharactersPage } from '@/pages/CharactersPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  {
    path: '/room/:code',
    element: <RoomLayout />,
    children: [
      { index: true, element: <TeamMakerPage /> },
      { path: 'hierarchy', element: <HierarchyPage /> },
      { path: 'characters', element: <CharactersPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
