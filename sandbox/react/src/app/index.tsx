import React, {useReducer, useEffect, useCallback} from 'react'
import Card from '@/components/card'
import fetchData, {Post} from './fetch-data'
import {List} from './styles.scss'

const MAX_RECORDS = 10

function reducer(state: Post[], action): Post[] {
  if (action.type === `update`) {
    return action.posts
  }
  if (action.type === `like`) {
    const newState = state.map(
      post => post.id === action.postId
        ? {...post, liked: !post.liked}
        : post
    )
    return newState
  }
}

const App = () => {
  const [data, dispatch] = useReducer(reducer, [])
  const handleClick = useCallback(({currentTarget}) => {
    const postId = currentTarget.id
    dispatch({type: `like`, postId})
  }, [])

  useEffect(() => {
    const setData = (posts: Post[]) => dispatch({type: `update`, posts})
    fetchData(MAX_RECORDS, setData)
  }, [])

  return (
    <List>
      {data.map(post =>
        <Card
          key={post.id}
          post={post}
          onClick={handleClick}
        />
      )}
    </List>
  )
}

export default App
