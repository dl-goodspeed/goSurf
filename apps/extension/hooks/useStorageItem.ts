import { useState, useEffect, useCallback } from 'react'

interface StorageItemLike<T> {
  getValue(): Promise<T>
  setValue(value: T): Promise<void>
  watch(callback: (newValue: T) => void): () => void
}

/**
 * Mirrors the desktop app's useLocalStorage([value, setValue]) shape, plus a
 * `loaded` flag — @wxt-dev/storage's getValue() is async (unlike
 * localStorage), so callers show nothing meaningful until loaded is true.
 */
export function useStorageItem<T>(
  item: StorageItemLike<T>,
  initialValue: T
): [T, (value: T) => void, boolean] {
  const [value, setValueState] = useState<T>(initialValue)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    item.getValue().then((v) => {
      if (cancelled) return
      setValueState(v)
      setLoaded(true)
    })

    const unwatch = item.watch((newValue) => setValueState(newValue))
    return () => {
      cancelled = true
      unwatch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item])

  const setValue = useCallback(
    (v: T) => {
      setValueState(v)
      item.setValue(v)
    },
    [item]
  )

  return [value, setValue, loaded]
}
