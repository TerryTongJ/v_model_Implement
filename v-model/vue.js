class Vue {
  constructor(obj_instance) {
    this.$data = obj_instance.data;
    Observe(this.$data);
    Compile(obj_instance.el, this);
  }
}
function Observe(data_instance) {
  console.log(Object.keys(data_instance));
  if (!data_instance || typeof data_instance !== "object") return;
  const dependency = new Dependency(); // 位置不能乱放
  Object.keys(data_instance).forEach((key) => {
    let value = data_instance[key];
    // 这里需要注意一下，使用defineProperty就会改变属性了，会让它变成一个存取器，
    // 所以我们get方法返回的值需要在define之前保存
    Observe(value);
    Object.defineProperty(data_instance, key, {
      enumerable: true,
      configurable: true,
      get() {
        console.log(`访问了：${key} -> 值: ${value}`);
        // 订阅者加入依赖实例的数组
        Dependency.temp && dependency.addSub(Dependency.temp);
        return value;
      },
      set(newValue) {
        console.log(`属性${key}的值${value}修改为-> ${newValue}`);
        value = newValue;
        Observe(newValue); //如果赋值了一个对象
        dependency.notify();
      },
    });
  });
}

function Compile(element, vm) {
  vm.$el = document.querySelector(element);
  const fragment = document.createDocumentFragment();
  let child;
  while ((child = vm.$el.firstChild)) {
    fragment.append(child);
  }
  fragment_compile(fragment);

  function fragment_compile(node) {
    const pattern = /\{\{\s*(\S+)\s*\}\}/;
    if (node.nodeType === 3) {
      // 先保存插值表达式，这样用于后面订阅者的解析，否则传入的数据不是插值表达式，会有其他结果
      const interpolationExp = node.nodeValue;
      // 只修改插值表达式的内容
      const res_reg = pattern.exec(node.nodeValue);
      if (res_reg) {
        const arr = res_reg[1].split(".");
        const value = arr.reduce((total, current) => total[current], vm.$data);
        node.nodeValue = node.nodeValue.replace(pattern, value);

        //创建订阅者，执行的时候需要根据新的属性值来更新
        new Watcher(vm, res_reg[1], (newValue) => {
          node.nodeValue = interpolationExp.replace(pattern, newValue);
        });
      }
      return;
    }
    if (node.nodeType === 1 && node.nodeName === "INPUT") {
      const attr = Array.from(node.attributes);
      console.log(attr);
      attr.forEach((i) => {
        if (i.nodeName === "v-model") {
          const value = i.nodeValue
            .split(".")
            .reduce((total, current) => total[current], vm.$data);
          node.value = value;
          new Watcher(vm, i.nodeValue, (newValue) => {
            node.value = newValue;
          });
          node.addEventListener("input", (e) => {
            const arr1 = i.nodeValue.split(".");
            const arr2 = arr1.slice(0, arr1.length - 1);
            const final = arr2.reduce(
              (total, current) => total[current],
              vm.$data
            );
            final[arr1[arr1.length - 1]] = e.target.value;
          });
        }
      });
    }
    node.childNodes.forEach((child) => fragment_compile(child));
  }
  vm.$el.appendChild(fragment);
}

// 依赖：收集和通知订阅者
class Dependency {
  constructor() {
    this.subscribers = [];
  }
  addSub(sub) {
    this.subscribers.push(sub);
  }
  notify() {
    this.subscribers.forEach((sub) => sub.update());
  }
}

// 订阅者
class Watcher {
  constructor(vm, key, callback) {
    this.vm = vm;
    this.key = key;
    this.callback = callback;
    // 临时属性，拿来触发get
    Dependency.temp = this;
    key.split(".").reduce((total, current) => total[current], vm.$data);
    Dependency.temp = null;
  }
  update() {
    const value = this.key
      .split(".")
      .reduce((total, current) => total[current], this.vm.$data);
    this.callback(value);// 这里回调穿的参数很重要
  }
}
