const FS = require('fs')
const Path = require('path')

/**
 * Utility methods
 */
class Util {
/**
   *
   * @param {string} file
   * @param {Buffer} buffer
   * @returns {Promise<void>}
   */
 static async appendFile (file, buffer) {
  const directory = Path.dirname(file)
  if (!FS.existsSync(directory)) {
    FS.mkdirSync(directory)
  }

  return FS.promises.appendFile(file, buffer)
}
  /**
   * @param {string} name
   * @returns {Promise<Mutex>}
   */
  static async mutex(name) {
    return Mutex.acquire(name)
  }

  /**
   * @param {number} time
   * @returns {Promise<void>}
   */
  static async sleep (time) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, time)
    })
  }

  /**
   *
   * @param {string} file
   * @param {Buffer} buffer
   * @returns {Promise<void>}
   */
  static async writeFile (file, buffer) {
    const directory = Path.dirname(file)
    if (!FS.existsSync(directory)) {
      FS.mkdirSync(directory)
    }

    return FS.promises.writeFile(file, buffer)
  }
}

/**
 *
 */
class Mutex {
  /**
   * 
   * @param {string} name 
   * @returns {Promise<Mutex>}
   */
  static async acquire(name) {
    let mutex = Mutex.Locks[name]
    if (mutex) {
      await mutex.waitFor() 
      mutex.lock() 
    } else {
      mutex = new Mutex(name)
      Mutex.Locks[name] = mutex
    }

    return mutex
  }
  
  /**
   * @param {string} name 
   */
  constructor(name) {
    this.name = name
    this.lock()
  }

  /**
   * @returns {void}
   */
  lock() {
    /** @type {Promise<Mutex>} */
    this.onReleasePromise = new Promise((resolve) => {
      this.onRelease = resolve
    })
  }
  /**
   * @returns {void}
   */
  release() {
    delete Mutex.Locks[this.name]
    if (this.onRelease) {
      this.onRelease(this)
    }
  }

  /**
   * @returns {Promise<Mutex>}
   */
  async waitFor() {
    if (this.onReleasePromise) {
      await this.onReleasePromise
    }

    return this
  }

  
   
}

Mutex.Locks = {}

module.exports = Util
