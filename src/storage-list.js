module.exports = {
  setup: async (storage) => {
    const container = {
      add: async (path, itemid) => {
        const exists = await storage.exists(`list/${path}/${itemid}`)
        if (exists) {
          return
        }
        return storage.write(`list/${path}/${itemid}`, '')
      },
      count: async (path) => {
        const all = await storage.list(`list/${path}`)
        if (!all || !all.length) {
          return 0
        }
        return all.length
      },
      exists: async (path, itemid) => {
        return storage.exists(`list/${path}/${itemid}`)
      },
      list: async (path, offset, pageSize) => {
        offset = offset || 0
        if (pageSize === null || pageSize === undefined) {
          pageSize = global.pageSize
        }
        if (offset < 0) {
          throw new Error('invalid-offset')
        }
        let list = await storage.list(`list/${path}`)
        if (!list || !list.length) {
          return null
        }
        if (offset) {
          list.splice(0, offset)
        }
        if (list.length > pageSize) {
          list = list.slice(0, pageSize)
        }
        for (const i in list) {
          list[i] = list[i].split('/').pop()
        }
        return list
      },
      listAll: async (path) => {
        const list = await storage.list(`list/${path}`)
        if (!list || !list.length) {
          return null
        }
        for (const i in list) {
          list[i] = list[i].split('/').pop()
        }
        return list
      },
      remove: async (path, itemid) => {
        return storage.delete(`list/${path}/${itemid}`)
      }
    }
    return container
  }
}
