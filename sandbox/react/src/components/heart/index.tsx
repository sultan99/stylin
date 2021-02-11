import React, {FC} from 'react'
import applyCss from '@stylin/style'
import heartSvg from './heart.svg'
import styles from './styles.scss'
import url from '@/url'

const styled = applyCss(styles)
const Icon = styled.div(`icon`)

interface CardProps {
  isRed: boolean
}

const Heart: FC<CardProps> = ({isRed}) => (
  <Icon
    isRed={isRed}
    src={url(heartSvg)}
  />
)

export default Heart
