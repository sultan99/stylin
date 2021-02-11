// wrapper for css url(--src)
// https://stackoverflow.com/questions/42330075/is-there-a-way-to-interpolate-css-variables-with-url

const url = (src: string): string => `url(${src})`

export default url
