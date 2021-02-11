import React, {FC} from 'react'
import Avatar from '@/components/avatar'
import applyCss from '@stylin/style'
import styles from './styles.scss'
import {AuthorType} from '@/app/fetch-data'

const styled = applyCss(styles)
const AvaBox = styled.div(`ava-box`)
const Description = styled.span(`description`)
const TextBox = styled.div(`text-box`)
const Title = styled.h1(`title`)

const AvaText: FC<AuthorType> = ({imageUrl, lastVisit, name, status}) => (
  <AvaBox>
    <Avatar src={imageUrl} status={status}/>
    <TextBox>
      <Title>{name}</Title>
      <Description>{lastVisit}</Description>
    </TextBox>
  </AvaBox>
)

export default AvaText
