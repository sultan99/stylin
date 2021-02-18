import React, {FC} from 'react'
import heartSvg from './heart.svg'
import {Icon} from './styles.scss'
import url from '@/url'
interface CardProps {
  isRed: boolean
}

const Heart: FC<CardProps> = ({isRed}) => (
  <Icon isRed={isRed} src={url(heartSvg)}/>
)

export default Heart
