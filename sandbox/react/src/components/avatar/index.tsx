import React, {FC} from 'react'
import {AvatarBox, Crop, Dot, Image} from './styles.scss'
import {PostAuthor} from '@/app/fetch-data'
import url from '@/url'

export interface AvatarProps {
  size?: string
  src: string
  status: PostAuthor[`status`]
}

const Avatar: FC<AvatarProps> = ({src, status, size}) => (
  <AvatarBox size={size}>
    <Crop>
      <Image src={url(src)}/>
    </Crop>
    <Dot status={status}/>
  </AvatarBox>
)

export default Avatar
