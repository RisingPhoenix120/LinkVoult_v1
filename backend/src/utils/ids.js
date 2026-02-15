const { nanoid } = require("nanoid")

const createSlug = () => nanoid(16)
const createDeleteKey = () => nanoid(24)

module.exports = {
  createSlug,
  createDeleteKey,
}
