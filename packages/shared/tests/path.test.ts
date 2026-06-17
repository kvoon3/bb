import { expect, test, vi } from 'vite-plus/test'

import { ensurePath, findNodeByPath, getFoldersFromTree } from '../src/index.ts'
import type { BookmarkNode } from '../src/index.ts'

type NodeParams = {
  id: string
  title: string
  url?: string
  children?: NodeParams[]
}

function makeNode(node: NodeParams): BookmarkNode {
  return {
    ...node,
    syncing: false,
    children: node.children?.map(makeNode),
  }
}

function makeTree(rootChildren: NodeParams[] = []): BookmarkNode[] {
  return [
    makeNode({
      id: '0',
      title: '',
      children: [
        {
          id: '1',
          title: 'Bookmarks Bar',
          children: rootChildren,
        },
      ],
    }),
  ]
}

test('findNodeByPath finds existing folders', () => {
  const tree = makeTree([
    {
      id: 'work',
      title: 'Work',
      children: [{ id: 'clients', title: 'Clients', children: [] }],
    },
  ])

  expect(findNodeByPath(tree, '')?.id).toBe('1')
  expect(findNodeByPath(tree, 'Work')?.id).toBe('work')
  expect(findNodeByPath(tree, 'Work/Clients')?.id).toBe('clients')
})

test('findNodeByPath ignores bookmark nodes', () => {
  const tree = makeTree([
    {
      id: 'work',
      title: 'Work',
      children: [{ id: 'github', title: 'GitHub', url: 'https://github.com' }],
    },
  ])

  expect(findNodeByPath(tree, 'Work/GitHub')).toBeUndefined()
})

test('findNodeByPath handles leading and trailing slashes', () => {
  const tree = makeTree([{ id: 'work', title: 'Work', children: [] }])

  expect(findNodeByPath(tree, '/Work/')?.id).toBe('work')
})

test('findNodeByPath returns undefined for missing paths', () => {
  const tree = makeTree([{ id: 'work', title: 'Work', children: [] }])

  expect(findNodeByPath(tree, 'Personal')).toBeUndefined()
  expect(findNodeByPath(tree, 'Work/Missing')).toBeUndefined()
})

test('findNodeByPath returns undefined when tree is empty', () => {
  expect(findNodeByPath([], 'Work')).toBeUndefined()
  expect(findNodeByPath([makeNode({ id: '0', title: '', children: [] })], 'Work')).toBeUndefined()
})

test('ensurePath returns existing folder without calling createFolder', async () => {
  const tree = makeTree([{ id: 'work', title: 'Work', children: [] }])
  const createFolder = vi.fn()

  const result = await ensurePath(tree, 'Work', createFolder)

  expect(result.id).toBe('work')
  expect(createFolder).not.toHaveBeenCalled()
})

test('ensurePath creates missing folders and mutates the tree', async () => {
  const tree = makeTree([{ id: 'work', title: 'Work', children: [] }])

  let idCounter = 10
  const createFolder = vi.fn(
    async ({ parentId: _parentId, title }: { parentId: string; title: string }) => {
      return makeNode({ id: String(idCounter++), title, children: [] })
    },
  )

  const result = await ensurePath(tree, 'Work/Clients/Acme', createFolder)

  expect(createFolder).toHaveBeenCalledTimes(2)
  expect(createFolder).toHaveBeenNthCalledWith(1, { parentId: 'work', title: 'Clients' })
  expect(createFolder).toHaveBeenNthCalledWith(2, { parentId: '10', title: 'Acme' })

  expect(result.title).toBe('Acme')
  expect(result.id).toBe('11')

  // The tree was mutated so subsequent lookups succeed.
  const found = findNodeByPath(tree, 'Work/Clients/Acme')
  expect(found?.id).toBe('11')
})

test('ensurePath creates folders under the root', async () => {
  const tree = makeTree([])

  let idCounter = 100
  const createFolder = vi.fn(
    async ({ parentId: _parentId, title }: { parentId: string; title: string }) => {
      return makeNode({ id: String(idCounter++), title, children: [] })
    },
  )

  const result = await ensurePath(tree, 'Personal', createFolder)

  expect(createFolder).toHaveBeenCalledTimes(1)
  expect(createFolder).toHaveBeenCalledWith({ parentId: '1', title: 'Personal' })
  expect(result.title).toBe('Personal')
})

test('ensurePath throws when bookmark root is missing', async () => {
  await expect(ensurePath([], 'Work', vi.fn())).rejects.toThrow('Could not find bookmark root')
})

test('getFoldersFromTree returns all folder nodes', () => {
  const tree = makeTree([
    {
      id: 'work',
      title: 'Work',
      children: [
        { id: 'clients', title: 'Clients', children: [] },
        { id: 'github', title: 'GitHub', url: 'https://github.com' },
      ],
    },
  ])

  const folders = getFoldersFromTree(tree)
  expect(folders.map((n) => n.id)).toEqual(['0', '1', 'work', 'clients'])
})

test('getFoldersFromTree ignores bookmark nodes', () => {
  const tree = makeTree([{ id: 'github', title: 'GitHub', url: 'https://github.com' }])

  const folders = getFoldersFromTree(tree)
  expect(folders.every((n) => n.url === undefined)).toBe(true)
  expect(folders.map((n) => n.id)).toEqual(['0', '1'])
})

test('getFoldersFromTree returns empty array when tree is empty', () => {
  expect(getFoldersFromTree([])).toEqual([])
})
