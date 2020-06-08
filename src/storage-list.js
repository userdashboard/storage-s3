const fs = require('fs')
const path = require('path')
const util = require('util')

module.exports = {
  setup: util.promisify((storage, moduleName, callback) => {
    if (!callback) {
      if (moduleName) {
        callback = moduleName
        moduleName = null
      } else if (storage) {
        callback = storage
        storage = null
      }
    }
    const dashboardPath1 = path.join(global.applicationPath, 'node_modules/@userdashboard/dashboard/src/log.js')
    let Log
    if (fs.existsSync(dashboardPath1)) {
      Log = require(dashboardPath1)('s3-list')
    } else {
      const dashboardPath2 = path.join(global.applicationPath, 'src/log.js')
      Log = require(dashboardPath2)('s3-list')
    }
    const container = {
      add: util.promisify((path, itemid, callback) => {
        return storage.write(`list/${path}/${itemid}`, '', (error) => {
          if (error) {
            Log.error('error adding item', error)
            return callback(new Error('unknown-error'))
          }
          return callback()
        })
      }),
      addMany: util.promisify((items, callback) => {
        const keys = Object.keys(items)
        function nextItem () {
          if (!items.length) {
            return callback()
          }
          const path = keys.shift()
          return storage.write(`list/${path}/${items[path]}`, '', (error) => {
            if (error) {
              Log.error('error adding many', error)
              return callback(new Error('unknown-error'))
            }
            return nextItem()
          })
        }
        return nextItem()
      }),
      count: util.promisify((path, callback) => {
        return storage.list(`list/${path}`, (error, all) => {
          if (error) {
            Log.error('error adding item', error)
            return callback(new Error('unknown-error'))
          }
          if (!all || !all.length) {
            return 0
          }
          return callback(null, all.length)
        })
      }),
      exists: util.promisify((path, itemid, callback) => {
        return storage.exists(`list/${path}/${itemid}`, (error, exists) => {
          if (error) {
            Log.error('error adding item', error)
            return callback(new Error('unknown-error'))
          }
          return callback(null, exists)
        })
      }),
      list: util.promisify((path, offset, pageSize, callback) => {
        if (!callback) {
          if (pageSize) {
            callback = pageSize
            pageSize = null
          } else if (offset) {
            callback = offset
            offset = null
          }
        }
        offset = offset || 0
        if (pageSize === null || pageSize === undefined) {
          pageSize = global.pageSize
        }
        if (offset < 0) {
          return callback(new Error('invalid-offset'))
        }
        return storage.list(`list/${path}`, (error, list) => {
          if (error) {
            Log.error('error adding item', error)
            return callback(new Error('unknown-error'))
          }
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
          return callback(null, list)
        })
      }),
      listAll: util.promisify((path, callback) => {
        return storage.list(`list/${path}`, (error, list) => {
          if (error) {
            Log.error('error adding item', error)
            return callback(new Error('unknown-error'))
          }
          if (!list || !list.length) {
            return null
          }
          for (const i in list) {
            list[i] = list[i].split('/').pop()
          }
          return callback(null, list)
        })
      }),
      remove: util.promisify((path, itemid, callback) => {
        return storage.delete(`list/${path}/${itemid}`, (error) => {
          if (error) {
            Log.error('error adding item', error)
            return callback(new Error('unknown-error'))
          }
          return callback()
        })
      })
    }
    return callback(null, container)
  })
}
