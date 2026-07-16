import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react"

export type MentionUser = {
  id: string
  label: string
}

export type MentionListRef = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

type MentionListProps = {
  items: MentionUser[]
  command: (item: MentionUser) => void
}

export const MentionList = forwardRef<
  MentionListRef,
  MentionListProps
>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]

    if (item) {
      props.command(item)
    }
  }

  const upHandler = () => {
    if (!props.items.length) {
      return
    }

    setSelectedIndex(
      (selectedIndex + props.items.length - 1) %
        props.items.length
    )
  }

  const downHandler = () => {
    if (!props.items.length) {
      return
    }

    setSelectedIndex(
      (selectedIndex + 1) % props.items.length
    )
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => {
    setSelectedIndex(0)
  }, [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === "ArrowUp") {
        upHandler()
        return true
      }

      if (event.key === "ArrowDown") {
        downHandler()
        return true
      }

      if (event.key === "Enter") {
        enterHandler()
        return true
      }

      return false
    },
  }))

  if (!props.items.length) {
    return <div className="mention-list">No users found</div>
  }

  return (
    <div className="mention-list">
      {props.items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          className={
            index === selectedIndex
              ? "mention-item is-selected"
              : "mention-item"
          }
          onClick={() => selectItem(index)}
        >
          @{item.label}
        </button>
      ))}
    </div>
  )
})

MentionList.displayName = "MentionList"