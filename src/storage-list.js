const Storage = require('./storage.js')

module.exports = {
  add,
  count,
  exists,
  list,
  listAll,
  remove
}

async function list(path, offset, pageSize) {
  if (!path) {
    throw new Error('invalid-path')
  }
  const listExists = await Storage.exists(path)
  if (!listExists) {
    return null
  }
  offset = offset || 0
  if (pageSize === null || pageSize === undefined) {
    pageSize = global.pageSize
  }
  if (offset < 0) {
    throw new Error('invalid-offset')
  }
  if (offset && offset >= pageSize) {
    throw new Error('invalid-offset')
  }
  const json = await Storage.read(path)
  if (!json || !json.length) {
    return null
  }
  const itemids = JSON.parse(json)
  if (!itemids || !itemids.length) {
    return null
  }
  if (offset) {
    itemids.splice(0, offset)
  }
  if (itemids.length > pageSize) {
    itemids.splice(pageSize, itemids.length - pageSize)
  }
  return itemids
}

async function exists(path, itemid) {
  const listExists = await Storage.exists(path)
  if (!listExists) {
    return false
  }
  const all = await listAll(path)
  if (!all || !all.length) {
    return false
  }
  return all.indexOf(itemid) > -1
}

async function add(path, itemid) {
  const listExists = await Storage.exists(path)
  if (!listExists) {
    return Storage.write(path, [itemid])
  }
  const all = await listAll(path)
  if (!all || !all.length) {
    return Storage.write(path, [itemid])
  }
  if (all.indexOf(itemid) > -1) {
    return
  }
  all.unshift(itemid)
  return Storage.write(path, all)
}

async function count(path) {
  const listExists = await Storage.exists(path)
  if (!listExists) {
    return 0
  }
  const all = await listAll(path)
  if (!all || !all.length) {
    return 0
  }
  return all.length
}

async function listAll(path) {
  if (!path) {
    throw new Error('invalid-path')
  }
  const listExists = await Storage.exists(path)
  if (!listExists) {
    return null
  }
  const json = await Storage.read(path)
  if (!json || !json.length) {
    return null
  }
  const itemids = JSON.parse(json)
  if (!itemids || !itemids.length) {
    return null
  }
  return itemids
}

async function remove(path, itemid) {
  const listExists = await Storage.exists(path)
  if (!listExists) {
    return
  }
  const all = await listAll(path)
  if (!all || !all.length) {
    return
  }
  const index = all.indexOf(itemid)
  if (index === -1) {
    return
  }
  all.splice(index, 1)
  return Storage.write(path, all)
}