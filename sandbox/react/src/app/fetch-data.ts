function random(min: number, max: number): number {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const capitalize = (str: string): string => (
  str.charAt(0).toUpperCase() + str.slice(1)
)

const toCapitalize = (str: string): string => (
  str.split(` `).map(capitalize).join(` `)
)

function genUserAva(name: string): string {
  const gender = random(0, 1) ? `male` : `female`
  return `https://avatars.dicebear.com/api/${gender}/${name}.svg`
}

function genLastVisit() {
  const chance = random(0, 8)
  const lastSeen = chance < 3 ? `yesterday` : chance < 6 ? `a week ago` : `a long time ago...`
  return `Last seen ${lastSeen}`
}

const statusText = {
  online: `Hi, I'm online!`,
  busy: `Not now, sorry I'm busy`,
}

function genStatus() {
  const chance = random(0, 10)
  const status = chance < 3 ? `online` : chance < 5 ? `busy` : `offline`
  return {status, lastVisit: statusText[status] || genLastVisit()}
}
export interface AuthorType {
  name: string
  imageUrl: string
  status: string
  lastVisit: string
}
export interface PostType {
  id: string
  photoUrl: string
  author: AuthorType
}

const offset = random(1, 100)
const pickData = ({results}): PostType[] => results.map((item, index) => ({
  id: item.login.uuid,
  photoUrl: `https://picsum.photos/id/${index + offset}/400`,
  author: {
    name: toCapitalize(`${item.name.first} ${item.name.last}`),
    imageUrl: genUserAva(item.name.first),
    ... genStatus(),
  }
}))

const fetchData = (limit: number, setData: (data: PostType[]) => void) => () => {
  fetch(`https://randomuser.me/api/?nat=us,dk,fr,gb&results=${limit}`)
    .then(response => response.json())
    .then(pickData)
    .then(setData)

  return () => {}
}

export default fetchData
