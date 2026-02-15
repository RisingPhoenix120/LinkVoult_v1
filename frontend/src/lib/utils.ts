import clsx from "clsx"

export const cn = (...classes: Array<string | undefined | null | false>) =>
  clsx(classes)
