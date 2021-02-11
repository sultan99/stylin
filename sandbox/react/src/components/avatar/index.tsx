import React, {FC} from 'react'
import applyCss from '@stylin/style'
import styles from './styles.scss'
import url from '@/url'

const styled = applyCss(styles)
const AvatarBox = styled.div(`avatar-box`)
const Crop = styled.div(`crop`)
const Dot = styled.div(`dot`)
const Image = styled.div(`image`)

interface AvatarProps {
  size?: string
  src: string
  status: string
}

const Avatar: FC<AvatarProps> = ({src, status, size = `35px`}) => (
  <AvatarBox size={size}>
    <Crop>
      <Image src={url(src)}/>
    </Crop>
    <Dot status={status}/>
  </AvatarBox>
)

export default Avatar
