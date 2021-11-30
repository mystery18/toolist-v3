// 作用：封装JSON.parse
function parse(str) {
  let value
  try {
    value = JSON.parse(str)
  } catch (error) {
    value = null
  }
  return value
}

// 作用：把对象转换成字符串，最终把这个字符串存储的localstorage
function stringify(obj){
  let value
  try {
    value = JSON.stringify(obj)
  } catch (error) {
    value = null
  }
  return value
}

export default function useLocalStorage () {
  // 设置本地存储
  function setItem (key, value) {
    value = stringify(value)
    window.localStorage.setItem(key, value)
  }
  // 从本地存储中获取值
  function getItem (key) {
    // 要先调用localstorage的getItem来获取数据
    let value = window.localStorage.getItem(key)
    if (value){
      value = parse(value)
    }
    return value
  }
  return {
    setItem,
    getItem
  }
}
