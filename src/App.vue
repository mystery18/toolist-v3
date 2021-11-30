<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
  <div class="myBox">
    <section class="todoapp">

      <!-- part1 -->
      <header class="header">
        <h1>todos</h1>
        <div class="todoInput">
          <input
            class="new-todo"
            placeholder="What needs to be done?"
            autocomplete="off"
            autofocus
            v-model="input"
            @keyup.enter="addTodo"
          />
        </div>
      </header>

      <!-- 当没有数据的时候，隐藏main和footer -->
      <!-- count是代办事项的总数，包括完成/未完成。且要是计算属性 -->
      <!-- part2 -->
      <section class="main" v-show="count">
        <!-- S=全选框 -->
        <input class="toggle-all" id="toggle-all" type="checkbox" v-model="allDown"/>
        <label for="toggle-all" v-show="todos.length" >Mark all as complete</label>
        <!-- E=全选框 -->
        <ul class="todo-list">
          <!-- todos 改成了 filteredTodos -->
          <li
            v-for="todo in filteredTodos"
            :key="todo"
            :class="{
              editing: todo === editingTodo,
              completed: todo.completed
            }"
          >
            <!-- checkbox-label-button -->
            <div class="view">
              <input type="checkbox" class="toggle" v-model="todo.completed" />
              <label @dblclick="editTodo(todo)">{{ todo.text }}</label>
              <button class="destroy" @click="remove(todo)"></button>
            </div>

            <!-- 编辑框 -->
            <div class="ed-box">
              <input
                type="text"
                class="edit"
                v-model="todo.text"
                @keyup.enter="doneEdite(todo)"
                @blur="doneEdite(todo)"
                @keyup.esc="cancelEdit(todo)"
                v-editing-focus="todo===editingTodo"
              />
            </div>
          </li>

        </ul>
      </section>

      <!-- part3 -->
      <footer class="footer" v-show="count">
        <!-- 未完成代办事项个数 -->
        <span class="todo-count"> <strong>{{ remainingCount }}</strong> {{ remainingCount>1?'items': 'item' }} left </span>
        <ul class="filter">
          <li><a href="#/all">All</a></li>
          <li><a href="#/active">Active</a></li>
          <li><a href="#/completed">Complete</a></li>
        </ul>
        <!-- 当有已完成的待办事项，才会显示这个按钮 -->
        <!-- 可以判断count的值是否大于remainingCount（总数>未完成数：才说明有已完成的项目） -->
        <button class="clear-complete" @click="removeCompleted" v-show="count>remainingCount">Clear completed</button>
      </footer>
    </section>

    <!-- <footer class="info">
      <p>Double-click to edit a todo</p>
      <p>Template by <a href="http://sindresorhus.com" target="_blank">Lazyload</a></p>
      <p>Created by <a href="http://sindresorhus.com" target="_blank">mystery18</a></p>
      <p>Part of <a href="http://todomov.com">TodoMVC</a></p>
    </footer> -->

  </div>
</template>

<script>
import { computed, ref, onMounted, onUnmounted, watchEffect } from "vue";
import useLocalStorage from './utils/useLocalStorage'

const storage = useLocalStorage()

// 1. 添加代办事项
// 这个箭头函数需要一个参数，这个参数是存放所有代办事项的数组，我们最终要把用户输入的代办事项，添加到在这个数组中
const useAdd = (todos) => {
  const input = ref(""); // 获取文本框的值
  const addTodo = () => {
    const text = input.value && input.value.trim(); // 判断value是否有值
    if (text.length === 0) return;
    // todos对象有2个属性 text和complete，分别是 存储内容和标识该项是否完成 默认false
    todos.value.unshift({
      text,
      completed: false,
    });
    input.value = "";
  };

  return {
    input,
    addTodo,
  };
};

// 2. 删除代办事项
const useRemove = (todos) => {
  const remove = (todo) => {
    // 找todo这一项在todos中的索引
    const index = todos.value.indexOf(todo);
    todos.value.splice(index, 1);
  };

  // 删除已完成的事项
  const removeCompleted = () => {
    // 返回的是未完成的待办事项
    todos.value = todos.value.filter(todo => !todo.completed )
  }

  return {
    remove,
    removeCompleted
  };
};

// 3. 编辑代办事项
const useEdit = (remove) => {
  // 要通过样式来控制文本框的显示和隐藏
  // 首先要定义2个数据。1. 记录当前编辑代办项的文本，取消编辑的时候，可以把文本还原给对应的todo对象，可以不需要是响应式对象
  let beforeEditingText = "";
  // 2. 记录当前是否是编辑状态？它变化的时候 界面上要控制文本框的显示隐藏
  const editingTodo = ref(null);

  // 双击时触发的函数
  const editTodo = (todo) => {
    if(todo.completed === true){
      alert('该事项已完成，无法编辑')
      return
    }
    beforeEditingText = todo.text;
    editingTodo.value = todo; // 这里用 穿过来的事项 记录当前的编辑状态
  };

  // （下面是input编辑框的事件）
  // 按下回车/失去焦点时触发的对象
  const doneEdite = (todo) => {
    if (!editingTodo.value) return; // 如果没有值就直接返回，没有要编辑的数据
    todo.text = todo.text.trim();
    todo.text || remove(todo); // 判断当前文本框是否有内容，如果没有内容，调用remove 删除这个事项
    editingTodo.value = null; // 编辑功能结束后，要把当前的编辑状态取消！！！
  };

  // 取消编辑 （编辑时按下ESC）
  const cancelEdit = (todo) => {
    if (!editingTodo.value) return; // 自己加的 我觉得上面enter要判断，那这里也要判断吧
    editingTodo.value = null; // 把编辑状态取消掉 置空
    todo.text = beforeEditingText; // 把todo中的文本还原成编辑前的文本
  };

  return {
    editingTodo, // 标记当前编辑的状态
    editTodo, // 双击时触发的函数 调出文本框
    doneEdite,
    cancelEdit,
  };
};

// 4. 切换待办项完成状态（点CheckBox）
const useFilter = todos => {
  const allDown = computed({
    // 在这个计算属性里面要传一个对象，然后分别设置getter和setter
    // 当渲染CheckBox的时候，会调用getter获取当前的状态，当点击CheckBox会调用setter，设置所有代办项的completed属性
    get(){
      // 如果当前todos中的*所有*待办事项都已经完成了，返回true。否则false
      return !todos.value.filter(todo => !todo.completed).length // true会返回，那!todo.completed 把未完成的return出来
      // 把符合条件的返回一个新的数组
      // 搞定了，所有待办项都完成会返回true，有未完成的会返回false
    },
    set(value){
      // 遍历所有的todos
      todos.value.forEach(todo => {
        // 找到每一个代办事项，把每一个待办事项的completed设置为:当前点击全选的CheckBox之后，传过来的选中状态value
        // 也就是说把全选框的状态传过来 赋给每一个子CheckBox 让他们保持一致
        todo.completed = value
      })
    }
  })


  const filter = {
    all: list => list,
    active: list => list.filter(todo=> !todo.completed ), // 获取所有未完成的待办事项
    completed: list => list.filter(todo => todo.completed)
  }
  const type = ref('all')
  const filteredTodos = computed(() => filter[type.value](todos.value))
  
  // filter.active返回的是未完成待办事项的列表,加个length个数
  const remainingCount = computed(() => filter.active(todos.value).length)
  const count = computed(() => todos.value.length)

  // 事件处理函数（点击a标签）
  const onHashChange = () => {
    // 首先要获取地址中的hash值(获取的是包含#和/ 要把他们去掉)
    const hash = window.location.hash.replace('#/', '')
    // 使用这个hash值去filter中找对应的过滤方法，找到的话直接把hash值赋给type
    // type是响应式数据，当type值发生变化，会重新渲染模板，此时当执行到v-for的时候，会调用计算属性
    if(filter[hash]) {
      type.value = hash
    }else{
      // 如果在filter找不到对应的过滤方法
      type.value = 'all'
      window.location.hash = ''
    }
  }
  // 当组件挂载后来注册onHashChange
  onMounted(() => {
    // 当触发hashchange事件时，调用onHashChange
    window.addEventListener('hashchange', onHashChange)
    // 并且页面首次加载的时候，也需要去执行onHashChange去加载todos数据
    onHashChange()
  })
  onUnmounted(() => {
    window.removeEventListener('hashchange', onHashChange)
  })



  return {
    allDown,
    filteredTodos,
    remainingCount,
    count
  }
}
// 所有跟切换状态相关的代码都放在这个函数中

// 5. 存储代办事项
const useStorage = () => {
  const KEY = 'TODOKEYS'
  const todos = ref(storage.getItem(KEY) || [] )

  watchEffect(() => {
    storage.setItem(KEY, todos.value)
  })
  return todos
}


export default {
  name: "App",
  setup() {
    // 存放代办事项的数组，也得是响应式的
    // const todos = ref([]);
    const todos = useStorage()
    const { remove, removeCompleted  } = useRemove(todos);

    return {
      todos,
      remove,
      removeCompleted,
      ...useAdd(todos), // 调用useAdd，因为useAdd返回的是一个对象，对象里的这两项要在模板使用，用...把它的返回值解构
      // ...useRemove(todos),
      ...useEdit(remove), // 我们需要remove函数
      ...useFilter(todos)
    };
  },
  directives: {
    editingFocus: (el, binding) => {
      binding.value && el.focus() //如果它的值是true的话，说明当前文本框是编辑文本框，此时直接调用el的focus
    }
  }
};
</script>





<style>
@import url("./assets/css/index.css");
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /* margin-top: 60px; */
}
</style>
