import React, {useEffect, useState} from 'react'
import Card from '@/components/card'
import applyCss from '@stylin/style'
import fetchData, {PostType} from './fetch-data'
import styles from './styles.scss'

const MAX_RECORDS = 80
const styled = applyCss(styles)
const List = styled.section(`grid`)

const App = () => {
  const [data, setData] = useState<PostType[]>([])
  const [selected, setSelected] = useState<string[]>([])

  const handleClick = (postId: string) => () => {
    const newList = selected.includes(postId)
      ? selected.filter(id => id !== postId)
      : [...selected, postId]
    setSelected(newList)
  }

  useEffect(fetchData(MAX_RECORDS, setData), [])

  return (
    <List>
      {data.map(({id, author, photoUrl}) =>
        <Card
          key={id}
          author={author}
          hoverEnabled={true}
          imageUrl={photoUrl}
          liked={selected.some(selectedId => selectedId === id)}
          onClick={handleClick(id)}
        />
      )}
    </List>
  )
}

export default App
