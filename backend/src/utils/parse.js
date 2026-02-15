const toBoolean = (value) => {
  if (typeof value === "boolean") return value
  if (typeof value !== "string") return false
  return ["true", "1", "yes", "on"].includes(value.toLowerCase())
}

const toNumber = (value) => {
  if (value === undefined || value === null || value === "") return undefined
  const num = Number(value)
  return Number.isFinite(num) ? num : undefined
}

module.exports = {
  toBoolean,
  toNumber,
}
